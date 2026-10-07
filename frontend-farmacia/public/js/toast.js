// ===========================================================
// toast.js — Sistema de notificaciones toast
// Crea su propio contenedor en el body y expone Toast.mostrar().
// Tipos: success, danger, warning, info. Auto-dismiss + click to close.
// Usa createElement/textContent para evitar XSS en contenido del usuario.
// ===========================================================

const Toast = {
  _contenedor: null,
  _iconos: {
    success: "bi-check-circle-fill",
    danger: "bi-exclamation-octagon-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  },

  _asegurarContenedor() {
    if (this._contenedor && document.body.contains(this._contenedor)) return;
    let cont = document.getElementById("toast-container");
    if (!cont) {
      cont = document.createElement("div");
      cont.id = "toast-container";
      cont.className = "toast-container";
      cont.setAttribute("aria-live", "polite");
      cont.setAttribute("aria-atomic", "true");
      document.body.appendChild(cont);
    }
    this._contenedor = cont;
  },

  _crearElemento(mensaje, tipo) {
    const tipoSafe = this._iconos[tipo] ? tipo : "info";
    const iconoClase = this._iconos[tipoSafe];

    const el = document.createElement("div");
    el.className = `toast-item toast-${tipoSafe}`;
    el.setAttribute("role", tipoSafe === "danger" ? "alert" : "status");

    const icono = document.createElement("div");
    icono.className = "toast-icono";
    icono.setAttribute("aria-hidden", "true");
    const iconoI = document.createElement("i");
    iconoI.className = `bi ${iconoClase}`;
    icono.appendChild(iconoI);

    const cuerpo = document.createElement("div");
    cuerpo.className = "toast-cuerpo";
    cuerpo.textContent = String(mensaje);

    const cerrar = document.createElement("button");
    cerrar.className = "toast-cerrar";
    cerrar.type = "button";
    cerrar.setAttribute("aria-label", "Cerrar notificación");
    const cerrarI = document.createElement("i");
    cerrarI.className = "bi bi-x-lg";
    cerrar.appendChild(cerrarI);

    el.append(icono, cuerpo, cerrar);
    return { el, cerrar };
  },

  /**
   * Muestra un toast.
   * @param {string} mensaje
   * @param {"success"|"danger"|"warning"|"info"} tipo
   * @param {number} duracion  milisegundos, 0 = persistente
   */
  mostrar(mensaje, tipo = "info", duracion = 3500) {
    this._asegurarContenedor();
    const { el, cerrar: btnCerrar } = this._crearElemento(mensaje, tipo);

    const cerrar = () => {
      if (el.classList.contains("toast-saliendo")) return;
      el.classList.add("toast-saliendo");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    };

    btnCerrar.addEventListener("click", cerrar);
    this._contenedor.appendChild(el);

    if (duracion > 0) {
      setTimeout(cerrar, duracion);
    }
    return cerrar;
  },

  exito(mensaje, duracion)     { return this.mostrar(mensaje, "success", duracion); },
  error(mensaje, duracion)     { return this.mostrar(mensaje, "danger",  duracion); },
  aviso(mensaje, duracion)     { return this.mostrar(mensaje, "warning", duracion); },
  info(mensaje, duracion)      { return this.mostrar(mensaje, "info",    duracion); },
};

document.addEventListener("DOMContentLoaded", () => Toast._asegurarContenedor());
