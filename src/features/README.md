# features

Feature modules (modular monolith boundaries).

Each feature owns its UI, hooks, services, types, and utils.
Other features must import only through the feature `index.ts` public API.
