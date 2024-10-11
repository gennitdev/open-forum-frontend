// Placeholder Auth0 Hooks
import config from "@/config";
export const useAuth0 = () => {
  return {
    isAuthenticated: true, // Placeholder value
    user: { 
      name: "Alice", 
      email: config.auth0username,
      username: 'cluse'
    }, // Placeholder value
    loginWithRedirect: () => console.log("Mock login"),
    login: () => console.log("Mock login"),
    logout: () => console.log("Mock logout"),
    isLoading: false, // Placeholder value
    error: null, // Placeholder value
  };
};

export default useAuth0;
