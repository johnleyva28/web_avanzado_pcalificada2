// ===========================================================
// validators.js — Validación de formularios en el FRONT
// Antes de enviar datos al backend, se valida cada campo y
// se muestran mensajes de error contextuales en cada input.
// ===========================================================

const Validadores = {
  /**
   * Marca visualmente un input como inválido y muestra el mensaje.
   */
  mostrarError(input, mensaje) {
    input.classList.add("invalido");
    const errorEl = document.getElementById(`error-${input.id}`);
    if (errorEl) {
      errorEl.textContent = mensaje;
      errorEl.classList.add("visible");
    }
  },

  /**
   * Limpia el error visual de un input.
   */
  limpiarError(input) {
    input.classList.remove("invalido");
    const errorEl = document.getElementById(`error-${input.id}`);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("visible");
    }
  },

  /**
   * Limpia todos los errores visibles en un formulario.
   */
  limpiarTodosErrores(formulario) {
    formulario.querySelectorAll(".invalido").forEach((el) => el.classList.remove("invalido"));
    formulario.querySelectorAll(".texto-error-campo").forEach((el) => {
      el.textContent = "";
      el.classList.remove("visible");
    });
  },

  /**
   * Reglas de validación reutilizables. Devuelven string con el
   * mensaje de error o cadena vacía si el valor es válido.
   */
  reglas: {
    requerido(valor, nombreCampo = "Este campo") {
      if (valor === undefined || valor === null || String(valor).trim() === "") {
        return `${nombreCampo} es obligatorio.`;
      }
      return "";
    },
    email(valor) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!re.test(valor)) {
        return "Ingresa un correo electrónico válido.";
      }
      return "";
    },
    longitudMinima(valor, min, nombreCampo = "Este campo") {
      if (String(valor).length < min) {
        return `${nombreCampo} debe tener al menos ${min} caracteres.`;
      }
      return "";
    },
    longitudMaxima(valor, max, nombreCampo = "Este campo") {
      if (String(valor).length > max) {
        return `${nombreCampo} no puede superar los ${max} caracteres.`;
      }
      return "";
    },
    passwordSegura(valor) {
      if (String(valor).length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
      }
      return "";
    },
    passwordsCoinciden(password, confirmacion) {
      if (password !== confirmacion) {
        return "Las contraseñas no coinciden.";
      }
      return "";
    },
    numeroPositivo(valor, nombreCampo = "Este campo") {
      const n = Number(valor);
      if (isNaN(n) || n < 0) {
        return `${nombreCampo} debe ser un número mayor o igual a 0.`;
      }
      return "";
    },
    enteroPositivo(valor, nombreCampo = "Este campo") {
      const n = Number(valor);
      if (!Number.isInteger(n) || n < 0) {
        return `${nombreCampo} debe ser un número entero mayor o igual a 0.`;
      }
      return "";
    },
  },

  /**
   * Valida un objeto campo-por-campo usando la lista de
   * especificaciones [{input, reglas:[...]}]. Devuelve true si
   * todo está OK y los errores se muestran junto a cada input.
   */
  validarCampos(especificaciones) {
    let esValido = true;
    for (const { input, reglas } of especificaciones) {
      this.limpiarError(input);
      const valor = input.type === "checkbox" ? input.checked : input.value;
      for (const regla of reglas) {
        const mensaje = regla(valor);
        if (mensaje) {
          this.mostrarError(input, mensaje);
          esValido = false;
          break;
        }
      }
    }
    return esValido;
  },
};
