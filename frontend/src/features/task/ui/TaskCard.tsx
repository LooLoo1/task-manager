import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/shared/ui';
import { FolderKanban, User, Calendar, MessageSquare, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, type Task } from '@/entities/task';
import { cn } from '@/shared/lib';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  isDeleting: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onClick, isDeleting }: TaskCardProps) {
  const StatusIcon = STATUS_CONFIG[task.status].icon;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const isDueSoon =
    task.dueDate &&
    !isOverdue &&
    new Date(task.dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000 &&
    task.status !== 'DONE';

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all cursor-pointer',
        isOverdue && 'border-red-300 bg-red-50/50',
        isDueSoon && 'border-amber-300 bg-amber-50/50'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {task.category && (
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: task.category.color }} />
              )}
              <CardTitle className="text-base truncate">{task.title}</CardTitle>
              {isOverdue && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
            </div>
            {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
          </div>
          <div
            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={STATUS_CONFIG[task.status].variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {STATUS_CONFIG[task.status].label}
          </Badge>
          <Badge variant="outline" className={PRIORITY_CONFIG[task.priority].class}>
            {PRIORITY_CONFIG[task.priority].label}
          </Badge>
          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          {isDueSoon && <Badge variant="warning">Due Soon</Badge>}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FolderKanban className="h-3 w-3" />
            {task.project?.name}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.user?.name}
          </div>
          {task.dueDate && (
            <div className={cn('flex items-center gap-1', isOverdue && 'text-red-600 font-medium')}>
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {task._count?.comments || 0}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
