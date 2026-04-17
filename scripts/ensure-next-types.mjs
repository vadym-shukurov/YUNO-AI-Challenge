import fs from "node:fs";

fs.mkdirSync(".next/types", { recursive: true });

// `tsc --incremental` can keep stale `.next/types/**` file references in
// `tsconfig.tsbuildinfo` after a build output cleanup. Remove it so `npm run typecheck`
// is reliable on a fresh checkout and in CI.
try {
  fs.rmSync("tsconfig.tsbuildinfo");
} catch {
  // ignore
}

