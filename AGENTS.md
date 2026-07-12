# Agent Guidelines for Frontend Projects

Use this structure as a reusable standard for frontend projects that follow layered architecture patterns in both React and Angular.

## Architecture conventions
- Keep feature code under:
  - react/src/features/<feature>
  - angular/src/features/<feature>
- Follow this structure per feature:
  - domain: models, types, and domain rules
  - application: use cases, validation, builders, and orchestration
  - infrastructure: repositories, adapters, and external API abstractions
  - presentation: UI components, screens, or Angular presenters

## Naming conventions
- Use lowercase file names with dot-separated domain names.
- Examples:
  - feature.model.ts
  - feature.adapter.ts
  - validation.ts
  - feature.builder.ts
  - feature.usecases.ts
  - FeatureScreen.tsx for React presentation files
  - feature.component.ts for Angular presentation files

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
- Prefer small, focused use cases and explicit error handling.

## Reuse guidance
- This standard can be copied into any frontend project that wants consistent MVVM-style organization.
- Replace the example feature name with the real feature you are implementing.
