# Architecture Decision Records (ADR) Log

This document records architectural decisions for Moonbase Margin. Any deviation, new assumption, or contract change requires human approval and an entry here (B4.12).

---

## ADR Template

```markdown
### ADR-XXX: [Title]

- **Date:** YYYY-MM-DD
- **Status:** Proposed / Accepted / Rejected
- **Context:** [What problem are we trying to solve?]
- **Decision:** [What did we decide?]
- **Consequences:** [What are the positive and negative implications?]
```

---

### ADR-001: Bootstrap Repository Architecture and Toolchain

- **Date:** 2026-10-15
- **Status:** Accepted
- **Context:** Establishing the repository structure, toolchains (Vite, Vitest, TypeScript, ESLint, Prettier), and CI pipeline for the Moonbase Margin simulation.
- **Decision:** Follow the repository specification in B3 and dependency bounds in B2.
- **Consequences:** Provides reproducible environment, strict TypeScript type checking, unit testing capability, and linting.

---

### ADR-002: Simulation Contract Types, Parameter Validation, and Mass Calculations (L1)

- **Date:** 2026-10-15
- **Status:** Accepted
- **Context:** Spec B5.2, B5.3, B5.8, B6 require frozen engine types, strict parameter schema validation with typed getters, deterministic pseudo-random number generation, and mass calculation without numeric domain literals in code.
- **Decision:** Implemented frozen interfaces in `src/engine/types.ts` along with typed `EngineError`. Validated all 62 required parameters in `src/engine/params.ts`. Implemented standard 32-bit mulberry32 PRNG in `src/engine/rng.ts`. Implemented mass calculations pulling all coefficients strictly from parameters in `src/engine/mass.ts`.
- **Consequences:** Contracts are stable and frozen for subsequent simulation modules (L2-L5) and UI screens (L6-L8).
