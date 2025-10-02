import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import axios from 'axios';

// Sub-components
import ProgressIndicator from '@/components/marketplace/ProgressIndicator';
import PersonalDetailsStep from '@/components/marketplace/PersonalDetailsStep';
import UniversityDetailsStep from '@/components/marketplace/UniversityDetailsStep';
import TermsConditionsStep from '@/components/marketplace/TermsConditionsStep';
import ApplicationStatusView from '@/components/marketplace/ApplicationStatusView';

interface PersonalDetailsForm {
    fullName: string;
    dateOfBirth: string;
    phoneNumber: string;
    physicalAddress: string;
    idType: string;
    idNumber: string;
    idDocument: File | null;
}

interface UniversityDetailsForm {
    universityName: string;
    campus: string;
    studentId: string;
    course: string;
    yearOfStudy: string;
    universityEmail: string;
    studentIdDocument: File | null;
}

interface ApplicationStatus {
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    created_at?: string;
}

export default function SalesRegistration() {
    const { user, isLoading, checkAuth } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
    const [showReapply, setShowReapply] = useState(false);

    const [personalDetails, setPersonalDetails] = useState<PersonalDetailsForm>({
        fullName: '',
        dateOfBirth: '',
        phoneNumber: '',
        physicalAddress: '',
        idType: '',
        idNumber: '',
        idDocument: null,
    });

    const [universityDetails, setUniversityDetails] = useState<UniversityDetailsForm>({
        universityName: '',
        campus: '',
        studentId: '',
        course: '',
        yearOfStudy: '',
        universityEmail: '',
        studentIdDocument: null,
    });

    const [formErrors, setFormErrors] = useState<any>({});
    const [idPreview, setIdPreview] = useState<string | null>(null);
    const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            toast.error("Please log in to access this page");
            router.visit('/login?redirect=/sales-registration');
            return;
        }

        if (user) {
            setPersonalDetails(prev => ({
                ...prev,
                fullName: user.name || '',
                phoneNumber: user.phone || '',
            }));
            setUniversityDetails(prev => ({
                ...prev,
                universityEmail: user.email || '',
            }));
        }
    }, [user, isLoading]);

    useEffect(() => {
        if (user && !showReapply) {
            checkApplicationStatus();
        }
    }, [user, showReapply]);

    const checkApplicationStatus = async () => {
        try {
            const response = await axios.get('/api/agent-application/status');
            if (response.data.success && response.data.data.has_application) {
                const application = response.data.data.application;
                setApplicationStatus(application);
            }
        } catch (error) {
            console.error('Error checking application status:', error);
        }
    };

    const handleReapply = () => {
        setShowReapply(true);
        setApplicationStatus(null);
        setCurrentStep(1);
    };

    const validateStep1 = () => {
        const errors: any = {};

        if (!personalDetails.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }
        if (!personalDetails.dateOfBirth) {
            errors.dateOfBirth = 'Date of birth is required';
        }
        if (!personalDetails.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        } else if (!/^(\+254|0)[17]\d{8}$/.test(personalDetails.phoneNumber.replace(/\s/g, ''))) {
            errors.phoneNumber = 'Please enter a valid Kenyan phone number';
        }
        if (!personalDetails.physicalAddress.trim()) {
            errors.physicalAddress = 'Physical address is required';
        }
        if (!personalDetails.idType) {
            errors.idType = 'ID type is required';
        }
        if (!personalDetails.idNumber.trim()) {
            errors.idNumber = 'ID number is required';
        }
        if (!personalDetails.idDocument) {
            errors.idDocument = 'ID document is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = () => {
        const errors: any = {};

        if (!universityDetails.universityName.trim()) {
            errors.universityName = 'University name is required';
        }
        if (!universityDetails.campus.trim()) {
            errors.campus = 'Campus is required';
        }
        if (!universityDetails.studentId.trim()) {
            errors.studentId = 'Student ID is required';
        }
        if (!universityDetails.course.trim()) {
            errors.course = 'Course is required';
        }
        if (!universityDetails.yearOfStudy.trim()) {
            errors.yearOfStudy = 'Year of study is required';
        }
        if (!universityDetails.universityEmail.trim()) {
            errors.universityEmail = 'University email is required';
        } else if (!/\S+@\S+\.\S+/.test(universityDetails.universityEmail)) {
            errors.universityEmail = 'Please enter a valid email';
        }
        if (!universityDetails.studentIdDocument) {
            errors.studentIdDocument = 'Student ID document is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = (step: number) => {
        if (step === 1 && validateStep1()) {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (step === 2 && validateStep2()) {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.error("Please fix the form errors");
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();

            formData.append('full_name', personalDetails.fullName);
            formData.append('date_of_birth', personalDetails.dateOfBirth);
            formData.append('phone_number', personalDetails.phoneNumber);
            formData.append('physical_address', personalDetails.physicalAddress);
            formData.append('id_type', personalDetails.idType);
            formData.append('id_number', personalDetails.idNumber);
            if (personalDetails.idDocument) {
                formData.append('id_document', personalDetails.idDocument);
            }

            formData.append('university_name', universityDetails.universityName);
            formData.append('campus', universityDetails.campus);
            formData.append('student_id', universityDetails.studentId);
            formData.append('course', universityDetails.course);
            formData.append('year_of_study', universityDetails.yearOfStudy);
            formData.append('university_email', universityDetails.universityEmail);
            if (universityDetails.studentIdDocument) {
                formData.append('student_id_document', universityDetails.studentIdDocument);
            }

            formData.append('terms_accepted', '1');

            const response = await axios.post('/api/agent-application/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setIsSuccess(true);
                toast.success(response.data.message);

                setTimeout(() => {
                    router.visit('/profile');
                }, 10000);
            }

        } catch (error: any) {
            console.error('Submission error:', error);

            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                if (validationErrors) {
                    setFormErrors(validationErrors);
                    Object.keys(validationErrors).forEach(field => {
                        toast.error(`${field}: ${validationErrors[field][0]}`);
                    });
                }
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to submit application. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <MarketplaceLayout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading...</p>
                        </div>
                    </div>
                </div>
            </MarketplaceLayout>
        );
    }

    if (applicationStatus && !showReapply) {
        return (
            <MarketplaceLayout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <ApplicationStatusView
                        status={applicationStatus}
                        onReapply={handleReapply}
                        onGoToProfile={() => router.visit('/profile')}
                    />
                </div>
            </MarketplaceLayout>
        );
    }

    if (isSuccess) {
        return (
            <MarketplaceLayout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                        <CardContent className="py-16">
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-green-900 mb-2">
                                        Application Submitted Successfully!
                                    </h2>
                                    <p className="text-lg text-green-700">
                                        Thank you for applying to become a sales agent.
                                    </p>
                                </div>
                                <Alert className="bg-green-100 border-green-300 max-w-2xl mx-auto">
                                    <AlertDescription className="text-green-800">
                                        <strong>What happens next?</strong>
                                        <br />
                                        Our team will review your application within 2-3 business days.
                                        You'll receive an email notification once your application has been reviewed.
                                    </AlertDescription>
                                </Alert>
                                <div className="text-sm text-gray-600">
                                    Redirecting to your profile in <span className="font-semibold">10 seconds</span>...
                                </div>
                                <Button
                                    onClick={() => router.visit('/profile')}
                                    className="bg-brand-blue hover:bg-blue-700"
                                >
                                    Go to Profile Now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-dark-blue mb-2">
                        Become a Sales Agent
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Join our team of university student ambassadors and earn commission on every sale
                    </p>
                </div>

                <ProgressIndicator currentStep={currentStep} totalSteps={3} />

                {currentStep === 1 && (
                    <PersonalDetailsStep
                        personalDetails={personalDetails}
                        formErrors={formErrors}
                        idPreview={idPreview}
                        onInputChange={(field, value) => {
                            setPersonalDetails(prev => ({ ...prev, [field]: value }));
                            if (formErrors[field]) {
                                setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
                            }
                        }}
                        onFileChange={(file) => {
                            if (file && file.size > 5 * 1024 * 1024) {
                                toast.error("File size must be less than 5MB");
                                return;
                            }
                            setPersonalDetails(prev => ({ ...prev, idDocument: file }));
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setIdPreview(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }}
                        onNext={() => handleNext(1)}
                    />
                )}

                {currentStep === 2 && (
                    <UniversityDetailsStep
                        universityDetails={universityDetails}
                        formErrors={formErrors}
                        studentIdPreview={studentIdPreview}
                        onInputChange={(field, value) => {
                            setUniversityDetails(prev => ({ ...prev, [field]: value }));
                            if (formErrors[field]) {
                                setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
                            }
                        }}
                        onFileChange={(file) => {
                            if (file && file.size > 5 * 1024 * 1024) {
                                toast.error("File size must be less than 5MB");
                                return;
                            }
                            setUniversityDetails(prev => ({ ...prev, studentIdDocument: file }));
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setStudentIdPreview(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }}
                        onNext={() => handleNext(2)}
                        onBack={handleBack}
                    />
                )}

                {currentStep === 3 && (
                    <TermsConditionsStep
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
        </MarketplaceLayout>
    );
}
