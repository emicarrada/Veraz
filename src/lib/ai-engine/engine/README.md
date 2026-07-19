# AI Engine — facade

Future home of the runtime Engine implementation:

- Resolve config → mode + provider
- Gate capabilities by mode
- Delegate to the selected `AIProvider`
- Catch failures, log, return soft-fail `AIResult`
- Never throw into the publishing path

No implementation yet. Contracts live in `../types/engine.ts`.
