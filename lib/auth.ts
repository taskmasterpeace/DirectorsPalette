/**
 * Simple Email Authentication System
 * Admin-first approach: First user becomes admin
 */

export interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'user'
  createdAt: Date
  lastLogin: Date
  permissions: {
    canCreateProjects: boolean
    canManageUsers: boolean
    canAccessApiKeys: boolean
    canShareProjects: boolean
  }
}

export interface AuthSession {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
}

const AUTH_STORAGE_KEY = 'director-palette-auth'
const USERS_STORAGE_KEY = 'director-palette-users'

/**
 * Get current auth session
 */
export function getAuthSession(): AuthSession {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, isAdmin: false }
  }

  try {
    const sessionData = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!sessionData) {
      return { user: null, isAuthenticated: false, isAdmin: false }
    }

    const session = JSON.parse(sessionData)
    const user = session.user as User

    return {
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'admin'
    }
  } catch {
    return { user: null, isAuthenticated: false, isAdmin: false }
  }
}

/**
 * Get all users (admin only)
 */
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return []

  try {
    const usersData = localStorage.getItem(USERS_STORAGE_KEY)
    return usersData ? JSON.parse(usersData) : []
  } catch {
    return []
  }
}

/**
 * Check if any admin exists
 */
export function hasAdminUser(): boolean {
  const users = getAllUsers()
  return users.some(user => user.role === 'admin')
}

/**
 * Create first admin user
 */
export function createAdminUser(email: string, name?: string): User {
  const adminUser: User = {
    id: `user_${Date.now()}`,
    email: email.toLowerCase().trim(),
    name: name || email.split('@')[0],
    role: 'admin',
    createdAt: new Date(),
    lastLogin: new Date(),
    permissions: {
      canCreateProjects: true,
      canManageUsers: true,
      canAccessApiKeys: true,
      canShareProjects: true
    }
  }

  // Save to users list
  const users = getAllUsers()
  users.push(adminUser)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

  // Set as current session
  const session = {
    user: adminUser,
    loginTime: new Date().toISOString()
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))

  return adminUser
}

/**
 * Create regular user (admin only)
 */
export function createUser(email: string, name?: string, createdBy: string): User {
  const user: User = {
    id: `user_${Date.now()}`,
    email: email.toLowerCase().trim(),
    name: name || email.split('@')[0],
    role: 'user',
    createdAt: new Date(),
    lastLogin: new Date(),
    permissions: {
      canCreateProjects: true,
      canManageUsers: false,
      canAccessApiKeys: false,
      canShareProjects: true
    }
  }

  // Save to users list
  const users = getAllUsers()
  users.push(user)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

  return user
}

/**
 * Simple email validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Login user (simple email-only authentication for MVP)
 */
export function loginUser(email: string): { success: boolean; user?: User; error?: string } {
  if (!validateEmail(email)) {
    return { success: false, error: 'Invalid email format' }
  }

  const users = getAllUsers()
  const user = users.find(u => u.email === email.toLowerCase().trim())

  if (!user) {
    // If no admin exists, make this user admin
    if (!hasAdminUser()) {
      const adminUser = createAdminUser(email)
      return { success: true, user: adminUser }
    }
    
    return { success: false, error: 'User not found. Please contact admin for access.' }
  }

  // Update last login
  user.lastLogin = new Date()
  const userIndex = users.findIndex(u => u.id === user.id)
  users[userIndex] = user
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

  // Set session
  const session = {
    user,
    loginTime: new Date().toISOString()
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))

  return { success: true, user }
}

/**
 * Logout current user
 */
export function logoutUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

/**
 * Delete user (admin only)
 */
export function deleteUser(userId: string, deletedBy: string): boolean {
  const currentSession = getAuthSession()
  if (!currentSession.isAdmin) return false

  const users = getAllUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) return false
  
  // Don't allow deleting the last admin
  const admins = users.filter(u => u.role === 'admin')
  if (admins.length === 1 && users[userIndex].role === 'admin') {
    return false
  }

  users.splice(userIndex, 1)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  return true
}

/**
 * Update user permissions (admin only)
 */
export function updateUserPermissions(userId: string, permissions: Partial<User['permissions']>): boolean {
  const currentSession = getAuthSession()
  if (!currentSession.isAdmin) return false

  const users = getAllUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) return false
  
  users[userIndex].permissions = { ...users[userIndex].permissions, ...permissions }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  
  return true
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: keyof User['permissions']): boolean {
  const session = getAuthSession()
  if (!session.isAuthenticated || !session.user) return false
  
  return session.user.permissions[permission] || session.user.role === 'admin'
}

/**
 * Get user projects (filtered by permissions)
 */
export function getUserProjects(userId?: string): any[] {
  const session = getAuthSession()
  if (!session.isAuthenticated) return []

  // For now, return all projects (enhance with user-specific filtering later)
  try {
    const projects = localStorage.getItem('user-projects') || '[]'
    return JSON.parse(projects)
  } catch {
    return []
  }
}

/**
 * Save user project
 */
export function saveUserProject(projectData: any): boolean {
  const session = getAuthSession()
  if (!session.isAuthenticated) return false

  try {
    const projects = getUserProjects()
    const project = {
      id: `project_${Date.now()}`,
      userId: session.user!.id,
      name: projectData.name || 'Untitled Project',
      type: projectData.type || 'story',
      data: projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    projects.push(project)
    localStorage.setItem('user-projects', JSON.stringify(projects))
    return true
  } catch {
    return false
  }
}