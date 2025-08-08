import React from "react";
import { EmptyState } from "@/components/empty-state";
import { FolderOpen } from 'lucide-react';

interface ProjectManagerProps {
  projects: any[];
  onNewProject: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onNewProject }) => {
  return (
    <div>
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project to save and revisit your breakdowns."
          primaryAction={{ label: "New Project", onClick: onNewProject }}
          icon={<FolderOpen className="h-12 w-12" />}
        />
      ) : (
        <div>
          {/* existing projects map */}
          {projects.map((project) => (
            <div key={project.id}>{project.name}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
