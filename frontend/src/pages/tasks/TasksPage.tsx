import { useState } from 'react';
import { type Task, type TaskStatus, type TaskPriority } from '@/entities/task';
import { TaskForm, TaskCard, TaskFilters, TaskSearch, QuickStatusChange, type TaskFormData } from '@/features/task';
import { TaskDetails } from '@/widgets/task-details';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  PageSpinner,
  ConfirmDialog,
} from '@/shared/ui';
import { Plus, CheckSquare } from 'lucide-react';
import { useTasksData } from './hooks/useTasksData';
import { useTaskMutations } from './hooks/useTaskMutations';

const emptyForm: TaskFormData = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  projectId: '',
  userId: '',
  categoryId: '',
};

export function TasksPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(emptyForm);
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { tasks, projects, users, categories, isLoading } = useTasksData({
    statusFilter,
    projectFilter,
    categoryFilter,
    searchQuery,
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingTask(null);
    setIsCreateOpen(false);
  };
  const { createMutation, updateMutation, deleteMutation } = useTaskMutations(resetForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status as TaskStatus,
      priority: formData.priority as TaskPriority,
      dueDate: formData.dueDate || null,
      projectId: parseInt(formData.projectId),
      userId: parseInt(formData.userId),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
    };
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      projectId: task.projectId.toString(),
      userId: task.userId.toString(),
      categoryId: task.categoryId?.toString() || '',
    });
  };

  const canCreate = projects.length > 0 && users.length > 0;

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreate} onClick={() => setFormData(emptyForm)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <TaskForm
                formData={formData}
                setFormData={setFormData}
                projects={projects}
                users={users}
                categories={categories}
              />
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending || !formData.projectId || !formData.userId}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <TaskSearch value={searchQuery} onChange={setSearchQuery} />
        <TaskFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          projects={projects}
          categories={categories}
        />
      </div>

      {tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <CheckSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">{searchQuery ? 'No tasks found' : 'No tasks yet'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Try a different search'
                : !canCreate
                  ? 'Create a user and project first'
                  : 'Get started by creating a task'}
            </p>
            {!searchQuery && (
              <Button disabled={!canCreate} onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className="relative">
              <Dialog open={editingTask?.id === task.id} onOpenChange={(open) => !open && setEditingTask(null)}>
                <TaskCard
                  task={task}
                  onEdit={() => openEdit(task)}
                  onDelete={() => setDeletingTask(task)}
                  onClick={() => setViewingTask(task)}
                  isDeleting={false}
                />
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <TaskForm
                      formData={formData}
                      setFormData={setFormData}
                      projects={projects}
                      users={users}
                      categories={categories}
                    />
                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <div className="absolute bottom-3 right-3" onClick={(e) => e.stopPropagation()}>
                <QuickStatusChange taskId={task.id} currentStatus={task.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!viewingTask} onOpenChange={(open) => !open && setViewingTask(null)}>
        {viewingTask && <TaskDetails task={viewingTask} users={users} />}
      </Dialog>

      <ConfirmDialog
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        title="Delete Task"
        description={`Are you sure you want to delete "${deletingTask?.title}"?`}
        confirmText="Delete"
        onConfirm={() => {
          if (deletingTask) {
            deleteMutation.mutate(deletingTask.id);
          }
          setDeletingTask(null);
        }}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
