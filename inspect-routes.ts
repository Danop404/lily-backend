import { createApp } from "./src/app";
import request from "supertest";

async function main() {
  const app = createApp();
  await request(app).get("/api/v1/health");

  const router = (app as any).router;
  if (!router) { console.log("NO ROUTER"); return; }

  // Find the apiRouter layer specifically
  for (const l of router.stack) {
    if (l.name === "router" && l.handle?.stack) {
      // Check matchers structure deeply
      console.log("Layer:", l.name);
      console.log("Matchers:", JSON.stringify(l.matchers, null, 2));
      console.log("Regexp:", l.regexp?.toString());
      console.log("Keys:", l.keys);
      
      // Inspect sub-stack
      for (const sub of l.handle.stack) {
         console.log("  Sub:", sub.name, sub.route?.path);
         console.log("  Sub Matchers:", JSON.stringify(sub.matchers, null, 2));
         console.log("  Sub Regexp:", sub.regexp?.toString());
      }
    }
  }
}

main().catch(console.error);
