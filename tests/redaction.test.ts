@@ -0,0 +1,42 @@
+import { describe, it, expect } from 'vitest';
+import request from 'supertest';
+import app from '../src/app';
+
+describe('pino-http log redaction', () => {
+  it('redacts sensitive query keys and omits body/auth headers from logs', async () => {
+    const logs: any[] = [];
+    const originalWrite = process.stdout.write;
+    process.stdout.write = function (chunk: any) {
+      try {
+        const line = typeof chunk === 'string' ? chunk : chunk.toString();
+        const parsed = JSON.parse(line.trim());
+        if (parsed.req) logs.push(parsed);
+      } catch {}
+      return true;
+    } as any;
+
+    await request(app)
+      .get('/health?api_key=supersecret&seed=my-wallet-seed&safe=value')
+      .set('Authorization', 'Bearer leak-me')
+      .send({ password: 'leak-me' });
+
+    process.stdout.write = originalWrite;
+
+    expect(logs.length).toBeGreaterThan(0);
+    const reqLog = logs[0].req;
+
+    // Body and Authorization must never appear
+    expect(reqLog.body).toBeUndefined();
+    expect(reqLog.headers).toBeUndefined();
+
+    // Sensitive keys redacted, safe param preserved
+    expect(reqLog.url).toContain('api_key=%5BREDACTED%5D');
+    expect(reqLog.url).toContain('seed=%5BREDACTED%5D');
+    expect(reqLog.url).toContain('safe=value');
+    expect(reqLog.url).not.toContain('supersecret');
+    expect(reqLog.url).not.toContain('my-wallet-seed');
+  });
+});