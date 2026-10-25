export const rbacApi = {
  // Roles
  getRoles: async (): Promise<any> => {
    const api = useApi();
    return await api('/roles');
  },
  getRoleById: async (id: number): Promise<any> => {
    const api = useApi();
    return await api(`/roles/${id}`);
  },
  createRole: async (data: {
    name: string;
    displayName: string;
    description?: string;
    app?: string;
    permissionIds?: number[];
  }): Promise<any> => {
    const api = useApi();
    return await api('/roles', {
      method: 'POST',
      body: data,
    });
  },
  updateRole: async (
    id: number,
    data: {
      displayName?: string;
      description?: string;
      app?: string;
      permissionIds?: number[];
    }
  ): Promise<any> => {
    const api = useApi();
    return await api(`/roles/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  deleteRole: async (id: number): Promise<any> => {
    const api = useApi();
    return await api(`/roles/${id}`, {
      method: 'DELETE',
    });
  },
  assignRolePermissions: async (roleId: number, permissionIds: number[]): Promise<any> => {
    const api = useApi();
    return await api(`/roles/${roleId}/permissions`, {
      method: 'POST',
      body: { permissionIds },
    });
  },
  assignUserRole: async (userId: number, roleId: number): Promise<any> => {
    const api = useApi();
    return await api(`/roles/users/${userId}/assign`, {
      method: 'POST',
      body: { roleId },
    });
  },

  // Permissions
  getPermissions: async (): Promise<any> => {
    const api = useApi();
    return await api('/permissions');
  },
  createPermission: async (data: {
    name: string;
    description?: string;
    module?: string;
    app?: string;
  }): Promise<any> => {
    const api = useApi();
    return await api('/permissions', {
      method: 'POST',
      body: data,
    });
  },
  updatePermission: async (
    id: number,
    data: {
      description?: string;
      module?: string;
      app?: string;
    }
  ): Promise<any> => {
    const api = useApi();
    return await api(`/permissions/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  deletePermission: async (id: number): Promise<any> => {
    const api = useApi();
    return await api(`/permissions/${id}`, {
      method: 'DELETE',
    });
  },

  // Users & Access
  getUsers: async (page = 1, limit = 15, search = ""): Promise<any> => {
    const api = useApi();
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    return await api(`/users?${query.toString()}`);
  },
  assignPermissions: async (userId: number | string, permissionIds: number[]): Promise<any> => {
    const api = useApi();
    return await api(`/permissions/${userId}/assign`, {
      method: 'POST',
      body: { permissionIds }
    });
  },
  sendForgotPasswordEmail: async (email: string): Promise<any> => {
    const api = useApi();
    return await api('/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });
  }
};
