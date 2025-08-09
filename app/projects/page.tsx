"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProjectManager } from "@/components/project-manager"

export default function ProjectsPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true) // auto-open to make loading projects quick

  useEffect(() => {
    // Close modal on route change (safety)
    return () => setOpen(false)
  }, [])

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-amber-400" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-300">
            Open an existing project or create a new one. After selecting a project, you will be taken to Home.
          </p>
          <Button
            variant="secondary"
            className="bg-slate-800 hover:bg-slate-700 text-white"
            onClick={() => setOpen(true)}
          >
            Open Project Manager
          </Button>
        </CardContent>
      </Card>

      {open && (
        <ProjectManager
          isOpen={open}
          onClose={() => setOpen(false)}
          onProjectSelect={(projectId) => {
            try {
              localStorage.setItem("dsvb:navigateToProjectId", projectId)
            } catch {}
            router.push("/")
          }}
        />
      )}
    </div>
  )
}
