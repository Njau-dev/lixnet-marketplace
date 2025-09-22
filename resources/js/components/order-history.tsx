import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Package,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    Eye
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { router } from '@inertiajs/react';

interface OrderItem {
    id: number;
    quantity: number;
    price: string;
    product: {
        id: number;
        title: string;
        category: {
            name: string;
        };
    };
}

interface Order {
    id: number;
    order_reference: string;
    status: string;
    total_amount: string;
    created_at: string;
    items: OrderItem[];
}

interface OrderHistoryResponse {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(10);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                per_page: perPage.toString(),
            });

            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }

            const response = await axios.get(`/api/user/orders?${params}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            const orderData: OrderHistoryResponse = response.data.data;
            setOrders(orderData.data);
            setCurrentPage(orderData.current_page);
            setLastPage(orderData.last_page);
            setTotal(orderData.total);

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch order history';
            setError(errorMessage);
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(1);
    }, [statusFilter, searchQuery, perPage]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleViewOrders = () => {
        router.visit('/orders')
    }

    const clearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
            processing: { variant: 'default' as const, icon: RefreshCw, text: 'Processing' },
            shipped: { variant: 'default' as const, icon: Package, text: 'Shipped' },
            delivered: { variant: 'default' as const, icon: CheckCircle, text: 'Delivered' },
            completed: { variant: 'default' as const, icon: CheckCircle, text: 'Completed' },
            cancelled: { variant: 'destructive' as const, icon: XCircle, text: 'Cancelled' },
            refunded: { variant: 'secondary' as const, icon: RefreshCw, text: 'Refunded' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            variant: 'secondary' as const,
            icon: AlertCircle,
            text: status.charAt(0).toUpperCase() + status.slice(1)
        };

        const IconComponent = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <IconComponent className="w-3 h-3" />
                {config.text}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: string, currency: string = 'KSh') => {
        return `${currency} ${parseFloat(price).toLocaleString()}`;
    };

    return (
        <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Package className="w-6 h-6 text-blue-600" />
                        <CardTitle className="text-xl text-slate-900">Order History</CardTitle>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchOrders(currentPage)}
                        disabled={loading}
                        className="bg-white border-slate-200 hover:bg-slate-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Search by order reference or product name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                className="pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 bg-white border-slate-200">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Search
                        </Button>
                        {(searchQuery || statusFilter !== 'all') && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStatusFilter('all');
                                    clearSearch();
                                }}
                                className="bg-white border-slate-200 hover:bg-slate-50"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {error && (
                    <div className="p-6">
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                                {error}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {loading ? (
                    <div className="p-6">
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="animate-pulse space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                                    </div>
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-px bg-slate-200"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            No orders found
                        </h3>
                        <p className="text-slate-500">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your filters or search terms'
                                : 'You haven\'t placed any orders yet'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-200">
                                        <TableHead className="text-slate-700">Order Reference</TableHead>
                                        <TableHead className="text-slate-700">Date</TableHead>
                                        <TableHead className="text-slate-700">Items</TableHead>
                                        <TableHead className="text-slate-700">Status</TableHead>
                                        <TableHead className="text-slate-700 text-right">Total</TableHead>
                                        <TableHead className="text-slate-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id} className="border-slate-200 hover:bg-slate-50">
                                            <TableCell className="font-medium text-slate-900">
                                                #{order.order_reference}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {formatDate(order.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="text-slate-900 font-medium">
                                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                    </p>
                                                    {order.items.slice(0, 2).map((item, index) => (
                                                        <p key={index} className="text-slate-500 text-xs">
                                                            {item.quantity}x {item.product.title}
                                                        </p>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <p className="text-slate-400 text-xs">
                                                            +{order.items.length - 2} more
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(order.status)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-900">
                                                {formatPrice(order.total_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={handleViewOrders}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {orders.map((order) => (
                                <Card key={order.id} className="border border-slate-200">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">
                                                    #{order.order_reference}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <p className="text-sm font-medium text-slate-900">
                                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                            </p>
                                            {order.items.slice(0, 2).map((item, index) => (
                                                <p key={index} className="text-sm text-slate-600">
                                                    {item.quantity}x {item.product.title}
                                                </p>
                                            ))}
                                            {order.items.length > 2 && (
                                                <p className="text-sm text-slate-400">
                                                    +{order.items.length - 2} more items
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                            <span className="font-semibold text-slate-900">
                                                {formatPrice(order.total_amount)}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={handleViewOrders}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                                <div className="text-sm text-slate-600">
                                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} orders
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchOrders(currentPage - 1)}
                                        disabled={currentPage <= 1 || loading}
                                        className="bg-white border-slate-200 hover:bg-slate-50"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </Button>

                                    <span className="text-sm text-slate-600 px-3">
                                        Page {currentPage} of {lastPage}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchOrders(currentPage + 1)}
                                        disabled={currentPage >= lastPage || loading}
                                        className="bg-white border-slate-200 hover:bg-slate-50"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
