# Agent Guidelines for This Repository

This repository demonstrates layered frontend architecture patterns for a withdrawal feature in both React and Angular.

## Architecture conventions
- Keep feature code under:
  - react/src/features/<feature>
  - angular/src/features/<feature>
- Follow this structure per feature:
  - domain: models, types, and domain rules
  - application: use cases, validation, builders, and orchestration
  - infrastructure: repositories, adapters, and external APIs
  - presentation: UI components, screens, or Angular presenters

## Naming conventions
- Use lowercase file names with dot-separated domain names.
- Examples:
  - withdrawal.model.ts
  - withdrawal.adapter.ts
  - validation.ts
  - withdrawal.builder.ts
  - withdrawal.usecases.ts
  - WithdrawalScreen.tsx
  - withdrawal.component.ts

## When adding new features or business rules
1. Add or update the domain models first.
2. Add or update application use cases and validation logic.
3. Add infrastructure abstractions if needed.
4. Wire the flow into the presentation layer.
5. Keep React and Angular implementations aligned where possible.

## Business rule guidance
- Model rules in domain/application layers rather than UI.
- Represent outcomes as explicit flow states.
- Handle failure states such as retryable failure, retry limit reached, and cooldown.
