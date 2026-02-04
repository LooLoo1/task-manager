export interface WorkspaceDetails {
  id: number;
  name: string;
  description?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  projectsCount: number;
  membersCount: number;
  members?: WorkspaceMember[];
  createdAt: string;
}

export interface WorkspaceMember {
  id: number;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}
