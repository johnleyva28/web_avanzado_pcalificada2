// server.js — Servidor estático para el frontend de Farmacia
// Sirve los archivos contenidos en la carpeta `public/`.
// Los assets (HTML/CSS/JS) deben estar dentro de `public/`.
//
// Uso:
//   PORT=3000 node server.js
//
// Variables de entorno opcionales:
//   PORT          - Puerto donde escucha el servidor (default 3000)
//   FRONTEND_HOST - Host permitido en el header (default *)

const http = require("http");
const fs = require("fs");
const path = require("path");

// Puerto del servidor estático (variable de entorno opcional).
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
};

function servirArchivo(res, rutaArchivo) {
  fs.readFile(rutaArchivo, (err, contenido) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 - No encontrado");
      return;
    }
    const ext = path.extname(rutaArchivo).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(contenido);
  });
}

const server = http.createServer((req, res) => {
  let rutaURL = decodeURIComponent(req.url.split("?")[0]);
  if (rutaURL === "/" || rutaURL === "") rutaURL = "/index.html";

  // Construcción segura: impide path traversal (../)
  const rutaArchivo = path.normalize(path.join(PUBLIC_DIR, rutaURL));
  if (!rutaArchivo.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 - Prohibido");
    return;
  }

  // Si es un directorio, buscamos index.html dentro
  fs.stat(rutaArchivo, (err, stats) => {
    if (!err && stats.isDirectory()) {
      servirArchivo(res, path.join(rutaArchivo, "index.html"));
      return;
    }
    servirArchivo(res, rutaArchivo);
  });
});

server.listen(PORT, () => {
  console.log(`Frontend Farmacia (public/) disponible en http://localhost:${PORT}`);
});