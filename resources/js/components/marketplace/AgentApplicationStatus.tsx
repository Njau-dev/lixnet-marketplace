import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    UserCheck,
    AlertTriangle,
    FileText
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ApplicationStatus {
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    created_at?: string;
    updated_at?: string;
}

interface AgentApplicationStatusProps {
    onApplyClick?: () => void;
}

export default function AgentApplicationStatus({ onApplyClick }: AgentApplicationStatusProps) {
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchApplicationStatus = async () => {
        try {
            const response = await axios.get('/api/agent-application/status');
            if (response.data.success && response.data.data.has_application) {
                setApplicationStatus(response.data.data.application);
            } else {
                setApplicationStatus(null);
            }
        } catch (error) {
            console.error('Error fetching application status:', error);
            toast.error('Failed to load application status');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplicationStatus();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchApplicationStatus();
    };

    const getStatusConfig = (status: ApplicationStatus['status']) => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Clock className="w-5 h-5 text-yellow-600" />,
                    badge: (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Under Review
                        </Badge>
                    ),
                    title: 'Application Under Review',
                    description: 'Your sales agent application is being reviewed by our team.',
                    alert: {
                        bg: 'bg-yellow-50',
                        border: 'border-yellow-200',
                        text: 'text-yellow-800'
                    }
                };
            case 'approved':
                return {
                    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                    badge: (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                        </Badge>
                    ),
                    title: 'Sales Agent - Approved',
                    description: 'Congratulations! You are an approved sales agent.',
                    alert: {
                        bg: 'bg-green-50',
                        border: 'border-green-200',
                        text: 'text-green-800'
                    }
                };
            case 'rejected':
                return {
                    icon: <XCircle className="w-5 h-5 text-red-600" />,
                    badge: (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Approved
                        </Badge>
                    ),
                    title: 'Application Not Approved',
                    description: 'Your sales agent application was not approved.',
                    alert: {
                        bg: 'bg-red-50',
                        border: 'border-red-200',
                        text: 'text-red-800'
                    }
                };
        }
    };

    if (isLoading) {
        return (
            <Card className="bg-white border border-slate-200 shadow-sm mb-8">
                <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-6 bg-slate-200 rounded w-48"></div>
                                <div className="h-4 bg-slate-200 rounded w-64"></div>
                            </div>
                            <div className="h-8 bg-slate-200 rounded w-24"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!applicationStatus) {
        return (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm mb-8">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-3">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                        <CardTitle className="text-xl text-slate-900">Become a Sales Agent</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-slate-700">
                            Join our team of university student ambassadors and earn commission on every sale.
                            Start your journey as a sales agent today!
                        </p>

                        <Alert className="bg-white border-blue-200">
                            <AlertTriangle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-700">
                                <strong>Benefits:</strong> Earn commissions, gain sales experience, build your network
                            </AlertDescription>
                        </Alert>

                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={onApplyClick}
                                className="bg-brand-blue hover:bg-blue-700"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Apply Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="bg-white border-slate-200 hover:bg-slate-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const config = getStatusConfig(applicationStatus.status);

    return (
        <Card className="bg-white border border-slate-200 shadow-sm mb-8">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                    {config.icon}
                    <CardTitle className="text-xl text-slate-900">{config.title}</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                    {config.badge}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="bg-white border-slate-200 hover:bg-slate-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-slate-700">{config.description}</p>

                {applicationStatus.created_at && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                            <span className="font-medium">Submitted:</span>{' '}
                            {new Date(applicationStatus.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </div>
                        {applicationStatus.updated_at && applicationStatus.updated_at !== applicationStatus.created_at && (
                            <div>
                                <span className="font-medium">Last Updated:</span>{' '}
                                {new Date(applicationStatus.updated_at).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </div>
                        )}
                    </div>
                )}

                <Separator className="bg-slate-200" />

                {applicationStatus.status === 'pending' && (
                    <Alert className={`${config.alert.bg} ${config.alert.border}`}>
                        <AlertDescription className={config.alert.text}>
                            <strong>Review Process:</strong>
                            <br />
                            Our team typically reviews applications within 2-3 business days.
                            You'll receive an email notification once your application has been reviewed.
                        </AlertDescription>
                    </Alert>
                )}

                {applicationStatus.status === 'rejected' && applicationStatus.reason && (
                    <Alert className={`${config.alert.bg} ${config.alert.border}`}>
                        <AlertDescription className={config.alert.text}>
                            <strong>Reason for rejection:</strong>
                            <br />
                            {applicationStatus.reason}
                        </AlertDescription>
                    </Alert>
                )}

                {applicationStatus.status === 'approved' && (
                    <Alert className={`${config.alert.bg} ${config.alert.border}`}>
                        <AlertDescription className={config.alert.text}>
                            <strong>Welcome to the team!</strong>
                            <br />
                            You can now start earning commissions by promoting our software solutions.
                            Check your sales dashboard for commission rates and performance tracking.
                        </AlertDescription>
                    </Alert>
                )}

                {applicationStatus.status === 'rejected' && (
                    <div className="pt-2">
                        <Button
                            onClick={onApplyClick}
                            className="bg-brand-blue hover:bg-blue-700"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reapply
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
