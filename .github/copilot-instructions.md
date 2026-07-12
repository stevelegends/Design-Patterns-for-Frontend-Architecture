# Frontend Architecture Patterns Agent Instructions

This repository demonstrates layered frontend architecture patterns for a withdrawal feature in both React and Angular.

## Project structure
- Keep feature code organized by framework under the root folders:
  - react/src/features/<feature>
  - angular/src/features/<feature>
- Follow this standard per feature:
  - domain: models, types, and domain rules
  - application: use cases, validation, builders, and orchestration
  - infrastructure: repositories, adapters, and external API abstractions
  - presentation: UI components, screens, or Angular presenters

## Naming conventions
- Use lowercase file names with dot-separated domain names, for example:
  - withdrawal.model.ts
  - withdrawal.adapter.ts
  - validation.ts
  - withdrawal.builder.ts
  - withdrawal.usecases.ts
  - WithdrawalScreen.tsx for React presentation files
  - withdrawal.component.ts for Angular presentation files

## Architecture guidance
- Keep domain logic free from UI concerns.
- Keep UI code focused on rendering and user interaction.
- Put business workflows in the application layer.
- Put API and persistence concerns in the infrastructure layer.
- Prefer explicit state models for multi-step flows such as validation, verification, submission, success, and error.

## When adding a new feature
1. Create a new feature folder under the relevant framework.
2. Add domain models and types first.
3. Add application use cases and validation logic.
4. Add infrastructure abstractions for repositories or adapters.
5. Add presentation code for the framework-specific UI.
6. Update the README if the structure or workflow changes.

## When adding new business rules
- Model them in the domain or application layer first.
- Represent user-visible outcomes as explicit flow states.
- Handle failure scenarios gracefully with clear recovery states such as:
  - retryable failure
  - retry limit reached
  - timeout or cooldown state
- Avoid putting business rules directly inside UI components.

## Preferred implementation style
- Prefer small, focused classes and use cases.
- Prefer explicit error handling and meaningful error messages.
- Prefer readable, framework-specific presentation layers that delegate behavior to the application layer.

## Default behavior for new feature requests
When asked to add a new feature or extend business behavior:
- create or update the appropriate domain models
- add or adjust use cases
- wire the flow into the presentation layer
- keep the React and Angular versions aligned where possible
- keep the code organized in the same MVVM-style structure
