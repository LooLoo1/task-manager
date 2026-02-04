import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, type Project } from '@/entities/project';
import { userApi } from '@/entities/user';
import { ProjectForm, ProjectCard } from '@/features/project';
import { useToast, useAuth } from '@/shared/lib';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  PageSpinner,
  ConfirmDialog,
} from '@/shared/ui';
import { Plus, FolderKanban } from 'lucide-react';

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { currentWorkspace, user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', userId: '' });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', currentWorkspace?.id],
    queryFn: projectApi.getAll,
    enabled: !!currentWorkspace,
  });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: userApi.getAll });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; userId: number }) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentWorkspace?.id] });
      setIsCreateOpen(false);
      resetForm();
      success('Project created successfully');
    },
    onError: () => error('Failed to create project'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string } }) =>
      projectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentWorkspace?.id] });
      setEditingProject(null);
      resetForm();
      success('Project updated successfully');
    },
    onError: () => error('Failed to update project'),
  });

  const deleteMutation = useMutation({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentWorkspace?.id] });
      setDeletingProject(null);
      success('Project deleted successfully');
    },
    onError: () => error('Failed to delete project'),
  });

  const resetForm = () => setFormData({ name: '', description: '', userId: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate({
        id: editingProject.id,
        data: { name: formData.name, description: formData.description || undefined },
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        description: formData.description || undefined,
        userId: user!.id,
      });
    }
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '', userId: project.userId.toString() });
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Organize your work into projects</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button disabled={users.length === 0} onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              formData={formData}
              setFormData={setFormData}
              users={users}
              onSubmit={handleSubmit}
              isPending={createMutation.isPending}
              submitLabel="Create"
            />
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FolderKanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {users.length === 0 ? 'Create a user first' : 'Get started by creating a project'}
            </p>
            <Button disabled={users.length === 0} onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Dialog
              key={project.id}
              open={editingProject?.id === project.id}
              onOpenChange={(open) => !open && setEditingProject(null)}
            >
              <ProjectCard
                project={project}
                onEdit={() => openEdit(project)}
                onDelete={() => setDeletingProject(project)}
                isDeleting={false}
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                </DialogHeader>
                <ProjectForm
                  formData={formData}
                  setFormData={setFormData}
                  users={users}
                  onSubmit={handleSubmit}
                  isPending={updateMutation.isPending}
                  submitLabel="Save"
                  showUserSelect={false}
                />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deletingProject?.name}"? All tasks in this project will also be deleted.`}
        confirmText="Delete"
        onConfirm={() => deletingProject && deleteMutation.mutate(deletingProject.id)}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
