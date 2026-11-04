import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3899);
const HOST = process.env.HOST || "0.0.0.0";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".tsx": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

function loadDataTs() {
  const dataPath = fs.existsSync(path.join(__dirname, "data.ts"))
    ? path.join(__dirname, "data.ts")
    : path.join(__dirname, "src", "data.ts");
  const rawTs = fs.readFileSync(dataPath, "utf8");
  const jsCode = rawTs
    .replace(/^export\s+type\s+[^\n]+$/gm, "")
    .replace(/^export\s+interface\s+[^\n]+$/gm, "")
    .replace(/export\s+const\s+GROUPS\s*(:\s*[^=]+)?=/g, "var GROUPS =")
    .replace(/export\s+const\s+RES\s*(:\s*[^=]+)?=/g, "var RES =")
    .replace(/export\s+const\s+BOTS\s*(:\s*[^=]+)?=/g, "var BOTS =")
    .replace(/export\s+const\s+EDGES\s*(:\s*[^=]+)?=/g, "var EDGES =")
    .replace(/\(b:\s*Bot\)/g, "(b)")
    .replace(/\(s:\s*string\)/g, "(s)")
    .replace(/\s+as\s+EdgeKind/g, "");
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(jsCode, sandbox, { timeout: 1000 });
  return {
    GROUPS: sandbox.GROUPS || [],
    RES: sandbox.RES || [],
    BOTS: sandbox.BOTS || [],
    EDGES: sandbox.EDGES || []
  };
}

function sendPayload(req, res, statusCode, contentType, rawBuffer) {
  const acceptEncoding = String(req.headers["accept-encoding"] || "");
  const isCompressible =
    contentType.startsWith("text/") ||
    contentType.includes("javascript") ||
    contentType.includes("json") ||
    contentType.includes("svg");

  let bodyBuffer = rawBuffer;
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "X-Content-Type-Options": "nosniff"
  };

  if (isCompressible && acceptEncoding.includes("gzip") && rawBuffer.length > 1024) {
    bodyBuffer = zlib.gzipSync(rawBuffer);
    headers["Content-Encoding"] = "gzip";
    headers["Vary"] = "Accept-Encoding";
  }

  headers["Content-Length"] = Buffer.byteLength(bodyBuffer);

  res.writeHead(statusCode, headers);
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  res.end(bodyBuffer);
}

const server = http.createServer((req, res) => {
  const clientIp = req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "";
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${clientIp} (${ua.slice(0, 60)})`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Length": 0
    });
    res.end();
    return;
  }

  const urlPath = (req.url || "/").split("?")[0];
  if (urlPath === "/api/data.json") {
    try {
      const payload = loadDataTs();
      const jsonBuf = Buffer.from(JSON.stringify(payload), "utf8");
      sendPayload(req, res, 200, "application/json; charset=utf-8", jsonBuf);
    } catch (err) {
      const errBuf = Buffer.from(JSON.stringify({ error: String(err) }), "utf8");
      sendPayload(req, res, 500, "application/json; charset=utf-8", errBuf);
    }
    return;
  }
  const safePath = urlPath === "/" ? "/index.html" : urlPath;
  const fullPath = path.join(__dirname, path.normalize(safePath));

  if (!fullPath.startsWith(__dirname)) {
    const forbidden = Buffer.from("Forbidden", "utf8");
    sendPayload(req, res, 403, "text/plain; charset=utf-8", forbidden);
    return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, "index.html"), (err2, indexData) => {
        if (err2) {
          const notFound = Buffer.from("Not Found", "utf8");
          sendPayload(req, res, 404, "text/plain; charset=utf-8", notFound);
          return;
        }
        sendPayload(req, res, 200, "text/html; charset=utf-8", indexData);
      });
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    sendPayload(req, res, 200, contentType, data);
  });
});

server.keepAliveTimeout = 5000;
server.headersTimeout = 10000;

server.listen(PORT, HOST, () => {
  console.log(`CephaSI LAN Server running at http://192.168.144.110:${PORT}/ (bound to ${HOST}:${PORT})`);
});
