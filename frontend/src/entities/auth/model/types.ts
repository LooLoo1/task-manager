export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface Workspace {
  id: number;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  workspaces: Workspace[];
}

export interface RegisterResponse {
  user: AuthUser;
  token: string;
  workspace: { id: number; name: string };
}
