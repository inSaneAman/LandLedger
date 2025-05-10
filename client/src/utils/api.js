// Get user role by wallet address
export const getUserRole = async (walletAddress) => {
    try {
        const response = await axios.get(`${API_URL}/api/users/role/${walletAddress}`);
        return response.data.role;
    } catch (error) {
        console.error('Error getting user role:', error);
        throw error;
    }
}; 