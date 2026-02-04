import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, STATUS_CONFIG, type TaskStatus } from '@/entities/task';
import { useToast } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { ArrowRight } from 'lucide-react';

interface QuickStatusChangeProps {
  taskId: number;
  currentStatus: TaskStatus;
}

const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export function QuickStatusChange({ taskId, currentStatus }: QuickStatusChangeProps) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const updateStatus = useMutation({
    mutationFn: (status: TaskStatus) => taskApi.update(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Status updated');
    },
    onError: () => error('Failed to update status'),
  });

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const nextStatus = STATUS_ORDER[currentIndex + 1];

  if (!nextStatus) return null;

  const NextIcon = STATUS_CONFIG[nextStatus].icon;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        updateStatus.mutate(nextStatus);
      }}
      disabled={updateStatus.isPending}
      className="gap-1 h-7 text-xs"
    >
      <ArrowRight className="h-3 w-3" />
      <NextIcon className="h-3 w-3" />
      {STATUS_CONFIG[nextStatus].label}
    </Button>
  );
}
