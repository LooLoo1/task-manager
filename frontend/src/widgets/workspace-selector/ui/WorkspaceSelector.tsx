import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '@/entities/workspace';
import { useAuth, useToast } from '@/shared/lib';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '@/shared/ui';
import { ChevronDown, Plus, Building2, Users, UserPlus, Settings, Crown, Shield, User } from 'lucide-react';

export function WorkspaceSelector() {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

  const { data: workspaceDetails } = useQuery({
    queryKey: ['workspace', currentWorkspace?.id],
    queryFn: () => workspaceApi.getById(currentWorkspace!.id),
    enabled: !!currentWorkspace && isMembersOpen,
  });

  const createMutation = useMutation({
    mutationFn: workspaceApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setCurrentWorkspace({ id: data.id, name: data.name, role: 'OWNER' });
      setIsCreateOpen(false);
      setNewWorkspaceName('');
      success('Workspace created');
      window.location.reload();
    },
    onError: () => error('Failed to create workspace'),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: 'ADMIN' | 'MEMBER' }) =>
      workspaceApi.invite(currentWorkspace!.id, { email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', currentWorkspace?.id] });
      setInviteEmail('');
      success('Invitation sent successfully');
    },
    onError: (err: Error) => error('Failed to invite', err.message),
  });

  if (!currentWorkspace) return null;

  const roleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-3 w-3" />;
      case 'ADMIN':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const canManageMembers = currentWorkspace.role === 'OWNER' || currentWorkspace.role === 'ADMIN';

  return (
    <>
      <div className="relative">
        <Button variant="ghost" className="gap-2" onClick={() => setIsOpen(!isOpen)}>
          <Building2 className="h-4 w-4" />
          <span className="max-w-[150px] truncate">{currentWorkspace.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-72 bg-background border rounded-lg shadow-lg z-50 p-2">
              <p className="text-xs text-muted-foreground px-2 py-1">Switch workspace</p>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted ${ws.id === currentWorkspace.id ? 'bg-muted' : ''}`}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                    window.location.reload();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ws.name}</span>
                    <Badge variant="outline" className="text-xs gap-1">
                      {roleIcon(ws.role)}
                      {ws.role}
                    </Badge>
                  </div>
                </button>
              ))}
              <hr className="my-2" />
              {canManageMembers && (
                <button
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted flex items-center gap-2"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMembersOpen(true);
                  }}
                >
                  <Users className="h-4 w-4" />
                  Manage Members
                </button>
              )}
              <button
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted flex items-center gap-2"
                onClick={() => {
                  setIsOpen(false);
                  setIsCreateOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Create workspace
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workspace Name</Label>
              <Input
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="My Workspace"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => createMutation.mutate({ name: newWorkspaceName })}
              disabled={!newWorkspaceName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Workspace Members
            </DialogTitle>
          </DialogHeader>

          {/* Invite Section */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </h4>
              <div className="flex gap-2">
                <Input
                  placeholder="user@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'ADMIN' | 'MEMBER')}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                  disabled={!inviteEmail.trim() || inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? '...' : 'Invite'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                User must be registered. They will see this workspace in their list.
              </p>
            </div>

            {/* Members List */}
            <div>
              <h4 className="font-medium mb-3">Current Members ({workspaceDetails?.members?.length || 0})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {workspaceDetails?.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant={member.role === 'OWNER' ? 'default' : 'outline'} className="gap-1">
                      {roleIcon(member.role)}
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
