// Guards that secrets cannot reach Git or the browser bundle.
//  1. No tracked/staged .env file other than *.example
//  2. Server-only variable names never appear in browser-reachable code
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const failures = [];

const tracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);

// 1) env files
for (const file of tracked) {
  const base = file.split("/").pop() ?? "";
  if (/^\.env(\..+)?$/.test(base) && !base.endsWith(".example")) {
    failures.push(`Env file would be committed: ${file}`);
  }
  if (/\.(pem|key|p12|pfx)$/.test(base)) failures.push(`Key material would be committed: ${file}`);
}

// 2) server-only names in browser-reachable code
const SERVER_ONLY = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "SERVICE_ROLE",
  "SMS_API_KEY",
  "PAYTABS_SERVER_KEY",
];
const browserReachable = tracked.filter(
  (f) =>
    (f.startsWith("apps/web/src/") || f.startsWith("apps/web/index.html")) &&
    /\.(ts|tsx|js|jsx|html|css)$/.test(f),
);
for (const file of browserReachable) {
  const text = readFileSync(file, "utf8");
  for (const name of SERVER_ONLY) {
    if (text.includes(name))
      failures.push(`Server-only name "${name}" found in browser code: ${file}`);
  }
  if (/VITE_[A-Z_]*(SECRET|SERVICE_ROLE|PRIVATE)/.test(text)) {
    failures.push(`Suspicious VITE_ secret-like variable in browser code: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Secret hygiene check FAILED:\n" + failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`Secret hygiene check passed (${tracked.length} files scanned).`);
