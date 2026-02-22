"""mnemom-types — Shared type definitions for Mnemom services and SDKs.

Example::

    from mnemom_types import ReputationScore, ReputationGrade
    from mnemom_types import GRADE_ORDINALS, COMPONENT_WEIGHTS
"""

from mnemom_types.constants import (
    COMPONENT_WEIGHTS,
    GRADE_ORDINALS,
    GRADE_SCALE,
    ComponentWeightEntry,
    GradeScaleEntry,
)
from mnemom_types.gate import GateResult, ReputationGateConfig
from mnemom_types.reputation import (
    A2ATrustExtension,
    ConfidenceLevel,
    ReputationComponent,
    ReputationGrade,
    ReputationScore,
)

__all__ = [
    # Reputation types
    "ReputationGrade",
    "ConfidenceLevel",
    "ReputationComponent",
    "ReputationScore",
    "A2ATrustExtension",
    # Gate types
    "ReputationGateConfig",
    "GateResult",
    # Constants
    "GRADE_ORDINALS",
    "GRADE_SCALE",
    "COMPONENT_WEIGHTS",
    "GradeScaleEntry",
    "ComponentWeightEntry",
]
