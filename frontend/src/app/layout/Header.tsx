import { CheckSquare, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme, useAuth } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { WorkspaceSelector } from '@/widgets/workspace-selector';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">Task Manager</span>
          </div>
          {isAuthenticated && <WorkspaceSelector />}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
