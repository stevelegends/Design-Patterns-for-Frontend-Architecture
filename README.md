# Design Patterns for Frontend Architecture

This repository now demonstrates a layered MVVM structure for a withdrawal flow in both React and Angular.

## Structure

- React implementation: [react/src/features/withdrawal](react/src/features/withdrawal)
- Angular implementation: [angular/src/features/withdrawal](angular/src/features/withdrawal)

## React folder layout

- domain: models and types
- application: use cases, validation, builder
- infrastructure: adapters and repositories
- presentation: screen and view-model logic

## Angular folder layout

- domain: models and types
- application: use cases, validation, builder
- infrastructure: adapters and repositories
- presentation: Angular component