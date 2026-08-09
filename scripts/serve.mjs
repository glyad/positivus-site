import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = resolve(fileURLToPath(new URL("..", import.meta.url)), "dist");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  response.end(body);
}

export function createStaticServer({ rootDir = defaultRoot } = {}) {
  const resolvedRoot = resolve(rootDir);

  return createServer(async (request, response) => {
    if (!request.url || !["GET", "HEAD"].includes(request.method || "GET")) {
      send(response, 405, "Method not allowed", { Allow: "GET, HEAD" });
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname
      );
    } catch {
      send(response, 400, "Bad request");
      return;
    }

    const requestPath = pathname.replace(/^\/+/, "") || "index.html";
    let filePath = resolve(resolvedRoot, requestPath);
    const pathFromRoot = relative(resolvedRoot, filePath);

    if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) {
      send(response, 403, "Forbidden");
      return;
    }

    try {
      const fileStats = await stat(filePath);
      if (fileStats.isDirectory()) {
        filePath = resolve(filePath, "index.html");
      }

      const finalStats = await stat(filePath);
      if (!finalStats.isFile()) {
        send(response, 404, "Not found");
        return;
      }
    } catch {
      send(response, 404, "Not found");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": String((await stat(filePath)).size),
      "Content-Security-Policy":
        "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  });
}

export async function startServer({
  rootDir = defaultRoot,
  host = process.env.HOST || "127.0.0.1",
  port = Number(process.env.PORT || "4173"),
} = {}) {
  const server = createStaticServer({ rootDir });
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolveListen);
  });
  console.log(`Positivus preview running at http://${host}:${port}`);
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  await startServer({
    rootDir: resolve(readArgument("--root", defaultRoot)),
    host: readArgument("--host", process.env.HOST || "127.0.0.1"),
    port: Number(readArgument("--port", process.env.PORT || "4173")),
  });
}
