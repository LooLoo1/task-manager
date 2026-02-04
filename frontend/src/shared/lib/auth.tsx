import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiClient } from '@/shared/api';
import type { AuthUser, Workspace } from '@/entities/auth';

interface AuthContextType {
  user: AuthUser | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser, workspaces: Workspace[]) => void;
  logout: () => void;
  setCurrentWorkspace: (workspace: Workspace) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((newToken: string, newUser: AuthUser, newWorkspaces: Workspace[]) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setWorkspaces(newWorkspaces);
    if (newWorkspaces.length > 0) {
      const savedWsId = localStorage.getItem('workspaceId');
      const savedWs = savedWsId ? newWorkspaces.find((w) => w.id === parseInt(savedWsId)) : null;
      setCurrentWorkspaceState(savedWs || newWorkspaces[0]);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('workspaceId');
    setToken(null);
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspaceState(null);
  }, []);

  const setCurrentWorkspace = useCallback((workspace: Workspace) => {
    localStorage.setItem('workspaceId', workspace.id.toString());
    setCurrentWorkspaceState(workspace);
  }, []);

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      apiClient
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          setWorkspaces(res.data.workspaces);
          if (res.data.workspaces.length > 0) {
            const savedWsId = localStorage.getItem('workspaceId');
            const savedWs = savedWsId ? res.data.workspaces.find((w: Workspace) => w.id === parseInt(savedWsId)) : null;
            setCurrentWorkspaceState(savedWs || res.data.workspaces[0]);
          }
        })
        .catch(() => logout())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (currentWorkspace) {
      apiClient.defaults.headers.common['X-Workspace-Id'] = currentWorkspace.id.toString();
    }
  }, [currentWorkspace]);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        token,
        isLoading,
        isAuthenticated: !!user && !!currentWorkspace,
        login,
        logout,
        setCurrentWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
