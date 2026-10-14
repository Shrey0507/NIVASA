import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import app from "../src/app.js";

function invoke(method, url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    Object.assign(req, { method, url, originalUrl: url, headers, ip: "127.0.0.1", body: {}, query: {}, get(name) { return this.headers[name.toLowerCase()] || this.headers[name] || undefined; } });
    const res = new EventEmitter();
    res.statusCode = 200; res.headers = {}; res.headersSent = false;
    res.setHeader = (key, value) => { res.headers[key.toLowerCase()] = value; };
    res.getHeader = (key) => res.headers[key.toLowerCase()];
    res.getHeaders = () => ({ ...res.headers });
    res.removeHeader = (key) => { delete res.headers[key.toLowerCase()]; };
    res.writeHead = (status) => { res.statusCode = status; return res; };
    res.status = (status) => { res.statusCode = status; return res; };
    res.json = (body) => { res.headersSent = true; res.body = body; res.emit("finish"); resolve(res); return res; };
    res.send = res.json;
    res.end = () => { res.headersSent = true; res.emit("finish"); resolve(res); };
    try { app(req, res, (error) => error ? reject(error) : resolve(res)); } catch (error) { reject(error); }
  });
}

test("liveness endpoint is public", async () => { const response = await invoke("GET", "/api/health/live"); assert.equal(response.statusCode, 200); assert.equal(response.body.status, "ok"); });
test("protected endpoint returns consistent 401", async () => { const response = await invoke("GET", "/api/dashboard"); assert.equal(response.statusCode, 401); assert.equal(response.body.error.code, "AUTH_REQUIRED"); });
test("unknown route returns structured 404", async () => { const response = await invoke("GET", "/api/not-a-route"); assert.equal(response.statusCode, 404); assert.equal(response.body.error.code, "NOT_FOUND"); });
