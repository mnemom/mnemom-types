/**
 * @mnemom/types — Shared type definitions for Mnemom services and SDKs.
 *
 * @example
 * ```typescript
 * import type { ReputationScore, ReputationGrade } from '@mnemom/types';
 * import { GRADE_ORDINALS, COMPONENT_WEIGHTS } from '@mnemom/types';
 * ```
 */

// Reputation types
export type {
  ReputationGrade,
  ConfidenceLevel,
  ReputationComponent,
  ReputationScore,
  A2ATrustExtension,
} from './reputation';

// Gate types
export type {
  ReputationGateConfig,
  GateResult,
} from './gate';

// Constants
export {
  GRADE_ORDINALS,
  GRADE_SCALE,
  COMPONENT_WEIGHTS,
} from './constants';

export type {
  GradeScaleEntry,
  ComponentWeightEntry,
} from './constants';
