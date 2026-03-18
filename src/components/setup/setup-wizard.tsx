"use client";

import { useState } from "react";
import { useConnectionStore } from "@/stores/connectionStore";
import { StepIndicator } from "./step-indicator";
import { WelcomeStep } from "./steps/welcome-step";
import { ConnectionStep } from "./steps/connection-step";
import { TestStep } from "./steps/test-step";
import { CompleteStep } from "./steps/complete-step";
import type { ServerInfo } from "@/lib/gateway";

export function SetupWizard() {
  const [step, setStep] = useState(0);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

  const gatewayUrl = useConnectionStore((s) => s.gatewayUrl);
  const gatewayToken = useConnectionStore((s) => s.gatewayToken);
  const setGatewayUrl = useConnectionStore((s) => s.setGatewayUrl);
  const setGatewayToken = useConnectionStore((s) => s.setGatewayToken);
  const setSetupCompleted = useConnectionStore((s) => s.setSetupCompleted);

  const handleFinish = () => {
    setSetupCompleted(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface-bg)] px-4">
      <div className="mb-8">
        <StepIndicator totalSteps={4} currentStep={step} />
      </div>

      {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}

      {step === 1 && (
        <ConnectionStep
          url={gatewayUrl}
          token={gatewayToken}
          onUrlChange={setGatewayUrl}
          onTokenChange={setGatewayToken}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <TestStep
          url={gatewayUrl}
          token={gatewayToken}
          onBack={() => setStep(1)}
          onNext={(info) => {
            setServerInfo(info);
            setStep(3);
          }}
        />
      )}

      {step === 3 && serverInfo && (
        <CompleteStep serverInfo={serverInfo} onFinish={handleFinish} />
      )}
    </div>
  );
}
