import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi, type Category } from '@/entities/category';
import { CategoryForm, CategoryCard } from '@/features/category';
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
import { Plus, Tags } from 'lucide-react';

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { currentWorkspace } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#6366f1' });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', currentWorkspace?.id],
    queryFn: categoryApi.getAll,
    enabled: !!currentWorkspace,
  });

  const createMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentWorkspace?.id] });
      setIsCreateOpen(false);
      resetForm();
      success('Category created successfully');
    },
    onError: () => error('Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; color?: string } }) => categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentWorkspace?.id] });
      setEditingCategory(null);
      resetForm();
      success('Category updated successfully');
    },
    onError: () => error('Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentWorkspace?.id] });
      setDeletingCategory(null);
      success('Category deleted successfully');
    },
    onError: () => error('Failed to delete category'),
  });

  const resetForm = () => setFormData({ name: '', color: '#6366f1' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Organize tasks with color-coded categories</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isPending={createMutation.isPending}
              submitLabel="Create"
            />
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Tags className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No categories yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create categories to organize your tasks</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Dialog
              key={category.id}
              open={editingCategory?.id === category.id}
              onOpenChange={(open) => !open && setEditingCategory(null)}
            >
              <CategoryCard
                category={category}
                onEdit={() => openEdit(category)}
                onDelete={() => setDeletingCategory(category)}
                isDeleting={false}
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Category</DialogTitle>
                </DialogHeader>
                <CategoryForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isPending={updateMutation.isPending}
                  submitLabel="Save"
                />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? Tasks using this category will be uncategorized.`}
        confirmText="Delete"
        onConfirm={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
