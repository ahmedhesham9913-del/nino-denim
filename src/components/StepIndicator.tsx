"use client";

import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const SIGNATURE_EASE = [0.16, 1, 0.3, 1] as const;

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div key={step} className="flex items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`
                    relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                    font-[var(--font-display)] transition-colors duration-300
                    ${isCompleted ? "bg-nino-500 text-white" : ""}
                    ${isActive ? "bg-nino-950 text-white" : ""}
                    ${isFuture ? "bg-nino-100/50 text-nino-400" : ""}
                  `}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.4, ease: SIGNATURE_EASE }}
                >
                  {isCompleted ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </motion.div>

                {/* Label — hidden on mobile */}
                <span
                  className={`
                    hidden sm:block mt-2 text-xs font-medium tracking-wide font-[var(--font-display)]
                    ${isCompleted ? "text-nino-500" : ""}
                    ${isActive ? "text-nino-950" : ""}
                    ${isFuture ? "text-nino-400" : ""}
                  `}
                >
                  {step}
                </span>
              </div>

              {/* Connecting line (not after last step) */}
              {index < steps.length - 1 && (
                <div className="relative w-16 sm:w-24 h-[2px] mx-2 sm:mx-3 mb-0 sm:mb-6">
                  <div className="absolute inset-0 bg-nino-200 rounded-full" />
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-nino-500 rounded-full"
                    initial={false}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.5, ease: SIGNATURE_EASE }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
