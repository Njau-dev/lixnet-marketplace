import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, ChevronRight, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { dashboard } from '@/routes';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AgentApplication {
    id: number;
    user_id: number;
    full_name: string;
    phone_number: string;
    university_name: string;
    campus: string;
    student_id: string;
    course: string;
    year_of_study: string;
    university_email: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at: string | null;
    user: User;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Agent Applications',
        href: '/admin/agent-applications',
    },
];

export default function AgentApplicationsIndex() {
    const [applications, setApplications] = useState<AgentApplication[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [universities, setUniversities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [universityFilter, setUniversityFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchApplications = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                per_page: '15',
            });

            if (search) params.append('search', search);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (universityFilter !== 'all') params.append('university', universityFilter);

            const response = await axios.get(`/api/admin/agent-applications/list?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const data = response.data;

            setApplications(data.applications.data);
            setPagination({
                current_page: data.applications.current_page,
                last_page: data.applications.last_page,
                per_page: data.applications.per_page,
                total: data.applications.total,
                from: data.applications.from,
                to: data.applications.to,
            });
            setStats(data.stats);
            setUniversities(data.universities);
            setCurrentPage(data.applications.current_page);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch applications';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications(1);
    }, [search, statusFilter, universityFilter]);

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handleViewApplication = (applicationId: number) => {
        window.location.href = `/admin/agent-applications/${applicationId}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        const variants: Record<string, any> = {
            pending: 'default',
            approved: 'default',
            rejected: 'destructive',
        };
        return variants[status] || 'secondary';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            approved: 'bg-green-50 text-green-700 border-green-200',
            rejected: 'bg-red-50 text-red-700 border-red-200',
        };
        return colors[status] || '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agent Applications" />

            <div className="space-y-6 p-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agent Applications</h2>
                    <p className="text-muted-foreground">
                        Review and manage student agent applications
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Search and filter applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, student ID..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={universityFilter} onValueChange={setUniversityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by university" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Universities</SelectItem>
                                    {universities.map((uni) => (
                                        <SelectItem key={uni} value={uni}>
                                            {uni}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Table */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="space-y-4 p-6">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center">
                                <p className="text-muted-foreground">{error}</p>
                                <Button onClick={() => fetchApplications(currentPage)} className="mt-4">
                                    Try Again
                                </Button>
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-muted-foreground">No applications found</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-sm">
                                                <th className="px-6 py-3 text-left font-medium">Applicant</th>
                                                <th className="px-6 py-3 text-left font-medium">University</th>
                                                <th className="px-6 py-3 text-left font-medium">Campus</th>
                                                <th className="px-6 py-3 text-left font-medium">Student ID</th>
                                                <th className="px-6 py-3 text-left font-medium">Course</th>
                                                <th className="px-6 py-3 text-left font-medium">Year</th>
                                                <th className="px-6 py-3 text-left font-medium">Status</th>
                                                <th className="px-6 py-3 text-left font-medium">Applied</th>
                                                <th className="px-6 py-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {applications.map((application) => (
                                                <tr key={application.id} className="hover:bg-muted/50">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="font-medium">{application.full_name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {application.user.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{application.university_name}</td>
                                                    <td className="px-6 py-4 text-sm">{application.campus}</td>
                                                    <td className="px-6 py-4 text-sm font-mono">{application.student_id}</td>
                                                    <td className="px-6 py-4 text-sm">{application.course}</td>
                                                    <td className="px-6 py-4 text-sm">{application.year_of_study}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant="outline"
                                                            className={getStatusColor(application.status)}
                                                        >
                                                            {application.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {formatDate(application.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleViewApplication(application.id)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {pagination && pagination.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t px-6 py-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {pagination.from} to {pagination.to} of {pagination.total} applications
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fetchApplications(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fetchApplications(currentPage + 1)}
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
