import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger, PageSpinner } from '@/shared/ui';
import { ToastContextProvider, ThemeProvider, AuthProvider, useAuth } from '@/shared/lib';
import { UsersPage, ProjectsPage, CategoriesPage, TasksPage } from '@/pages';
import { LoginPage, RegisterPage } from '@/pages/auth';
import { Dashboard } from '@/widgets/dashboard';
import { QueryProvider, ErrorBoundary } from './providers';
import { Header } from './layout';
import { Users, FolderKanban, Tags, CheckSquare, LayoutDashboard } from 'lucide-react';

function AuthenticatedApp() {
  const { isLoading, isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <PageSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      <main className="container py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="animate-fade-in">
            <Dashboard />
          </TabsContent>
          <TabsContent value="tasks" className="animate-fade-in">
            <TasksPage />
          </TabsContent>
          <TabsContent value="projects" className="animate-fade-in">
            <ProjectsPage />
          </TabsContent>
          <TabsContent value="categories" className="animate-fade-in">
            <CategoriesPage />
          </TabsContent>
          <TabsContent value="users" className="animate-fade-in">
            <UsersPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <ToastContextProvider>
            <AuthProvider>
              <AuthenticatedApp />
            </AuthProvider>
          </ToastContextProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
