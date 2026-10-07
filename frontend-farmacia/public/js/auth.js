// ===========================================================
// auth.js — Manejo del login y registro
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- LOGIN ---
  const formLogin = document.getElementById("form-login");
  if (formLogin) {
    inicializarLogin(formLogin);
  }

  // --- REGISTRO ---
  const formRegistro = document.getElementById("form-registro");
  if (formRegistro) {
    inicializarRegistro(formRegistro);
  }

  // --- Mensaje si llegamos por sesión expirada ---
  const params = new URLSearchParams(window.location.search);
  if (params.get("expired") === "1") {
    Toast.aviso("Tu sesión expiró. Vuelve a iniciar sesión.");
    params.delete("expired");
    const nuevaUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState({}, "", nuevaUrl);
  }
});

function inicializarLogin(formulario) {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const mensajeGlobal = document.getElementById("mensaje-global");
  const btnSubmit = document.getElementById("btn-login");

  // Si ya está autenticado, redirigir al home
  if (Sesion.estaAutenticado()) {
    window.location.href = "home.html";
    return;
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensajeGlobal.textContent = "";
    mensajeGlobal.className = "text-center mb-3";

    const especificaciones = [
      { input: emailInput,    reglas: [(v) => Validadores.reglas.requerido(v, "El correo"), Validadores.reglas.email] },
      { input: passwordInput, reglas: [(v) => Validadores.reglas.requerido(v, "La contraseña")] },
    ];

    if (!Validadores.validarCampos(especificaciones)) {
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Ingresando...";

    try {
      const respuesta = await API.login(emailInput.value.trim(), passwordInput.value);
      Sesion.guardar(respuesta.token, respuesta.usuario);
      window.location.href = "home.html";
    } catch (error) {
      mensajeGlobal.textContent = error.message;
      mensajeGlobal.className = "text-center mb-3 text-danger";
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Iniciar sesión";
    }
  });
}

function inicializarRegistro(formulario) {
  const nombreInput = document.getElementById("reg-nombre");
  const emailInput = document.getElementById("reg-email");
  const passwordInput = document.getElementById("reg-password");
  const confirmInput = document.getElementById("reg-confirmar");
  const rolInput = document.getElementById("reg-rol");
  const mensajeGlobal = document.getElementById("mensaje-global");
  const btnSubmit = document.getElementById("btn-registrar");

  if (Sesion.estaAutenticado()) {
    window.location.href = "home.html";
    return;
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensajeGlobal.textContent = "";
    mensajeGlobal.className = "text-center mb-3";

    const especificaciones = [
      {
        input: nombreInput,
        reglas: [
          (v) => Validadores.reglas.requerido(v, "El nombre"),
          (v) => Validadores.reglas.longitudMinima(v, 2, "El nombre"),
          (v) => Validadores.reglas.longitudMaxima(v, 80, "El nombre"),
        ],
      },
      {
        input: emailInput,
        reglas: [
          (v) => Validadores.reglas.requerido(v, "El correo"),
          Validadores.reglas.email,
        ],
      },
      {
        input: passwordInput,
        reglas: [
          (v) => Validadores.reglas.requerido(v, "La contraseña"),
          Validadores.reglas.passwordSegura,
        ],
      },
      {
        input: confirmInput,
        reglas: [
          (v) => Validadores.reglas.requerido(v, "La confirmación"),
          (v) => Validadores.reglas.passwordsCoinciden(passwordInput.value, v),
        ],
      },
    ];

    if (!Validadores.validarCampos(especificaciones)) {
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Registrando...";

    try {
      const datos = {
        nombre: nombreInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        rol: rolInput ? rolInput.value : "cliente",
      };
      const respuesta = await API.register(datos);
      Sesion.guardar(respuesta.token, respuesta.usuario);
      window.location.href = "home.html";
    } catch (error) {
      mensajeGlobal.textContent = error.message;
      mensajeGlobal.className = "text-center mb-3 text-danger";
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Crear cuenta";
    }
  });
}
