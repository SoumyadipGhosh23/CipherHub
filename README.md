# CipherHub

CipherHub is a small interactive crypto playground built with Next.js. It helps you see how things like plain text, hashing, backend encryption, end-to-end encryption, and TLS behave without reading a wall of theory first.

## What to look at first

- `src/app/page.tsx` -> app entry
- `src/components/cipher-hub/` -> main UI and interaction flow
- `src/services/` -> crypto-related logic
- `src/constants/` -> algorithm options and labels
- `src/types/` -> shared TypeScript types

## Run it

```bash
yarn
yarn dev
```

Then open `http://localhost:3000`.

## How to understand the project fast

1. Start with `src/components/cipher-hub/CipherHub.tsx` because that is basically the whole experience.
2. Follow the imported components to understand the UI pieces.
3. Check `src/services/` and `src/lib/crypto/` when you want the actual crypto flow.
4. Skim `src/constants/` if you want to know what algorithms and models the app supports.

## How to contribute

Keep it simple:

- reuse existing components, helpers, and patterns
- keep UI in components and logic in services/lib
- use `yarn`
- stay strict with TypeScript
- make small focused changes

If you are new here, a great first contribution is improving one flow, one explanation, or one UI detail inside `cipher-hub`.

## Adding more algorithms, types, or subtypes

Here is the usual flow:

1. Add or update the type union first in `src/types/crypto.ts` or `src/types/cipher-hub.ts`.
2. Add the visible option in the matching file inside `src/constants/`.
3. Add the actual logic in `src/services/` or `src/lib/crypto/`.
4. Wire it into `src/components/cipher-hub/CipherHub.tsx`.
5. If needed, update the small UI selectors inside `src/components/cipher-hub/`.

Quick examples:

- new backend algorithm -> update `src/constants/algorithms.ts`, `src/types/crypto.ts`, and the backend encryption service
- new hashing algorithm -> update `src/constants/hashing-algorithms.ts`, `src/types/crypto.ts`, and `src/services/hashing.service.ts`
- new public key subtype -> update `src/constants/public-key-algorithms.ts`, `src/types/crypto.ts`, and the asymmetric flow used by `CipherHub`
- new security model type -> add it in `src/constants/security-models.ts`, `src/types/cipher-hub.ts`, then add its flow/UI in `CipherHub`

Rule of thumb: if users should be able to select it, it probably needs updates in `types`, `constants`, logic, and `CipherHub`.
