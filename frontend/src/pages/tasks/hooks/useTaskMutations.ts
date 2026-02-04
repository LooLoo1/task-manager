import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, type CreateTaskDto, type UpdateTaskDto } from '@/entities/task';
import { useToast, useAuth } from '@/shared/lib';

export function useTaskMutations(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { currentWorkspace } = useAuth();

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentWorkspace?.id] });
      onSuccess();
      success('Task created successfully');
    },
    onError: () => error('Failed to create task'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskDto }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentWorkspace?.id] });
      onSuccess();
      success('Task updated successfully');
    },
    onError: () => error('Failed to update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', currentWorkspace?.id] });
      success('Task deleted successfully');
    },
    onError: () => error('Failed to delete task'),
  });

  return { createMutation, updateMutation, deleteMutation };
}
