export type ProjectStatus = 'active' | 'completed' | 'pending';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  clientId: number;
}
