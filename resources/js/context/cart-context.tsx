import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Types
interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    rating_count: number;
    note: string;
    category: {
        id: number;
        name: string;
        slug: string;
    };
}

interface CartItem {
    id: string; // For localStorage, we'll use generated IDs
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalValue: number;
    isLoading: boolean;
}

interface CartContextType {
    state: CartState;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getItemQuantity: (productId: number) => number;
}

// Cart Actions
type CartAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; payload: CartItem[] };

// Initial state
const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalValue: 0,
    isLoading: false,
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'ADD_ITEM': {
            const { product, quantity } = action.payload;
            const existingItemIndex = state.items.findIndex(
                item => item.product.id === product.id
            );

            let newItems: CartItem[];
            if (existingItemIndex >= 0) {
                // Update existing item
                newItems = state.items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Add new item
                const newItem: CartItem = {
                    id: `${product.id}-${Date.now()}`,
                    product,
                    quantity,
                };
                newItems = [...state.items, newItem];
            }

            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalValue = newItems.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
            );

            return { ...state, items: newItems, totalItems, totalValue };
        }

        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(item => item.id !== action.payload);
            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalValue = newItems.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
            );

            return { ...state, items: newItems, totalItems, totalValue };
        }

        case 'UPDATE_QUANTITY': {
            const { id, quantity } = action.payload;

            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                return cartReducer(state, { type: 'REMOVE_ITEM', payload: id });
            }

            const newItems = state.items.map(item =>
                item.id === id ? { ...item, quantity } : item
            );

            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalValue = newItems.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
            );

            return { ...state, items: newItems, totalItems, totalValue };
        }

        case 'CLEAR_CART':
            return { ...state, items: [], totalItems: 0, totalValue: 0 };

        case 'LOAD_CART': {
            const items = action.payload;
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalValue = items.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
            );

            return { ...state, items, totalItems, totalValue };
        }

        default:
            return state;
    }
}

// Cart Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage helpers
const CART_STORAGE_KEY = 'lixnet-cart';

const saveCartToStorage = (items: CartItem[]) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.warn('Failed to save cart to localStorage:', error);
    }
};

const loadCartFromStorage = (): CartItem[] => {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Failed to load cart from localStorage:', error);
        return [];
    }
};

// Cart Provider
interface CartProviderProps {
    children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = loadCartFromStorage();
        if (savedCart.length > 0) {
            dispatch({ type: 'LOAD_CART', payload: savedCart });
        }
    }, []);

    // Save cart to localStorage whenever items change
    useEffect(() => {
        saveCartToStorage(state.items);
    }, [state.items]);

    const addItem = (product: Product, quantity = 1) => {
        dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    };

    const removeItem = (itemId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getItemQuantity = (productId: number): number => {
        const item = state.items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    };

    const value: CartContextType = {
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
