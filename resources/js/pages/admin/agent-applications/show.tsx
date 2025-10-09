import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User,
    GraduationCap,
    CheckCircle,
    XCircle,
    Download,
    Calendar,
    Mail,
    Phone,
    MapPin,
    FileText,
    Building2,
    ArrowLeft,
    X,
    Maximize2
} from 'lucide-react';
import { dashboard } from '@/routes';
import axios from 'axios';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AgentApplication {
    id: number;
    user_id: number;
    full_name: string;
    date_of_birth: string;
    phone_number: string;
    physical_address: string;
    id_type: string;
    id_number: string;
    id_document_path: string;
    university_name: string;
    campus: string;
    student_id: string;
    course: string;
    year_of_study: string;
    university_email: string;
    student_id_document_path: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    reviewed_at: string | null;
    created_at: string;
    user: User;
    reviewer?: User;
    agent?: {
        id: number;
        agent_code: string;
        commission_rate: number;
    };
}

export default function AgentApplicationShow({ applicationId }: { applicationId: number }) {
    const [application, setApplication] = useState<AgentApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [commissionRate, setCommissionRate] = useState('10.00');
    const [rejectionReason, setRejectionReason] = useState('');

    const [fullscreenDoc, setFullscreenDoc] = useState<{ type: 'id_document' | 'student_id_document'; url: string; filename: string } | null>(null);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Agent Applications',
            href: '/admin/agent-applications',
        },
        {
            title: application?.full_name || 'Loading...',
            href: '#',
        },
    ];

    const fetchApplication = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/agent-applications/details/${applicationId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            setApplication(response.data.application);
        } catch (err: any) {
            toast.error('Failed to fetch application details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplication();
    }, [applicationId]);

    const handleApprove = async () => {
        if (!application) return;

        try {
            setActionLoading(true);
            const response = await axios.post(
                `/admin/agent-applications/${application.id}/approve`,
                { commission_rate: parseFloat(commissionRate) },
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }
            );

            toast.success('Application approved successfully');
            setApplication(response.data.application);
            setShowApproveDialog(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to approve application');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!application || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            setActionLoading(true);
            const response = await axios.post(
                `/admin/agent-applications/${application.id}/reject`,
                { rejection_reason: rejectionReason },
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }
            );

            toast.success('Application rejected successfully');
            setApplication(response.data.application);
            setShowRejectDialog(false);
            setRejectionReason('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to reject application');
        } finally {
            setActionLoading(false);
        }
    };

    const getDocumentUrl = (documentType: 'id_document' | 'student_id_document') => {
        if (!application) return '';
        if (documentType === 'id_document') {
            return `/storage/${application.id_document_path}`;
        } else {
            return `/storage/${application.student_id_document_path}`;
        }
    };

    const getFilename = (documentType: 'id_document' | 'student_id_document') => {
        if (!application) return 'document';
        if (documentType === 'id_document') {
            return `${application.full_name}-id-document.jpg`;
        } else {
            return `${application.full_name}-student-id.jpg`;
        }
    };

    const handleViewDocument = (documentType: 'id_document' | 'student_id_document') => {
        setFullscreenDoc({
            type: documentType,
            url: getDocumentUrl(documentType),
            filename: getFilename(documentType)
        });
    };

    const handleDownloadDocument = (documentType: 'id_document' | 'student_id_document') => {
        const url = getDocumentUrl(documentType);
        const filename = getFilename(documentType);

        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(err => {
                toast.error('Failed to download document');
                console.error(err);
            });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            approved: 'bg-green-50 text-green-700 border-green-200',
            rejected: 'bg-red-50 text-red-700 border-red-200',
        };
        return colors[status] || '';
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Loading..." />
                <div className="p-4">
                    <div className="space-y-4">
                        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                        <div className="h-96 bg-muted animate-pulse rounded" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!application) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Not Found" />
                <div className="p-4 text-center">
                    <p>Application not found</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Application - ${application.full_name}`} />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{application.full_name}</h2>
                            <p className="text-muted-foreground">Application Details</p>
                        </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(application.status)}>
                        {application.status.toUpperCase()}
                    </Badge>
                </div>

                {/* Action Buttons */}
                {application.status === 'pending' && (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setShowApproveDialog(true)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Application
                        </Button>
                        <Button
                            onClick={() => setShowRejectDialog(true)}
                            variant="destructive"
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Application
                        </Button>
                    </div>
                )}

                {/* Approved Agent Info */}
                {application.status === 'approved' && application.agent && (
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="text-green-900">Agent Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-green-700">Agent Code</p>
                                    <p className="font-mono font-bold text-green-900">
                                        {application.agent.agent_code}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-green-700">Commission Rate</p>
                                    <p className="font-bold text-green-900">
                                        {application.agent.commission_rate}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Rejection Info */}
                {application.status === 'rejected' && application.rejection_reason && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-red-900">Rejection Reason</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-800">{application.rejection_reason}</p>
                            {application.reviewed_at && application.reviewer && (
                                <p className="text-sm text-red-700 mt-2">
                                    Rejected by {application.reviewer.name} on {formatDate(application.reviewed_at)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tabs for Personal and University Details */}
                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="personal">
                            <User className="h-4 w-4 mr-2" />
                            Personal Details
                        </TabsTrigger>
                        <TabsTrigger value="university">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            University Details
                        </TabsTrigger>
                    </TabsList>

                    {/* Personal Details Tab */}
                    <TabsContent value="personal">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Applicant's personal details and identification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Full Name</Label>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.full_name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Date of Birth</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{formatDate(application.date_of_birth)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Phone Number</Label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.phone_number}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Email</Label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-muted-foreground">Physical Address</Label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.physical_address}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">ID Type</Label>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.id_type}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">ID Number</Label>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium font-mono">{application.id_number}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    <Label className="text-muted-foreground block">ID Document</Label>
                                    <div className="border rounded-lg overflow-hidden bg-muted/30 p-4 max-w-md">
                                        <img
                                            src={getDocumentUrl('id_document')}
                                            alt="ID Document"
                                            className="w-full h-auto rounded max-h-96 object-cover"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleViewDocument('id_document')}
                                        >
                                            <Maximize2 className="h-4 w-4 mr-2" />
                                            View Fullscreen
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDownloadDocument('id_document')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* University Details Tab */}
                    <TabsContent value="university">
                        <Card>
                            <CardHeader>
                                <CardTitle>University Information</CardTitle>
                                <CardDescription>Academic details and student verification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">University Name</Label>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.university_name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Campus</Label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.campus}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Student ID</Label>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium font-mono">{application.student_id}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">University Email</Label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.university_email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Course</Label>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.course}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Year of Study</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{application.year_of_study}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    <Label className="text-muted-foreground block">Student ID Document</Label>
                                    <div className="border rounded-lg overflow-hidden bg-muted/30 p-4 max-w-md">
                                        <img
                                            src={getDocumentUrl('student_id_document')}
                                            alt="Student ID Document"
                                            className="w-full h-auto rounded max-h-96 object-cover"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleViewDocument('student_id_document')}
                                        >
                                            <Maximize2 className="h-4 w-4 mr-2" />
                                            View Fullscreen
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDownloadDocument('student_id_document')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Application Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Application Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="rounded-full bg-blue-100 p-2 h-fit">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Application Submitted</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(application.created_at)}
                                    </p>
                                </div>
                            </div>

                            {application.reviewed_at && (
                                <div className="flex gap-3">
                                    <div className={`rounded-full p-2 h-fit ${application.status === 'approved'
                                        ? 'bg-green-100'
                                        : 'bg-red-100'
                                        }`}>
                                        {application.status === 'approved' ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Application {application.status === 'approved' ? 'Approved' : 'Rejected'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(application.reviewed_at)}
                                            {application.reviewer && ` by ${application.reviewer.name}`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Fullscreen Document Modal */}
            {fullscreenDoc && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-black rounded-lg overflow-hidden w-full h-full max-w-6xl flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900">
                            <h3 className="font-semibold text-white">
                                {fullscreenDoc.type === 'id_document' ? 'ID Document' : 'Student ID Document'}
                            </h3>
                            <div className="flex gap-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadDocument(fullscreenDoc.type)}
                                    className="text-white border-gray-600 hover:bg-gray-800"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setFullscreenDoc(null)}
                                    className="text-white border-gray-600 hover:bg-gray-800"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto flex items-center justify-center bg-black">
                            <img
                                src={fullscreenDoc.url}
                                alt="Document"
                                className="w-auto h-auto max-w-full max-h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Application</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will approve the application and create an agent account.
                            The user's role will be updated to "agent".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="commission">Commission Rate (%)</Label>
                        <Input
                            id="commission"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {actionLoading ? 'Approving...' : 'Approve Application'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Application</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting this application.
                            The applicant will be notified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="reason">Rejection Reason</Label>
                        <Textarea
                            id="reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason (minimum 10 characters)..."
                            className="mt-2"
                            rows={4}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={actionLoading || rejectionReason.length < 10}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {actionLoading ? 'Rejecting...' : 'Reject Application'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
