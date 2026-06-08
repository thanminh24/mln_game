import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 8001);
const host = process.env.HOST || "127.0.0.1";
const root = path.dirname(fileURLToPath(import.meta.url));
const slug = "01-apple-fluid";
const distRoot = path.resolve(root, slug, "dist");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, { "content-type": contentType });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${host}:${port}`);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    url.pathname = "/index.html";
  }

  if (url.pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

  let relativePath = "";
  try {
    relativePath = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  } catch {
    send(res, 400, "Bad request");
    return;
  }
  if (!relativePath || relativePath.endsWith("/")) relativePath += "index.html";

  const filePath = path.resolve(distRoot, relativePath);
  const relativeToDist = path.relative(distRoot, filePath);
  if (relativeToDist.startsWith("..") || path.isAbsolute(relativeToDist)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, "Not found");
      return;
    }

    res.writeHead(200, { "content-type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`MLN apple-fluid: http://${host}:${port}/`);
});
