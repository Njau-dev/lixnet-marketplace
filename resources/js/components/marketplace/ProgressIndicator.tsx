import { CheckCircle } from 'lucide-react';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
    const steps = [
        { number: 1, label: 'Personal Details' },
        { number: 2, label: 'University Info' },
        { number: 3, label: 'Terms & Conditions' },
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep >= step.number
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {currentStep > step.number ? (
                                    <CheckCircle className="w-6 h-6" />
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span className="text-sm mt-2 font-medium text-center max-w-[100px]">
                                {step.label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={`w-16 md:w-24 h-1 mx-2 ${currentStep > step.number ? 'bg-brand-blue' : 'bg-gray-200'
                                    }`}
                            ></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
