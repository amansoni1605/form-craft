"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useForm, type FieldValues, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";

// ─── Context ──────────────────────────────────────────────────────────────────
type WizardContextValue = {
  step: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  goBack: () => void;
  allData: Record<string, unknown>;
};

const WizardContext = createContext<WizardContextValue | null>(null);
export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within FormWizard");
  return ctx;
};

// ─── FormStep ────────────────────────────────────────────────────────────────
type FormStepProps<T extends FieldValues> = {
  schema: ZodType<T>;
  title: string;
  children: (form: ReturnType<typeof useForm<T>>) => ReactNode;
  defaultValues?: DefaultValues<T>;
};

export function FormStep<T extends FieldValues>(_props: FormStepProps<T>) {
  // Rendered by FormWizard — this component is a config node only
  return null;
}

// ─── FormWizard ───────────────────────────────────────────────────────────────
type StepConfig = {
  schema: ZodType;
  title: string;
  children: (form: ReturnType<typeof useForm>) => ReactNode;
  defaultValues?: DefaultValues<FieldValues>;
};

type FormWizardProps = {
  steps: StepConfig[];
  onComplete: (data: Record<string, unknown>) => void;
};

export function FormWizard({ steps, onComplete }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [allData, setAllData] = useState<Record<string, unknown>>({});

  const step = steps[currentStep];
  const form = useForm({
    resolver: zodResolver(step.schema),
    defaultValues: step.defaultValues,
  });

  const handleNext = useCallback(
    form.handleSubmit((data) => {
      const merged = { ...allData, ...data };
      setAllData(merged);

      if (currentStep === steps.length - 1) {
        onComplete(merged);
      } else {
        setCurrentStep((s) => s + 1);
        form.reset(steps[currentStep + 1]?.defaultValues);
      }
    }),
    [currentStep, allData, steps, onComplete]
  );

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  return (
    <WizardContext.Provider
      value={{
        step: currentStep,
        totalSteps: steps.length,
        isFirst: currentStep === 0,
        isLast: currentStep === steps.length - 1,
        goBack,
        allData,
      }}
    >
      <div className="w-full max-w-lg mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < currentStep
                    ? "bg-blue-600 text-white"
                    : i === currentStep
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < currentStep ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  i === currentStep ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {s.title}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px transition-colors ${
                    i < currentStep ? "bg-blue-300" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current step */}
        <form onSubmit={handleNext} noValidate>
          <h2 className="text-xl font-bold text-slate-900 mb-6">{step.title}</h2>
          {step.children(form)}

          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === steps.length - 1 ? "Submit" : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </WizardContext.Provider>
  );
}
