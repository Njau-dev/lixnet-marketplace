import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    User,
    Edit3,
    Save,
    X,
    Mail,
    Phone,
    Building,
    Calendar,
    ShoppingBag,
    CreditCard,
    Clock,
    CheckCircle,
    Package,
    DollarSign,
    RefreshCw,
    AlertCircle,
    Shield
} from 'lucide-react';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';
import { useAuth } from '@/context/auth-context';
import toast from 'react-hot-toast';
import axios from 'axios';
import { OrderHistory } from '@/components/order-history';
import Breadcrumbs from '@/components/ui/user-breadcrumbs';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    created_at: string;
    updated_at: string;
    email_verified_at?: string;
}

interface UserSummary {
    total_orders: number;
    successful_orders: number;
    pending_orders: number;
    total_payments: number;
    total_spent: string;
    currency: string;
}

export default function Profile() {
    const { user, isLoading, checkAuth, logout } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: ''
    });

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            toast.error("Please log in to view your profile");
            router.visit('/login');
            return;
        }

        if (user) {
            fetchUserProfile();
            fetchUserSummary();
        }
    }, [user, isLoading]);

    const fetchUserProfile = async () => {
        try {
            setIsProfileLoading(true);
            setError(null);

            const response = await axios.get('/api/user/profile', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            const profileData = response.data.data;
            setUserProfile(profileData);
            setEditForm({
                name: profileData.name || '',
                email: profileData.email || '',
                phone: profileData.phone || '',
                company: profileData.company || ''
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
            setError(errorMessage);
            console.error('Failed to fetch profile:', err);
        } finally {
            setIsProfileLoading(false);
        }
    };

    const fetchUserSummary = async () => {
        try {
            setIsSummaryLoading(true);

            const response = await axios.get('/api/user/summary', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            setUserSummary(response.data.data);
        } catch (err) {
            console.error('Failed to fetch user summary:', err);
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Reset form if canceling
            if (userProfile) {
                setEditForm({
                    name: userProfile.name || '',
                    email: userProfile.email || '',
                    phone: userProfile.phone || '',
                    company: userProfile.company || ''
                });
            }
        } else {
            // Set current values when starting to edit
            if (userProfile) {
                setEditForm({
                    name: userProfile.name || '',
                    email: userProfile.email || '',
                    phone: userProfile.phone || '',
                    company: userProfile.company || ''
                });
            }
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (field: string, value: string) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setError(null);

            const response = await axios.put('/api/user/profile', editForm, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            setUserProfile(response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleLoginClick = () => {
        // log out user from previous session if available or redirect to login
        user ? logout() : router.visit('/login');
    };

    const handleCartClick = () => {
        // navigate to cart
        router.visit('/cart');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatPrice = (price: string, currency: string = 'KSh') => {
        return `${currency} ${price}`;
    };

    if (isLoading) {
        return (
            <MarketplaceLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading profile...</p>
                        </div>
                    </div>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout
            onLoginClick={handleLoginClick}
            onCartClick={handleCartClick}
        >
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            // { label: 'Home', href: '/' },
                            { label: 'Profile' }
                        ]}
                    />
                </div>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-600 mt-2">
                        Manage your account settings and view your activity summary
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {isSummaryLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <Card key={index} className="bg-white border border-slate-200">
                                <CardContent className="pt-6">
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-8 bg-slate-200 rounded w-12"></div>
                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : userSummary ? (
                        <>
                            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <ShoppingBag className="w-8 h-8 text-blue-600 mb-2" />
                                            <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                                            <p className="text-2xl font-bold text-blue-900">{userSummary.total_orders}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                                            <p className="text-sm text-green-600 font-medium">Successful Orders</p>
                                            <p className="text-2xl font-bold text-green-900">{userSummary.successful_orders}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Clock className="w-8 h-8 text-yellow-600 mb-2" />
                                            <p className="text-sm text-yellow-600 font-medium">Pending Orders</p>
                                            <p className="text-2xl font-bold text-yellow-900">{userSummary.pending_orders}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
                                            <p className="text-sm text-purple-600 font-medium">Total Spent</p>
                                            <p className="text-2xl font-bold text-purple-900">
                                                {formatPrice(userSummary.total_spent, userSummary.currency)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="col-span-4">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Unable to load activity summary
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>

                {/* Profile Information */}
                <Card className="bg-white border border-slate-200 shadow-sm mb-8">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <User className="w-6 h-6 text-blue-600" />
                            <CardTitle className="text-xl text-slate-900">Profile Information</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchUserProfile}
                                className="bg-white border-slate-200 hover:bg-slate-50"
                                disabled={isProfileLoading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isProfileLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            {!isEditing ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEditToggle}
                                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEditToggle}
                                        className="bg-white border-slate-200 hover:bg-slate-50"
                                        disabled={isSaving}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveProfile}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {error && (
                            <Alert className="mb-6 border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-700">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {isProfileLoading ? (
                            <div className="space-y-6">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="animate-pulse space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-10 bg-slate-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : userProfile ? (
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editForm.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter your full name"
                                            className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {userProfile.name || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email Address
                                        {userProfile.email_verified_at && (
                                            <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                                                <Shield className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Enter your email address"
                                            className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {userProfile.email}
                                        </div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {userProfile.phone || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Building className="w-4 h-4 inline mr-2" />
                                        Company
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editForm.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                            placeholder="Enter your company name"
                                            className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {userProfile.company || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                <Separator className="bg-slate-200" />

                                {/* Account Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-2" />
                                            Member Since
                                        </label>
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {formatDate(userProfile.created_at)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <Package className="w-4 h-4 inline mr-2" />
                                            Last Updated
                                        </label>
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono">
                                            {formatDate(userProfile.updated_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Unable to load profile
                                </h3>
                                <p className="text-slate-500 mb-4">
                                    There was an error loading your profile information.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={fetchUserProfile}
                                    className="bg-white border-slate-200 hover:bg-slate-50"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <OrderHistory />
            </div>
        </MarketplaceLayout>
    );
}
