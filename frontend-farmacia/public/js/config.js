// config.js — Resuelve la URL del backend según el entorno sin editar nada.

(function () {
  const host = window.location.hostname;

  if (host === "localhost" || host === "127.0.0.1") {
    globalThis.__API_BASE_URL__ = "http://localhost:4000/api";
    return;
  }

  // Override opcional vía <meta name="api-base-host" content="..."> en el HTML.
  const metaHost = document.querySelector('meta[name="api-base-host"]');
  if (metaHost && metaHost.content) {
    globalThis.__API_BASE_URL__ = `https://${metaHost.content}/api`;
    return;
  }

  // Convención de Render: cuando el frontend es X-1.onrender.com, el backend está en X.onrender.com.
  const baseHost = host.replace(/-1\.onrender\.com$/, ".onrender.com");
  globalThis.__API_BASE_URL__ = `https://${baseHost}/api`;
})();