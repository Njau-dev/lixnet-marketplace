import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ApplicationStatus {
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    created_at?: string;
}

interface ApplicationStatusViewProps {
    status: ApplicationStatus;
    onReapply: () => void;
    onGoToProfile: () => void;
}

export default function ApplicationStatusView({
    status,
    onReapply,
    onGoToProfile,
}: ApplicationStatusViewProps) {
    const getStatusConfig = () => {
        switch (status.status) {
            case 'pending':
                return {
                    icon: <Clock className="w-12 h-12 text-yellow-600" />,
                    bgColor: 'from-yellow-50 to-white',
                    borderColor: 'border-yellow-200',
                    title: 'Application Under Review',
                    message: 'Your application is currently being reviewed by our team.',
                    iconBg: 'bg-yellow-100',
                    alertBg: 'bg-yellow-50',
                    alertBorder: 'border-yellow-300',
                    alertText: 'text-yellow-800',
                };
            case 'approved':
                return {
                    icon: <CheckCircle className="w-12 h-12 text-green-600" />,
                    bgColor: 'from-green-50 to-white',
                    borderColor: 'border-green-200',
                    title: 'Application Approved!',
                    message: 'Congratulations! You are now a registered sales agent.',
                    iconBg: 'bg-green-100',
                    alertBg: 'bg-green-50',
                    alertBorder: 'border-green-300',
                    alertText: 'text-green-800',
                };
            case 'rejected':
                return {
                    icon: <XCircle className="w-12 h-12 text-red-600" />,
                    bgColor: 'from-red-50 to-white',
                    borderColor: 'border-red-200',
                    title: 'Application Not Approved',
                    message: 'Unfortunately, your application was not approved.',
                    iconBg: 'bg-red-100',
                    alertBg: 'bg-red-50',
                    alertBorder: 'border-red-300',
                    alertText: 'text-red-800',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Card className={`bg-gradient-to-br ${config.bgColor} border-2 ${config.borderColor}`}>
            <CardHeader>
                <CardTitle className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center`}>
                            {config.icon}
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{config.title}</h2>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-lg text-gray-700 mb-4">{config.message}</p>

                    {status.created_at && (
                        <p className="text-sm text-gray-500">
                            Submitted on: {new Date(status.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    )}
                </div>

                {status.status === 'pending' && (
                    <Alert className={`${config.alertBg} ${config.alertBorder}`}>
                        <AlertDescription className={config.alertText}>
                            <strong>What happens next?</strong>
                            <br />
                            Our team typically reviews applications within 2-3 business days.
                            You'll receive an email notification once your application has been reviewed.
                            In the meantime, you can continue using the marketplace.
                        </AlertDescription>
                    </Alert>
                )}

                {status.status === 'rejected' && status.reason && (
                    <Alert className={`${config.alertBg} ${config.alertBorder}`}>
                        <AlertDescription className={config.alertText}>
                            <strong>Reason for rejection:</strong>
                            <br />
                            {status.reason}
                        </AlertDescription>
                    </Alert>
                )}

                {status.status === 'approved' && (
                    <Alert className={`${config.alertBg} ${config.alertBorder}`}>
                        <AlertDescription className={config.alertText}>
                            <strong>Welcome to the team!</strong>
                            <br />
                            You can now start earning commissions by promoting our software solutions.
                            Check your profile for more details on commission rates and sales tracking.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    {status.status === 'rejected' && (
                        <Button
                            onClick={onReapply}
                            className="bg-brand-blue hover:bg-blue-700"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reapply
                        </Button>
                    )}

                    <Button
                        onClick={onGoToProfile}
                        variant={status.status === 'rejected' ? 'outline' : 'default'}
                        className={status.status !== 'rejected' ? 'bg-brand-blue hover:bg-blue-700' : ''}
                    >
                        Go to Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
