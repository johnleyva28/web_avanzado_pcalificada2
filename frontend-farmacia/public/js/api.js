// ===========================================================
// api.js — Capa fina sobre fetch para hablar con el backend
// ===========================================================

function resolverApiBaseUrl() {
  const metaFull = document.querySelector('meta[name="api-base-url"]');
  if (metaFull && metaFull.content) {
    return metaFull.content.replace(/\/+$/, "");
  }

  if (typeof globalThis.__API_BASE_URL__ === "string" && globalThis.__API_BASE_URL__) {
    return globalThis.__API_BASE_URL__.replace(/\/+$/, "");
  }

  const host = window.location.hostname;

  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:4000/api";
  }

  const metaHost = document.querySelector('meta[name="api-base-host"]');
  if (metaHost && metaHost.content) {
    return `https://${metaHost.content.replace(/^https?:\/\//, "")}/api`;
  }

  return "/api";
}

const API_BASE_URL = resolverApiBaseUrl();
console.info("[Farmacia] API base URL:", API_BASE_URL);

const Sesion = {
  guardar(token, usuario) {
    sessionStorage.setItem("farmacia_token", token);
    sessionStorage.setItem("farmacia_usuario", JSON.stringify(usuario));
  },
  obtenerToken() {
    return sessionStorage.getItem("farmacia_token");
  },
  obtenerUsuario() {
    const raw = sessionStorage.getItem("farmacia_usuario");
    return raw ? JSON.parse(raw) : null;
  },
  limpiar() {
    sessionStorage.removeItem("farmacia_token");
    sessionStorage.removeItem("farmacia_usuario");
  },
  estaAutenticado() {
    return !!this.obtenerToken();
  },
};

async function peticion(endpoint, opciones = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(opciones.headers || {}),
  };

  const token = Sesion.obtenerToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method: opciones.method || "GET",
    headers,
    // Envia cookies httpOnly (farmacia_token) automaticamente. El backend
    // puede autenticar via cookie sin necesidad de exponer el token a JS.
    credentials: "include",
  };

  if (opciones.body !== undefined) {
    config.body = JSON.stringify(opciones.body);
  }

  let respuesta;
  try {
    respuesta = await fetch(url, config);
  } catch (error) {
    // El fetch() lanza TypeError ("Failed to fetch", "NetworkError", etc.) en
    // tres casos: servidor caido, DNS falla, o el preflight CORS fue
    // rechazado. Distinguimos lo que podamos para que el usuario sepa donde
    // mirar en vez de un mensaje generico que apuntaba al puerto 4000 local.
    const errorMsg = String(error && error.message || error);
    const isLikelyCors = /Failed to fetch|NetworkError|Load failed/i.test(errorMsg);
    const isLocalApi = /localhost|127\.0\.0\.1/.test(url);
    let mensaje;
    if (isLikelyCors) {
      mensaje = `El navegador bloqueo la peticion a ${url} (probable CORS o Mixed Content). ` +
        `Si el frontend esta en HTTPS, el backend tambien debe estar en HTTPS. ` +
        `Verifica que FRONTEND_URL en el backend incluya exactamente este origen.`;
    } else if (isLocalApi) {
      mensaje = `No se pudo conectar con el backend en ${url}. ` +
        `Levantalo con: cd backend-farmacia && npm start`;
    } else {
      mensaje = `No se pudo conectar con ${url}. ` +
        `Verifica que el backend este accesible y que no haya un proxy/firewall bloqueando.`;
    }
    const wrapped = new Error(mensaje);
    wrapped.cause = error;
    wrapped.url = url;
    throw wrapped;
  }

  let data = null;
  const contentType = respuesta.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await respuesta.json();
  } else {
    data = await respuesta.text();
  }

  if (!respuesta.ok) {
    // 401 = sesión inválida/expirada → limpiar y volver al login.
    // 403 = sesión válida pero sin permisos → NO cerrar sesión, dejar que
    //       el caller muestre el mensaje en un toast.
    if (respuesta.status === 401) {
      Sesion.limpiar();
      const enLogin = window.location.pathname.endsWith("index.html")
        || window.location.pathname.endsWith("/")
        || window.location.pathname === "";
      if (!enLogin) {
        window.location.href = "index.html?expired=1";
      }
    }
    const mensaje = (data && data.message) || `Error ${respuesta.status} al comunicarse con el servidor.`;
    const error = new Error(mensaje);
    error.status = respuesta.status;
    error.data = data;
    throw error;
  }

  return data;
}

const API = {
  // ---- AUTH ----
  async login(email, password) {
    return peticion("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },
  async register(datosUsuario) {
    return peticion("/auth/register", {
      method: "POST",
      body: datosUsuario,
    });
  },

  // ---- TIPOS DE MEDICAMENTO ----
  async listarTipos() {
    return peticion("/tipos-medicamento");
  },
  async crearTipo(datos) {
    return peticion("/tipos-medicamento", {
      method: "POST",
      body: datos,
    });
  },
  async actualizarTipo(id, datos) {
    return peticion(`/tipos-medicamento/${id}`, {
      method: "PUT",
      body: datos,
    });
  },
  async eliminarTipo(id) {
    return peticion(`/tipos-medicamento/${id}`, {
      method: "DELETE",
    });
  },

  // ---- MEDICAMENTOS ----
  async listarMedicamentos() {
    return peticion("/medicamentos");
  },
  async crearMedicamento(datos) {
    return peticion("/medicamentos", {
      method: "POST",
      body: datos,
    });
  },
  async actualizarMedicamento(id, datos) {
    return peticion(`/medicamentos/${id}`, {
      method: "PUT",
      body: datos,
    });
  },
  async eliminarMedicamento(id) {
    return peticion(`/medicamentos/${id}`, {
      method: "DELETE",
    });
  },
};
