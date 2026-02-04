import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/shared/ui';
import { CheckSquare, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/entities/category';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function CategoryCard({ category, onEdit, onDelete, isDeleting }: CategoryCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
      <div className="h-2" style={{ backgroundColor: category.color }} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
            <CardTitle className="text-base">{category.name}</CardTitle>
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
        <Badge variant="secondary" className="gap-1">
          <CheckSquare className="h-3 w-3" />
          {category._count?.tasks || 0} tasks
        </Badge>
      </CardContent>
    </Card>
  );
}
