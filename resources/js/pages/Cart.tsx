import { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, Briefcase, PiggyBank, GraduationCap, Calculator, Truck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/context/cart-context';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';

interface CartPageProps {
    onContinueShopping?: () => void;
}

export default function Cart({ onContinueShopping }: CartPageProps) {
    const { state, updateQuantity, removeItem, clearCart } = useCart();
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

    const formatPrice = (price: number) => {
        return `KSh ${price.toLocaleString()}`;
    };

    const generateWhatsAppMessage = () => {
        if (state.items.length === 0) return '';

        const businessNumber = '254752821282'; // Replace with actual WhatsApp Business number
        let message = '🛒 *Lixnet Software Inquiry*\n\n';
        message += 'Hello! I\'m interested in the following software solutions:\n\n';

        state.items.forEach((item, index) => {
            message += `${index + 1}. *${item.product.title}*\n`;
            message += `   • Quantity: ${item.quantity}\n`;
            message += `   • Price: ${formatPrice(item.product.price)}/month\n`;
            message += `   • Subtotal: ${formatPrice(item.product.price * item.quantity)}/month\n\n`;
        });

        message += `💰 *Total: ${formatPrice(state.totalValue)}/month*\n\n`;
        message += 'Could you please provide more information about:\n';
        message += '• Setup process and timeline\n';
        message += '• Training and support options\n';
        message += '• Any available discounts\n\n';
        message += 'Thank you!';

        return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
    };

    const handleWhatsAppCheckout = () => {
        setIsGeneratingMessage(true);

        // Simulate a small delay for better UX
        setTimeout(() => {
            const whatsappUrl = generateWhatsAppMessage();
            window.open(whatsappUrl, '_blank');
            setIsGeneratingMessage(false);
        }, 500);
    };

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItem(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleContinueShopping = () => {
        onContinueShopping?.();
    };

    function getProductIcon(categoryName: string) {
        const iconMap: { [key: string]: JSX.Element } = {
            'Payroll & HR': <Briefcase className='size-8 text-brand-blue' />,
            'SACCO Management': <PiggyBank className='size-8 text-brand-blue' />,
            'School Management': <GraduationCap className='size-8 text-brand-blue' />,
            'POS Systems': <ShoppingBag className='size-8 text-brand-blue' />,
            'Accounting': <Calculator className='size-8 text-brand-blue' />,
            'Inventory': <Truck className='size-8 text-brand-blue' />,
        };

        // Find matching category or default
        const iconClass = Object.entries(iconMap).find(([key]) =>
            categoryName.toLowerCase().includes(key.toLowerCase())
        )?.[1] || <Briefcase />;

        return iconClass;
    }

    if (state.items.length === 0) {
        return (
            <MarketplaceLayout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">
                            Discover our software solutions and add them to your cart.
                        </p>
                        <Button
                            onClick={handleContinueShopping}
                            className="bg-dark-blue text-card-color hover:bg-[#001a33] hover:text-card-color"
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-dark-blue">Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">
                        {state.totalItems} item{state.totalItems !== 1 ? 's' : ''} in your cart
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <Card className='bg-card-color text-text-dark border border-border-color'>
                            <CardHeader className="flex flex-row items-center justify-between ">
                                <CardTitle>Cart Items</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearCart}
                                    className="bg-background-color border border-border-color text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear Cart
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {state.items.map((item, index) => (
                                    <div key={item.id}>
                                        {index > 0 && <Separator className="my-4 bg-border-color" />}

                                        <div className="flex items-start space-x-4">
                                            {/* Product Icon */}
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-white rounded-lg flex items-center justify-center border border-border-color">
                                                {getProductIcon(item.product.category.name)}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-dark-blue mb-1">
                                                    {item.product.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                                                    {item.product.description}
                                                </p>
                                                <Badge variant="secondary" className="text-xs bg-background-color text-text-dark border border-border-color">
                                                    {item.product.category.name}
                                                </Badge>
                                                {item.product.note && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.product.note}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price and Quantity */}
                                            <div className="text-right space-y-2">
                                                <div className="font-semibold text-dark-blue">
                                                    {formatPrice(item.product.price)}/mo
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 p-0 bg-background-color border border-border-color"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>

                                                    <span className="w-8 text-center font-medium">
                                                        {item.quantity}
                                                    </span>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 p-0 bg-background-color border border-border-color"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>

                                                {/* Subtotal */}
                                                <div className="text-sm text-gray-500">
                                                    Subtotal: {formatPrice(item.product.price * item.quantity)}/mo
                                                </div>

                                                {/* Remove Button */}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4 bg-card-color border border-border-color text-gray-900">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Items ({state.totalItems}):</span>
                                        <span>{formatPrice(state.totalValue)}/mo</span>
                                    </div>

                                    <Separator className='bg-border-color' />

                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total:</span>
                                        <span className="text-dark-blue">{formatPrice(state.totalValue)}/mo</span>
                                    </div>
                                </div>

                                <Alert className='bg-background-color border-border-color text-text-dark'>
                                    <MessageCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm text-gray-600">
                                        Click checkout to send your inquiry via WhatsApp for personalized assistance and pricing.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3">
                                    <Button
                                        onClick={handleWhatsAppCheckout}
                                        disabled={isGeneratingMessage}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                                    >
                                        {isGeneratingMessage ? (
                                            'Generating Message...'
                                        ) : (
                                            <>
                                                <MessageCircle className="w-4 h-4 mr-2" />
                                                Checkout via WhatsApp
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleContinueShopping}
                                        className="w-full text-card-color bg-brand-blue hover:bg-dark-blue hover:text-card-color border-none"
                                    >
                                        Continue Shopping
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
