// ===========================================================
// nav.js — Construcción dinámica del navbar según el rol
// El navbar se inyecta en el contenedor #navbar-farmacia
// y los items cambian dependiendo del rol del usuario:
//   - admin       -> puede ver y editar todo
//   - moderador   -> puede ver todo, editar solo medicamentos
//   - cliente     -> solo lectura de medicamentos
// ===========================================================

const Nav = {
  /**
   * Inserta el HTML del navbar dentro del contenedor
   * y resalta la opción activa.
   */
  renderizar(paginaActual = "") {
    const contenedor = document.getElementById("navbar-farmacia");
    if (!contenedor) return;

    const usuario = Sesion.obtenerUsuario();
    if (!usuario) return;

    const items = this.itemsParaRol(usuario.rol);
    const paginaActiva = paginaActual || this.detectarPaginaActual();

    const html = `
      <nav class="navbar navbar-expand-lg navbar-farmacia">
        <div class="container-fluid">
          <a class="navbar-brand" href="home.html">
            <i class="bi bi-capsule"></i> <span>Farmacia</span>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal"
                  aria-controls="menuPrincipal" aria-expanded="false" aria-label="Toggle navegación">
            <span class="navbar-toggler-icon" style="filter: invert(1);"></span>
          </button>
          <div class="collapse navbar-collapse" id="menuPrincipal">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${items
                .map(
                  (item) => `
                    <li class="nav-item">
                      <a class="nav-link ${item.clave === paginaActiva ? "active" : ""}"
                         href="${item.href}">${item.etiqueta}</a>
                    </li>`
                )
                .join("")}
            </ul>

            <form class="buscador-nav" role="search" onsubmit="event.preventDefault();">
              <div class="buscador-wrapper">
                <i class="bi bi-search icono-buscar"></i>
                <input
                  type="search"
                  id="input-buscar-nav"
                  class="form-control"
                  placeholder="Buscar..."
                  aria-label="Buscar"
                />
              </div>
              <button class="btn-buscar-nav" type="submit" id="btn-buscar-nav" aria-label="Buscar">
                Buscar
              </button>
            </form>

            <div class="navbar-seccion usuario">
              <div class="user-chip" title="${this.escapar(usuario.nombre)} · ${this.formatearRol(usuario.rol)}">
                <div class="avatar" aria-hidden="true">${this.iniciales(usuario.nombre)}</div>
                <div class="user-meta">
                  <span class="user-nombre">${this.escapar(usuario.nombre)}</span>
                  <span class="rol-badge rol-badge--${usuario.rol}">
                    <i class="bi ${this.iconoRol(usuario.rol)}" aria-hidden="true"></i>
                    ${this.abreviarRol(usuario.rol)}
                  </span>
                </div>
              </div>
              <button class="btn-logout" id="btn-cerrar-sesion" aria-label="Cerrar sesión" title="Cerrar sesión">
                <i class="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>
    `;

    contenedor.innerHTML = html;
    this.asignarLogout();
    this.asignarBuscador();
  },

  /**
   * Devuelve las iniciales (1-2 letras) del nombre para el avatar.
   */
  iniciales(nombre) {
    if (!nombre) return "?";
    const partes = String(nombre).trim().split(/\s+/).slice(0, 2);
    return partes.map((p) => p.charAt(0).toUpperCase()).join("");
  },

  /**
   * Devuelve los items de menú que cada rol puede ver.
   */
  itemsParaRol(rol) {
    const todos = [
      { clave: "inicio",        href: "home.html",        etiqueta: "Inicio",    roles: ["admin", "moderador", "cliente"] },
      { clave: "medicamentos",  href: "medicamentos.html", etiqueta: "Medicamentos", roles: ["admin", "moderador", "cliente"] },
      { clave: "tipos",         href: "tipos.html",        etiqueta: "Tipos",     roles: ["admin", "moderador"] },
    ];
    return todos.filter((item) => item.roles.includes(rol));
  },

  formatearRol(rol) {
    const mapa = { admin: "Administrador", moderador: "Moderador", cliente: "Usuario" };
    return mapa[rol] || rol;
  },

  abreviarRol(rol) {
    const mapa = { admin: "Admin", moderador: "Mod", cliente: "Cliente" };
    return mapa[rol] || rol;
  },

  iconoRol(rol) {
    const mapa = {
      admin: "bi-shield-lock-fill",
      moderador: "bi-tools",
      cliente: "bi-person",
    };
    return mapa[rol] || "bi-person";
  },

  detectarPaginaActual() {
    const archivo = (window.location.pathname.split("/").pop() || "").toLowerCase();
    if (archivo.startsWith("home")) return "inicio";
    if (archivo.startsWith("tipos")) return "tipos";
    if (archivo.startsWith("medicamentos")) return "medicamentos";
    return "";
  },

  asignarLogout() {
    const btn = document.getElementById("btn-cerrar-sesion");
    if (!btn) return;
    btn.addEventListener("click", () => {
      Sesion.limpiar();
      window.location.href = "index.html";
    });
  },

  /**
   * Activa el buscador del navbar: filtra las filas de la tabla
   * principal en la página actual por el texto ingresado.
   * Si la página actual no tiene tabla, no hace nada.
   */
  asignarBuscador() {
    const btn = document.getElementById("btn-buscar-nav");
    const input = document.getElementById("input-buscar-nav");
    if (!btn || !input) return;

    const filtrar = () => {
      const termino = (input.value || "").toLowerCase().trim();
      const tablas = document.querySelectorAll(".tabla-farmacia");
      tablas.forEach((tabla) => {
        const filas = tabla.querySelectorAll("tbody tr");
        filas.forEach((fila) => {
          if (fila.classList.contains("sin-datos-fila")) return;
          const texto = (fila.textContent || "").toLowerCase();
          fila.style.display = termino === "" || texto.includes(termino) ? "" : "none";
        });
      });
    };

    btn.addEventListener("click", filtrar);
    input.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        filtrar();
      }
    });
  },

  /**
   * Comprueba si la sesión está iniciada. Si no, redirige
   * a la página de login. Llamar al cargar páginas protegidas.
   */
  requerirAutenticacion() {
    if (!Sesion.estaAutenticado()) {
      window.location.href = "index.html";
      return null;
    }
    return Sesion.obtenerUsuario();
  },

  /**
   * Escape básico para evitar inyectar HTML al renderizar.
   */
  escapar(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /**
   * Devuelve true si el rol puede ejecutar acciones de
   * escritura (crear/editar/eliminar) sobre la entidad dada.
   *   tiposMedicamento  -> solo admin
   *   medicamentos      -> admin y moderador
   */
  puedeEscribir(entidad) {
    const usuario = Sesion.obtenerUsuario();
    if (!usuario) return false;
    if (entidad === "tipos-medicamento") return usuario.rol === "admin";
    if (entidad === "medicamentos") return usuario.rol === "admin" || usuario.rol === "moderador";
    return false;
  },
};
