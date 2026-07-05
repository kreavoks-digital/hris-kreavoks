export const rbacApi = {
  getPermissions: async (): Promise<any> => {
    const api = useApi();
    return await api('/permissions');
  },
  getUsers: async (page = 1, limit = 15, search = ""): Promise<any> => {
    const api = useApi();
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    return await api(`/users?${query.toString()}`);
  },
  assignPermissions: async (userId: string, permissionIds: number[]): Promise<any> => {
    const api = useApi();
    return await api(`/permissions/${userId}/assign`, {
      method: 'POST',
      body: { permissionIds }
    });
  }
};
