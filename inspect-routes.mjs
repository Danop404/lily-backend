import { createApp } from './src/app.js';
import request from 'supertest';

const app = createApp();
await request(app).get('/api/v1/health');

const router = app._router;
if (!router) { console.log('NO ROUTER'); process.exit(1); }

const collect = (stack, prefix = '') => {
  let routes = [];
  for (const l of stack) {
    if (l.route) {
      routes.push({ path: prefix + l.route.path, methods: Object.keys(l.route.methods) });
    } else if (l.handle?.stack) {
      let p = prefix;
      if (l.regexp && l.keys.length === 0) {
        const src = l.regexp.source;
        const m = src.match(/^\^\\\/(.+?)\\\/\?\(\?=\\\/\|\$\)/);
        if (m) p = prefix + '/' + m[1].replace(/\\\//g, '/');
      }
      routes = routes.concat(collect(l.handle.stack, p.replace(/\/+/g, '/')));
    }
  }
  return routes;
};

console.log(JSON.stringify(collect(router.stack), null, 2));
