import type { Errors, FormState } from './state'

export * from './state'

export interface StepProps {
  state: FormState
  update: (patch: Partial<FormState>) => void
  errors: Errors
}
