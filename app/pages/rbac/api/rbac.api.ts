export const rbacApi = {
  getPermissions: async (): Promise<any> => {
    const api = useApi();
    return await api('/permissions');
  },
  getUsers: async (): Promise<any> => {
    const api = useApi();
    return await api('/users'); // Uses existing users route
  },
  assignPermissions: async (userId: string, permissionIds: number[]): Promise<any> => {
    const api = useApi();
    return await api(`/permissions/${userId}/assign`, {
      method: 'POST',
      body: { permissionIds }
    });
  }
};
