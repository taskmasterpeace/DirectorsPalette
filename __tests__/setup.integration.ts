import { beforeAll, afterAll } from 'vitest'
import dotenv from 'dotenv'

// Load environment variables for testing
dotenv.config({ path: '.env.test' })

beforeAll(() => {
  // Set up test environment
  console.log('🧪 Starting integration tests...')
  
  // Verify API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not found - some tests may fail')
  }
})

afterAll(() => {
  console.log('✅ Integration tests completed')
})