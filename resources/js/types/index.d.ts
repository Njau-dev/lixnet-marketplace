import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    count?: number;
    error?: string;
}

// Product Related Types
export interface Category {
    id: number;
    name: string;
    slug: string;
    products_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: number;
    category_id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    rating_count: number;
    note: string;
    created_at?: string;
    updated_at?: string;
    category: Category;
    formatted_price?: string;
}

// Cart Related Types
export interface CartItem {
    id: string; // For localStorage: generated ID, for API: actual cart_item id
    product: Product;
    quantity: number;
    created_at?: string;
    updated_at?: string;
}

export interface Cart {
    id?: number;
    user_id?: number;
    session_id?: string;
    items: CartItem[];
    total_items: number;
    total_value: number;
    created_at?: string;
    updated_at?: string;
}


// Search and Filter Types
export interface SearchParams {
    q?: string;
    category?: string | number;
    sort_by?: 'title' | 'price' | 'rating' | 'created_at';
    sort_order?: 'asc' | 'desc';
}

// Component Props Types
export interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    className?: string;
}

export interface MarketplaceHeaderProps {
    categories: Category[];
    onSearch: (query: string) => void;
    onCategoryFilter: (categoryId: string) => void;
    onCartClick: () => void;
    onLoginClick: () => void;
}

export interface MarketplaceLayoutProps {
    children: React.ReactNode;
    onSearch?: (query: string) => void;
    onCategoryFilter?: (categoryId: string) => void;
    onCartClick?: () => void;
    onLoginClick?: () => void;
}

// Form Types
export interface LoginForm {
    email: string;
    password: string;
    remember?: boolean;
}

export interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

// Error Types
export interface ValidationError {
    field: string;
    message: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

// WhatsApp Message Types
export interface WhatsAppMessageData {
    businessNumber: string;
    items: CartItem[];
    totalValue: number;
    customerMessage?: string;
}

// Local Storage Keys
export const STORAGE_KEYS = {
    CART: 'lixnet-cart',
    THEME: 'lixnet-theme',
    USER_PREFERENCES: 'lixnet-preferences',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    // Public endpoints
    PRODUCTS: '/api/products',
    PRODUCTS_SEARCH: '/api/products/search',
    PRODUCTS_FILTER: '/api/products/filter',
    PRODUCTS_FEATURED: '/api/products/featured',
    CATEGORIES: '/api/categories',

    // Auth endpoints
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    USER: '/api/user',

    // Cart endpoints (auth required)
    CART: '/api/cart',
    CART_ADD: '/api/cart/add',
    CART_UPDATE: '/api/cart/items',
    CART_REMOVE: '/api/cart/items',
    CART_CLEAR: '/api/cart/clear',
} as const;
