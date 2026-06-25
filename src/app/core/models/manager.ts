export type ManagerPermission = 'view-financials' | 'add-receipt';

export interface Manager {
  _id: string;
  name: string;
  email: string;
  role: 'manager';
  isActive: boolean;
  cameras: string[];
  owner?: string;
  createdAt: string;
}

export interface ManagerProject {
  _id: string;
  project: {
    _id: string;
    name: string;
    description?: string;
    photo?: string;
    status?: string;
    id?: string;
  };
  permissions: ManagerPermission[];
  manager?: string;
}
