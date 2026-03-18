"use client";

import { useState, useEffect } from "react";
import { useConnectionStore } from "@/stores/connectionStore";
import { StepIndicator } from "./step-indicator";
import { WelcomeStep } from "./steps/welcome-step";
import { AuthStep } from "./steps/auth-step";
import { ConnectionStep } from "./steps/connection-step";
import { TestStep } from "./steps/test-step";
import { CompleteStep } from "./steps/complete-step";
import type { ServerInfo } from "@/lib/gateway";

export function SetupWizard() {
  const [step, setStep] = useState(0);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [adminExists, setAdminExists] = useState(false);

  const gatewayUrl = useConnectionStore((s) => s.gatewayUrl);
  const gatewayToken = useConnectionStore((s) => s.gatewayToken);
  const setGatewayUrl = useConnectionStore((s) => s.setGatewayUrl);
  const setGatewayToken = useConnectionStore((s) => s.setGatewayToken);
  const setSetupCompleted = useConnectionStore((s) => s.setSetupCompleted);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setAdminExists(!!data.configured))
      .catch(() => {});
  }, []);

  const handleFinish = () => {
    setSetupCompleted(true);
  };

  const goNextFromWelcome = () => setStep(adminExists ? 2 : 1);
  const goBackFromConnection = () => setStep(adminExists ? 0 : 1);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface-bg)] px-4">
      <div className="mb-8">
        <StepIndicator totalSteps={5} currentStep={step} />
      </div>

      {step === 0 && <WelcomeStep onNext={goNextFromWelcome} />}

      {step === 1 && (
        <AuthStep
          adminExists={adminExists}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
          onSkip={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <ConnectionStep
          url={gatewayUrl}
          token={gatewayToken}
          onUrlChange={setGatewayUrl}
          onTokenChange={setGatewayToken}
          onBack={goBackFromConnection}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <TestStep
          url={gatewayUrl}
          token={gatewayToken}
          onBack={() => setStep(2)}
          onNext={(info) => {
            setServerInfo(info);
            setStep(4);
          }}
        />
      )}

      {step === 4 && serverInfo && (
        <CompleteStep serverInfo={serverInfo} onFinish={handleFinish} />
      )}
    </div>
  );
}
