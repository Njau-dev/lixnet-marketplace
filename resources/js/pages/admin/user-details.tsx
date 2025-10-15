import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    Calendar,
    ShoppingBag,
    DollarSign,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import axios from 'axios';

interface Props {
    userId: string;
}

interface UserStats {
    total_orders: number;
    total_spent: number;
    completed_orders_count: number;
    pending_orders_count: number;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    updated_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    role: string;
    email_verified_at: string | null;
    created_at: string;
    display_name: string;
    stats: UserStats;
    recent_orders: Order[];
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export default function AdminUserDetail({ userId }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Users',
            href: '/admin/users-list',
        },
        {
            title: user?.display_name || 'User Details',
            href: `/admin/users-list/${userId}`,
        },
    ];

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`/api/admin/users/${userId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const data = response.data;

            setUser(data.user);
            setOrders(data.user.recent_orders);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch user details';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async (page = 1) => {
        try {
            setOrdersLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                per_page: '10',
            });

            if (statusFilter !== 'all') params.append('status', statusFilter);


            const response = await axios.get(`/api/admin/users/${userId}/orders?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const data = response.data;

            setOrders(data.orders.data);
            setPagination({
                current_page: data.orders.current_page,
                last_page: data.orders.last_page,
                per_page: data.orders.per_page,
                total: data.orders.total,
                from: data.orders.from,
                to: data.orders.to,
            });
            setCurrentPage(data.orders.current_page);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch orders';
            toast.error(errorMessage);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [userId]);

    useEffect(() => {
        if (user) {
            fetchOrders(1);
        }
    }, [statusFilter]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KES',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        const variants: Record<string, any> = {
            completed: 'default',
            paid: 'default',
            pending: 'secondary',
            cancelled: 'destructive',
        };
        return variants[status] || 'secondary';
    };

    const getRoleBadgeVariant = (role: string) => {
        const variants: Record<string, any> = {
            admin: 'destructive',
            agent: 'default',
            user: 'secondary',
        };
        return variants[role] || 'secondary';
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="User Details" />
                <div className="space-y-6 p-4">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid gap-6 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </AppLayout>
        );
    }

    if (error || !user) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="User Details" />
                <div className="flex min-h-[400px] items-center justify-center p-4">
                    <div className="text-center">
                        <p className="text-muted-foreground">{error || 'User not found'}</p>
                        <Button onClick={() => router.visit('/admin/users-list')} className="mt-4">
                            Back to Users
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.display_name} - User Details`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = '/admin/users-list'}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{user.display_name}</h2>
                            <p className="text-muted-foreground">User details and order history</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>

                                {user.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Phone</p>
                                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {user.company && (
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Company</p>
                                            <p className="text-sm text-muted-foreground">{user.company}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Joined</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-2">Role</p>
                                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-2">Email Status</p>
                                    {user.email_verified_at ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Unverified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Orders</p>
                                    <p className="text-2xl font-bold">{user.stats.total_orders}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-3">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Spent</p>
                                    <p className="text-2xl font-bold">{formatCurrency(user.stats.total_spent)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold">{user.stats.completed_orders_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-yellow-100 p-3">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold">{user.stats.pending_orders_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>All orders placed by this user</CardDescription>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="p-0">
                        {ordersLoading ? (
                            <div className="space-y-4 p-6">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-muted-foreground">No orders found</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-sm">
                                                <th className="px-6 py-3 text-left font-medium">Order Number</th>
                                                <th className="px-6 py-3 text-left font-medium">Status</th>
                                                <th className="px-6 py-3 text-right font-medium">Amount</th>
                                                <th className="px-6 py-3 text-left font-medium">Order Date</th>
                                                <th className="px-6 py-3 text-left font-medium">Last Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-muted/50">
                                                    <td className="px-6 py-4 font-medium">{order.order_number}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={getStatusBadgeVariant(order.status)}>
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium">
                                                        {formatCurrency(order.total_amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{formatDate(order.created_at)}</td>
                                                    <td className="px-6 py-4 text-sm">{formatDate(order.updated_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {pagination && pagination.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t px-6 py-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {pagination.from} to {pagination.to} of {pagination.total} orders
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fetchOrders(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <div className="text-sm">
                                                Page {pagination.current_page} of {pagination.last_page}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fetchOrders(currentPage + 1)}
                                                disabled={currentPage === pagination.last_page}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
