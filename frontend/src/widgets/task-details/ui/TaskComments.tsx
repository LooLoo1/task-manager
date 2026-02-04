import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi, type Comment } from '@/entities/comment';
import type { User } from '@/entities/user';
import { useToast } from '@/shared/lib';
import {
  Button,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ConfirmDialog,
} from '@/shared/ui';
import { MessageSquare, Trash2 } from 'lucide-react';

interface TaskCommentsProps {
  taskId: number;
  comments: Comment[];
  users: User[];
}

export function TaskComments({ taskId, comments, users }: TaskCommentsProps) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [newComment, setNewComment] = useState('');
  const [commentUserId, setCommentUserId] = useState('');
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);

  const createComment = useMutation({
    mutationFn: commentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setNewComment('');
      success('Comment added');
    },
    onError: () => error('Failed to add comment'),
  });

  const deleteComment = useMutation({
    mutationFn: commentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setDeletingComment(null);
      success('Comment deleted');
    },
    onError: () => error('Failed to delete comment'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
      </div>
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{comment.user?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => setDeletingComment(comment)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>}
      </div>
      <div className="space-y-2 pt-2 border-t">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
        />
        <div className="flex gap-2">
          <Select value={commentUserId} onValueChange={setCommentUserId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Comment as..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={!newComment.trim() || !commentUserId || createComment.isPending}
            onClick={() => createComment.mutate({ content: newComment, taskId, userId: parseInt(commentUserId) })}
          >
            {createComment.isPending ? 'Adding...' : 'Add Comment'}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deletingComment}
        onOpenChange={(open) => !open && setDeletingComment(null)}
        title="Delete Comment"
        description="Are you sure you want to delete this comment?"
        confirmText="Delete"
        onConfirm={() => deletingComment && deleteComment.mutate(deletingComment.id)}
        variant="destructive"
        isLoading={deleteComment.isPending}
      />
    </div>
  );
}
