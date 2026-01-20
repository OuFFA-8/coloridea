// core/models/project.ts
export type ProjectStatus = 'active' | 'pending' | 'completed';

export interface Project {
  id: number;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
}
