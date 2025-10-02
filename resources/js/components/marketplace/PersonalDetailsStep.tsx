import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { User, Upload, ArrowRight, ShieldCheck } from 'lucide-react';

interface PersonalDetailsForm {
    fullName: string;
    dateOfBirth: string;
    phoneNumber: string;
    physicalAddress: string;
    idType: string;
    idNumber: string;
    idDocument: File | null;
}

interface PersonalDetailsStepProps {
    personalDetails: PersonalDetailsForm;
    formErrors: any;
    idPreview: string | null;
    onInputChange: (field: keyof PersonalDetailsForm, value: string) => void;
    onFileChange: (file: File | null) => void;
    onNext: () => void;
}

export default function PersonalDetailsStep({
    personalDetails,
    formErrors,
    idPreview,
    onInputChange,
    onFileChange,
    onNext,
}: PersonalDetailsStepProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onFileChange(file);
    };

    return (
        <Card className="bg-card-color border border-border-color">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                    <User className="w-6 h-6 mr-3 text-brand-blue" />
                    Personal & ID Information
                </CardTitle>
                <CardDescription>
                    Please provide your personal details and government-issued ID information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-dark-blue flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                type="text"
                                value={personalDetails.fullName}
                                onChange={(e) => onInputChange('fullName', e.target.value)}
                                className={`bg-background-color ${formErrors.fullName ? 'border-red-500' : ''}`}
                                placeholder="Enter your full name"
                            />
                            {formErrors.fullName && (
                                <p className="text-sm text-red-600">{formErrors.fullName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={personalDetails.dateOfBirth}
                                onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
                                className={`bg-background-color ${formErrors.dateOfBirth ? 'border-red-500' : ''}`}
                            />
                            {formErrors.dateOfBirth && (
                                <p className="text-sm text-red-600">{formErrors.dateOfBirth}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number *</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                value={personalDetails.phoneNumber}
                                onChange={(e) => onInputChange('phoneNumber', e.target.value)}
                                className={`bg-background-color ${formErrors.phoneNumber ? 'border-red-500' : ''}`}
                                placeholder="e.g., +254712345678"
                            />
                            {formErrors.phoneNumber && (
                                <p className="text-sm text-red-600">{formErrors.phoneNumber}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="physicalAddress">Physical Address *</Label>
                            <Input
                                id="physicalAddress"
                                type="text"
                                value={personalDetails.physicalAddress}
                                onChange={(e) => onInputChange('physicalAddress', e.target.value)}
                                className={`bg-background-color ${formErrors.physicalAddress ? 'border-red-500' : ''}`}
                                placeholder="Enter your address"
                            />
                            {formErrors.physicalAddress && (
                                <p className="text-sm text-red-600">{formErrors.physicalAddress}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-border-color">
                    <h3 className="text-lg font-semibold text-dark-blue flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        Government ID Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="idType">ID Type *</Label>
                            <Select
                                value={personalDetails.idType}
                                onValueChange={(value) => onInputChange('idType', value)}
                            >
                                <SelectTrigger className={`bg-background-color ${formErrors.idType ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="National ID">National ID</SelectItem>
                                    <SelectItem value="Passport">Passport</SelectItem>
                                </SelectContent>
                            </Select>
                            {formErrors.idType && (
                                <p className="text-sm text-red-600">{formErrors.idType}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="idNumber">ID Number *</Label>
                            <Input
                                id="idNumber"
                                type="text"
                                value={personalDetails.idNumber}
                                onChange={(e) => onInputChange('idNumber', e.target.value)}
                                className={`bg-background-color ${formErrors.idNumber ? 'border-red-500' : ''}`}
                                placeholder="Enter ID number"
                            />
                            {formErrors.idNumber && (
                                <p className="text-sm text-red-600">{formErrors.idNumber}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="idDocument">Upload ID Document *</Label>
                        <div className="flex items-center gap-4">
                            <label
                                htmlFor="idDocument"
                                className={`flex-1 flex items-center justify-center px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${formErrors.idDocument ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <div className="text-center">
                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        {personalDetails.idDocument
                                            ? personalDetails.idDocument.name
                                            : 'Click to upload ID (JPG, PNG, PDF - Max 5MB)'}
                                    </p>
                                </div>
                                <input
                                    id="idDocument"
                                    type="file"
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        {formErrors.idDocument && (
                            <p className="text-sm text-red-600">{formErrors.idDocument}</p>
                        )}
                        {idPreview && !idPreview.includes('pdf') && (
                            <div className="mt-4">
                                <img
                                    src={idPreview}
                                    alt="ID Preview"
                                    className="max-w-xs h-auto rounded-lg border border-border-color"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <Button
                        onClick={onNext}
                        className="bg-brand-blue hover:bg-blue-700 px-8"
                    >
                        Next: University Information
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
