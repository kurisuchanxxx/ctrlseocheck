interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-dark mb-4">Analisi in corso...</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              index < currentStep
                ? 'bg-green-500 text-white'
                : index === currentStep
                ? 'bg-primary text-white animate-pulse'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${
                index <= currentStep ? 'text-dark' : 'text-gray-400'
              }`}>
                {step}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

