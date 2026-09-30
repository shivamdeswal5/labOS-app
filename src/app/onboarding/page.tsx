'use client';

import * as React from 'react';
import { OnboardingLayout } from '@/features/onboarding/components/onboarding-layout';
import { StepLabProfile } from '@/features/onboarding/components/step-lab-profile';
import { StepPathologist } from '@/features/onboarding/components/step-pathologist';
import { StepTestCatalog } from '@/features/onboarding/components/step-test-catalog';
import { StepConfirmation } from '@/features/onboarding/components/step-confirmation';
import type { OnboardingWizardState } from '@/features/onboarding/types';

const INITIAL_STATE: OnboardingWizardState = {
  step: 1,
  labProfile: {
    accentColor: '#0f172a',
    reportLanguage: 'en',
    footerNote:
      'This report is issued by a NABL accredited laboratory. Not valid for medico-legal purposes.',
  },
  pathologist: {},
  catalog: { panels: [] },
};

export default function OnboardingPage() {
  const [state, setState] = React.useState<OnboardingWizardState>(INITIAL_STATE);

  const goToStep = (step: OnboardingWizardState['step']) => {
    setState((prev) => ({ ...prev, step }));
  };

  return (
    <OnboardingLayout currentStep={state.step}>
      {state.step === 1 && (
        <StepLabProfile
          initialData={state.labProfile}
          onNext={(data) => {
            setState((prev) => ({ ...prev, labProfile: data, step: 2 }));
          }}
        />
      )}

      {state.step === 2 && (
        <StepPathologist
          initialData={state.pathologist}
          onNext={(data) => {
            setState((prev) => ({ ...prev, pathologist: data, step: 3 }));
          }}
          onBack={() => goToStep(1)}
        />
      )}

      {state.step === 3 && (
        <StepTestCatalog
          initialData={state.catalog}
          onNext={(data) => {
            setState((prev) => ({ ...prev, catalog: data, step: 4 }));
          }}
          onBack={() => goToStep(2)}
        />
      )}

      {state.step === 4 && <StepConfirmation state={state} />}
    </OnboardingLayout>
  );
}
