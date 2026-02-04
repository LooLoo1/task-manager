import {
  Button,
  Input,
  Label,
  Textarea,
  DialogFooter,
  DialogClose,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import type { User } from '@/entities/user';

interface ProjectFormData {
  name: string;
  description: string;
  userId: string;
}

interface ProjectFormProps {
  formData: ProjectFormData;
  setFormData: (data: ProjectFormData) => void;
  users: User[];
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  submitLabel: string;
  showUserSelect?: boolean;
}

export function ProjectForm({
  formData,
  setFormData,
  users,
  onSubmit,
  isPending,
  submitLabel,
  showUserSelect = true,
}: ProjectFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Project name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Project description (optional)"
          rows={3}
        />
      </div>
      {showUserSelect && (
        <div className="space-y-2">
          <Label>Owner</Label>
          <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select owner" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending || (showUserSelect && !formData.userId)}>
          {isPending ? 'Saving...' : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
