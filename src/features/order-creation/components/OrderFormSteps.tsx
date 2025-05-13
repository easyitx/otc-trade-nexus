
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, CreditCard, FileText, Info, CheckCircle } from "lucide-react";
import BasicDetailsStep from "./BasicDetailsStep";
import AdditionalDetailsStep from "./AdditionalDetailsStep";
import { FormProps } from "../types";

interface OrderFormStepsProps {
  formProps: FormProps;
}

export default function OrderFormSteps({ formProps }: OrderFormStepsProps) {
  const { 
    theme, 
    t, 
    handleSubmit, 
    calculationResult, 
    calculateOrder, 
    isSubmitting, 
    formData,
    isCashPair, 
    currentStep,
    setCurrentStep,
    showCalculation
  } = formProps;

  const { selectedPair, amount, country, city } = formData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert className={cn(
        "border-l-4 shadow-sm",
        theme === "light"
          ? "bg-blue-50 border-blue-500 text-blue-800"
          : "bg-otc-secondary/20 border-l-otc-primary text-white"
      )}>
        <div className="flex items-start">
          <Info className={cn(
            "h-5 w-5 mt-0.5",
            theme === "light" ? "text-blue-600" : "text-otc-primary"
          )} />
          <div className="ml-3">
            <AlertTitle className="mb-1 font-semibold text-sm">{t('minOrderSize')}</AlertTitle>
            <AlertDescription className="text-sm">
              {t('otcMinimumReq')}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <Card className={cn(
        "shadow-md border",
        theme === "light"
          ? "bg-white border-gray-200"
          : "bg-otc-card border-otc-active"
      )}>
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={cn(
            "text-xl flex items-center gap-2",
            theme === "light" ? "text-gray-900" : "text-white"
          )}>
            {currentStep === 1 ? (
              <>
                <CreditCard className="w-5 h-5" />
                {t('basicDetails')}
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                {t('additionalDetails')}
              </>
            )}
          </CardTitle>
          <CardDescription className={cn(
            "text-sm",
            theme === "light" ? "text-gray-600" : "text-gray-400"
          )}>
            {currentStep === 1 ? t('enterOrderDetails') : t('paymentDetails')}
          </CardDescription>

          {/* Step indicator - more compact */}
          <div className="mt-4 relative">
            <div className={cn(
              "absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2",
              theme === "light" ? "bg-gray-200" : "bg-otc-active"
            )}></div>
            <div className="flex justify-between relative z-10">
              {/* Render only 2 steps instead of totalSteps */}
              {[1, 2].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                      stepNumber === currentStep
                        ? theme === "light"
                            ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-100"
                            : "bg-otc-primary text-black shadow-md ring-2 ring-otc-primary/20"
                        : stepNumber < currentStep
                          ? theme === "light"
                              ? "bg-green-500 text-white"
                              : "bg-green-600 text-white"
                          : theme === "light"
                              ? "bg-white text-gray-500 border border-gray-300"
                              : "bg-otc-active text-gray-400 border border-otc-active"
                    )}
                  >
                    {stepNumber < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className={cn(
                    "mt-1 text-xs font-medium transition-colors",
                    stepNumber === currentStep
                      ? theme === "light" ? "text-blue-600" : "text-otc-primary"
                      : theme === "light" ? "text-gray-500" : "text-gray-400"
                  )}>
                    {stepNumber === 1
                      ? t('basicDetails')
                      : t('additionalDetails')
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="space-y-6">
            {/* Step 1 - Basic Details */}
            {currentStep === 1 && (
              <BasicDetailsStep formProps={formProps} />
            )}

            {/* Step 2 - Additional Details */}
            {currentStep === 2 && (
              <AdditionalDetailsStep formProps={formProps} />
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-row justify-end gap-3 pt-4 pb-5 border-t">
          {currentStep === 1 ? (
            /* Only show Continue/Calculate button on step 1 */
            <Button
              type="button"
              variant={theme === "light" ? "gradient" : "default"}
              className={cn(
                "py-2 px-4 group",
                theme === "light"
                  ? ""
                  : "bg-otc-primary text-black hover:bg-otc-primary/90"
              )}
              onClick={() => showCalculation && calculationResult ? setCurrentStep(2) : calculateOrder()}
              disabled={!selectedPair || !amount || parseFloat(amount) <= 0}
            >
              <span className="flex items-center gap-2 text-sm">
                {showCalculation && calculationResult ? t('continue') : t('calculateSummary')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          ) : (
            /* On step 2, show Back and Submit buttons */
            <>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "py-2 px-4",
                  theme === "light"
                    ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                    : "border-otc-active hover:bg-otc-active/30 text-white"
                )}
                onClick={() => setCurrentStep(1)}
              >
                {t('back')}
              </Button>

              <Button
                type="submit"
                variant={theme === "light" ? "gradient" : "default"}
                className={cn(
                  "py-2 px-4 group",
                  theme === "light"
                    ? ""
                    : "bg-otc-primary text-black hover:bg-otc-primary/90"
                )}
                disabled={isSubmitting || !selectedPair || !amount || !country || (isCashPair() && !city)}
              >
                <span className="flex items-center gap-2 text-sm">
                  {isSubmitting ? t('creatingOrder') : t('createOrder')}
                  {!isSubmitting && (
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  )}
                </span>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
