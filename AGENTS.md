# Agent Guidelines for Frontend Projects

Use this structure as a reusable standard for frontend projects that follow layered architecture patterns in both React and Angular.

## Architecture conventions
- Preserve the project's existing structure when it already has a clear convention. Do not force a new layout unless the project is missing a consistent one.
- When a feature-based structure is appropriate, keep feature code under a feature folder such as:
  - src/features/<feature>
  - features/<feature>
  - src/modules/<feature> if that matches the project's existing convention
- Follow this structure per feature:
  - domain: models, types, and domain rules
  - application: use cases, validation, builders, and orchestration
  - infrastructure: repositories, adapters, and external API abstractions
  - presentation: UI components, screens, pages, views, or framework-specific presenters

## Naming conventions
- Follow the project's existing naming style when it already has one. If the project does not have a strong convention, use lowercase file names with dot-separated domain names.
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
5. Keep framework-specific implementations aligned where possible.

## Business rule guidance
- Model rules in domain/application layers rather than UI.
- Represent outcomes as explicit flow states.
- Handle failure states such as retryable failure, retry limit reached, and cooldown.
- Prefer small, focused use cases and explicit error handling.

## Reuse guidance
- This standard can be copied into any frontend project that wants consistent layered organization.
- Replace the example feature name with the real feature you are implementing.
- If the target project already has a different structure, adapt the folder names and file placement to fit that project instead of forcing this layout.
