import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/shared/ui';
import { CheckSquare, User, Pencil, Trash2 } from 'lucide-react';
import type { Project } from '@/entities/project';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ProjectCard({ project, onEdit, onDelete, isDeleting }: ProjectCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            {project.description && <CardDescription className="line-clamp-2">{project.description}</CardDescription>}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            {project.user?.name}
          </div>
          <Badge variant="secondary" className="gap-1">
            <CheckSquare className="h-3 w-3" />
            {project._count?.tasks || 0} tasks
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
