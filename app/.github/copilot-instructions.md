# Copilot Instructions

## Project context

- This repository is a TypeScript app located under `src/`.
- Prefer adding or updating code within `src/`.
- Avoid editing build outputs and dependencies (`dist/`, `node_modules/`).

## Coding conventions

- Use TypeScript and follow existing patterns in nearby files.
- Keep functions small and focused; favor clarity over cleverness.
- Reuse existing utilities or adapters instead of adding duplicates.
- Add concise comments only when logic is non-obvious.

## Changes and safety

- Make minimal, targeted edits that match the current style.
- If a request is ambiguous, ask a short clarifying question.
- Do not introduce new dependencies without explicit approval.

## Testing

- If a change affects runtime behavior, suggest a relevant test or basic manual check.
