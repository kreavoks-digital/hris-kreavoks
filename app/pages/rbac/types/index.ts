export interface RoleItem {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  app: string;
  usersCount?: number;
  permissionsCount?: number;
  permissions?: PermissionItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionItem {
  id: number;
  name: string;
  displayName?: string | null;
  description: string | null;
  module: string;
  app: string;
  _count?: {
    roles?: number;
    users?: number;
  };
}

export interface RbacUserItem {
  id: number;
  email: string;
  role: string;
  customRoleId?: number | null;
  customRole?: {
    id: number;
    name: string;
    displayName: string;
  } | null;
  status: string;
  isActive: boolean;
  fullName: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  npk?: string | null;
  permissions?: PermissionItem[];
}
