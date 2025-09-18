import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { router } from "@inertiajs/react";
import { useCart } from "./cart-context";

// Types
interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    phone?: string;
    company?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (
        name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios global setup
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.common["Accept"] = "application/json"; // Force JSON responses

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated = !!user;
    const { syncLocalCartToDatabase, loadCart } = useCart();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/user", {
                headers: { Accept: "application/json" },
            });
            setUser(response.data);

            // Sync cart when user is authenticated
            await loadCart(true);
        } catch (error: any) {
            console.error("checkAuth error:", error.response?.data || error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };


    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);

            // CSRF cookie
            await axios.get("/sanctum/csrf-cookie");

            // Login request
            await axios.post("/login", { email, password });
            toast.success("Logged in successfully!");

            router.visit("/");

            await syncLocalCartToDatabase();
        } catch (error: any) {
            setUser(null);
            const message =
                error.response?.data?.message || "Login failed. Please try again.";
            toast.error(message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };


    const register = async (
        name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => {
        try {
            setIsLoading(true);

            await axios.get("/sanctum/csrf-cookie");

            await axios.post("/register", {
                name,
                email,
                password,
                password_confirmation,
            });

            await checkAuth();
            toast.success("Account created successfully!");

            router.visit("/");

        } catch (error: any) {
            setUser(null);
            const message =
                error.response?.data?.message ||
                "Registration failed. Please try again.";
            toast.error(message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };


    const logout = async () => {
        try {
            setIsLoading(true);
            await axios.post("/logout");

            setUser(null);
            router.visit("/login");

            toast.success("Logged out successfully!");
        } catch (error) {
            console.warn("Logout failed:", error);
            setUser(null);
            router.visit("/login");

            toast.error("Logout failed. Session cleared.");
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
