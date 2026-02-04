import { useQuery } from '@tanstack/react-query';
import { userApi, type User } from '@/entities/user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, PageSpinner } from '@/shared/ui';
import { Users, Mail } from 'lucide-react';

export function UsersPage() {
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: userApi.getAll });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">All registered users in the system</p>
      </div>

      {users.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No users yet</h3>
            <p className="text-sm text-muted-foreground">Users will appear here after registration</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <UserItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserItem({ user }: { user: User }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base truncate">{user.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 truncate">
              <Mail className="h-3 w-3" />
              {user.email}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );
}
