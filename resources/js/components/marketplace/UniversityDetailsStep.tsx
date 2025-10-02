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
import { GraduationCap, Upload, ArrowRight, ArrowLeft } from 'lucide-react';

interface UniversityDetailsForm {
    universityName: string;
    campus: string;
    studentId: string;
    course: string;
    yearOfStudy: string;
    universityEmail: string;
    studentIdDocument: File | null;
}

interface UniversityDetailsStepProps {
    universityDetails: UniversityDetailsForm;
    formErrors: any;
    studentIdPreview: string | null;
    onInputChange: (field: keyof UniversityDetailsForm, value: string) => void;
    onFileChange: (file: File | null) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function UniversityDetailsStep({
    universityDetails,
    formErrors,
    studentIdPreview,
    onInputChange,
    onFileChange,
    onNext,
    onBack,
}: UniversityDetailsStepProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onFileChange(file);
    };

    return (
        <Card className="bg-card-color border border-border-color">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                    <GraduationCap className="w-6 h-6 mr-3 text-brand-blue" />
                    University Information
                </CardTitle>
                <CardDescription>
                    Please provide your university details and upload your student ID
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="universityName">University Name *</Label>
                            <Input
                                id="universityName"
                                type="text"
                                value={universityDetails.universityName}
                                onChange={(e) => onInputChange('universityName', e.target.value)}
                                className={`bg-background-color ${formErrors.universityName ? 'border-red-500' : ''}`}
                                placeholder="e.g., University of Nairobi"
                            />
                            {formErrors.universityName && (
                                <p className="text-sm text-red-600">{formErrors.universityName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="campus">Campus *</Label>
                            <Input
                                id="campus"
                                type="text"
                                value={universityDetails.campus}
                                onChange={(e) => onInputChange('campus', e.target.value)}
                                className={`bg-background-color ${formErrors.campus ? 'border-red-500' : ''}`}
                                placeholder="e.g., Main Campus"
                            />
                            {formErrors.campus && (
                                <p className="text-sm text-red-600">{formErrors.campus}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID *</Label>
                            <Input
                                id="studentId"
                                type="text"
                                value={universityDetails.studentId}
                                onChange={(e) => onInputChange('studentId', e.target.value)}
                                className={`bg-background-color ${formErrors.studentId ? 'border-red-500' : ''}`}
                                placeholder="Enter student ID number"
                            />
                            {formErrors.studentId && (
                                <p className="text-sm text-red-600">{formErrors.studentId}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="yearOfStudy">Year of Study *</Label>
                            <Select
                                value={universityDetails.yearOfStudy}
                                onValueChange={(value) => onInputChange('yearOfStudy', value)}
                            >
                                <SelectTrigger className={`bg-background-color ${formErrors.yearOfStudy ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Year 1">Year 1</SelectItem>
                                    <SelectItem value="Year 2">Year 2</SelectItem>
                                    <SelectItem value="Year 3">Year 3</SelectItem>
                                    <SelectItem value="Year 4">Year 4</SelectItem>
                                    <SelectItem value="Year 5">Year 5</SelectItem>
                                    <SelectItem value="Year 6">Year 6</SelectItem>
                                </SelectContent>
                            </Select>
                            {formErrors.yearOfStudy && (
                                <p className="text-sm text-red-600">{formErrors.yearOfStudy}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course">Course/Program *</Label>
                        <Input
                            id="course"
                            type="text"
                            value={universityDetails.course}
                            onChange={(e) => onInputChange('course', e.target.value)}
                            className={`bg-background-color ${formErrors.course ? 'border-red-500' : ''}`}
                            placeholder="e.g., Bachelor of Commerce"
                        />
                        {formErrors.course && (
                            <p className="text-sm text-red-600">{formErrors.course}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="universityEmail">Email *</Label>
                        <Input
                            id="universityEmail"
                            type="email"
                            value={universityDetails.universityEmail}
                            onChange={(e) => onInputChange('universityEmail', e.target.value)}
                            className={`bg-background-color ${formErrors.universityEmail ? 'border-red-500' : ''}`}
                            placeholder="e.g., student@university.ac.ke"
                        />
                        {formErrors.universityEmail && (
                            <p className="text-sm text-red-600">{formErrors.universityEmail}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="studentIdDocument">Upload Student ID *</Label>
                        <div className="flex items-center gap-4">
                            <label
                                htmlFor="studentIdDocument"
                                className={`flex-1 flex items-center justify-center px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${formErrors.studentIdDocument ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <div className="text-center">
                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        {universityDetails.studentIdDocument
                                            ? universityDetails.studentIdDocument.name
                                            : 'Click to upload Student ID (JPG, PNG, PDF - Max 5MB)'}
                                    </p>
                                </div>
                                <input
                                    id="studentIdDocument"
                                    type="file"
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        {formErrors.studentIdDocument && (
                            <p className="text-sm text-red-600">{formErrors.studentIdDocument}</p>
                        )}
                        {studentIdPreview && !studentIdPreview.includes('pdf') && (
                            <div className="mt-4">
                                <img
                                    src={studentIdPreview}
                                    alt="Student ID Preview"
                                    className="max-w-xs h-auto rounded-lg border border-border-color"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between pt-6">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="px-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <Button
                        onClick={onNext}
                        className="bg-brand-blue hover:bg-blue-700 px-8"
                    >
                        Next: Terms & Conditions
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
