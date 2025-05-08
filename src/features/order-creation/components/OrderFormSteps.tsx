
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, CreditCard, FileText, Info, CheckCircle } from "lucide-react";
import BasicDetailsStep from "./BasicDetailsStep";
import AdditionalDetailsStep from "./AdditionalDetailsStep";

interface OrderFormStepsProps {
  currentStep: number;
  totalSteps: number;
  formProps: any; // Using any here for simplicity, but could be typed more precisely
}

export default function OrderFormSteps({ 
  currentStep, 
  totalSteps, 
  formProps 
}: OrderFormStepsProps) {
  const { 
    theme, 
    t, 
    handleSubmit, 
    calculationResult, 
    calculateOrder, 
    isSubmitting, 
    selectedPair, 
    amount, 
    country, 
    isCashPair, 
    city, 
    setCurrentStep,
    showCalculation
  } = formProps;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <AlertTitle className="mb-1 font-semibold">{t('minOrderSize')}</AlertTitle>
            <AlertDescription>
              {t('otcMinimumReq')}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <Card className={cn(
        "shadow-md border overflow-hidden",
        theme === "light" 
          ? "bg-white border-gray-200" 
          : "bg-otc-card border-otc-active"
      )}>
        <CardHeader className="pb-6">
          <CardTitle className={cn(
            "text-2xl flex items-center gap-3",
            theme === "light" ? "text-gray-900" : "text-white"
          )}>
            {currentStep === 1 ? (
              <>
                <CreditCard className="w-6 h-6" /> 
                {t('basicDetails')}
              </>
            ) : (
              <>
                <FileText className="w-6 h-6" /> 
                {t('additionalDetails')}
              </>
            )}
          </CardTitle>
          <CardDescription className={cn(
            "text-base",
            theme === "light" ? "text-gray-600" : "text-gray-400"
          )}>
            {currentStep === 1 ? t('enterOrderDetails') : t('paymentDetails')}
          </CardDescription>

          {/* Step indicator */}
          <div className="mt-6 relative">
            <div className={cn(
              "absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2",
              theme === "light" ? "bg-gray-200" : "bg-otc-active"
            )}></div>
            <div className="flex justify-between relative z-10">
              {Array.from({length: totalSteps}, (_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                      i + 1 === currentStep 
                        ? theme === "light" 
                            ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100" 
                            : "bg-otc-primary text-black shadow-md ring-4 ring-otc-primary/20"
                        : i + 1 < currentStep
                          ? theme === "light" 
                              ? "bg-green-500 text-white" 
                              : "bg-green-600 text-white"
                          : theme === "light" 
                              ? "bg-white text-gray-500 border border-gray-300" 
                              : "bg-otc-active text-gray-400 border border-otc-active"
                    )}
                  >
                    {i + 1 < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={cn(
                    "mt-2 text-sm font-medium transition-colors",
                    i + 1 === currentStep
                      ? theme === "light" ? "text-blue-600" : "text-otc-primary"
                      : theme === "light" ? "text-gray-500" : "text-gray-400"
                  )}>
                    {i === 0 ? t('basicDetails') : t('additionalDetails')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-4">
          {/* Step 1 - Basic Details */}
          {currentStep === 1 && (
            <BasicDetailsStep formProps={formProps} />
          )}

          {/* Step 2 - Additional Details */}
          {currentStep === 2 && (
            <AdditionalDetailsStep formProps={formProps} />
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          {currentStep === 1 ? (
            // Only show the Back button on step 1
            <Button
              type="button"
              variant="outline"
              className={cn(
                "flex-1 py-6",
                theme === "light"
                  ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                  : "border-otc-active hover:bg-otc-active/30 text-white"
              )}
              onClick={() => window.history.back()}
            >
              {t('cancel')}
            </Button>
          ) : (
            // On step 2, show Back and Submit buttons
            <>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "flex-1 py-6",
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
                  "flex-1 py-6 group",
                  theme === "light"
                    ? ""
                    : "bg-otc-primary text-black hover:bg-otc-primary/90"
                )}
                disabled={isSubmitting || !selectedPair || !amount || !country || (isCashPair() && !city)}
              >
                <span className="flex items-center gap-2">
                  {isSubmitting ? t('creatingOrder') : t('createOrder')}
                  {!isSubmitting && (
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  )}
                </span>
              </Button>
            </>
          )}
          
          {/* On step 1, show Continue button (if calculation is shown) or Calculate button (if not shown) */}
          {currentStep === 1 && (
            <Button
              type="button"
              variant={theme === "light" ? "gradient" : "default"}
              className={cn(
                "flex-1 py-6 group",
                theme === "light"
                  ? ""
                  : "bg-otc-primary text-black hover:bg-otc-primary/90"
              )}
              onClick={() => showCalculation && calculationResult ? setCurrentStep(2) : calculateOrder()}
              disabled={!selectedPair || !amount || parseFloat(amount) <= 0}
            >
              <span className="flex items-center gap-2">
                {showCalculation && calculationResult ? t('continue') : t('calculateSummary')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
