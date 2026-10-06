// ===========================================================
// tipos.js — CRUD de la tabla relacionada "tipos_medicamento"
// Solo el rol admin puede crear/editar/eliminar.
// Moderador y cliente no ven esta página (Nav.filtrarPorRol).
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  const usuario = Nav.requerirAutenticacion();
  if (!usuario) return;

  if (usuario.rol !== "admin") {
    window.location.href = "home.html";
    return;
  }

  Nav.renderizar("tipos");
  inicializarPaginaTipos();
});

let tiposEnMemoria = [];

async function inicializarPaginaTipos() {
  await cargarYRenderizarTipos();

  const form = document.getElementById("form-tipo");
  if (form) {
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      await manejarEnvioFormulario();
    });
  }
}

async function cargarYRenderizarTipos() {
  const tbody = document.getElementById("tbody-tipos");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" class="sin-datos">Cargando tipos de medicamento...</td></tr>`;

  try {
    const tipos = await API.listarTipos();
    tiposEnMemoria = tipos;
    renderizarTabla(tipos);
  } catch (error) {
    mostrarAlerta(error.message, "danger");
    tbody.innerHTML = `<tr><td colspan="4" class="sin-datos text-danger">${error.message}</td></tr>`;
  }
}

function renderizarTabla(tipos) {
  const tbody = document.getElementById("tbody-tipos");
  if (!tipos || tipos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="sin-datos">No hay tipos de medicamento registrados.</td></tr>`;
    return;
  }
  tbody.innerHTML = tipos
    .map(
      (t) => `
    <tr>
      <td>${t.id}</td>
      <td>${escapeHtml(t.nombre)}</td>
      <td>${t.descripcion ? escapeHtml(t.descripcion) : '<span class="text-muted">—</span>'}</td>
      <td>
        <div class="acciones-celda">
          <button class="btn-accion editar" title="Editar" disabled>
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-accion eliminar" title="Eliminar" disabled>
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

async function manejarEnvioFormulario() {
  const idInput = document.getElementById("tipo-id");
  const nombreInput = document.getElementById("tipo-nombre");
  const descripcionInput = document.getElementById("tipo-descripcion");

  const especificaciones = [
    {
      input: nombreInput,
      reglas: [
        (v) => Validadores.reglas.requerido(v, "El nombre"),
        (v) => Validadores.reglas.longitudMinima(v, 2, "El nombre"),
        (v) => Validadores.reglas.longitudMaxima(v, 60, "El nombre"),
      ],
    },
    {
      input: descripcionInput,
      reglas: [(v) => Validadores.reglas.longitudMaxima(v, 200, "La descripción")],
    },
  ];

  if (!Validadores.validarCampos(especificaciones)) {
    return;
  }

  const datos = {
    nombre: nombreInput.value.trim(),
    descripcion: descripcionInput.value.trim() || null,
  };

  try {
    await API.crearTipo(datos);
    mostrarAlerta("Tipo de medicamento creado correctamente.", "success");
    cerrarModal();
    limpiarFormulario();
    await cargarYRenderizarTipos();
  } catch (error) {
    mostrarAlerta(error.message, "danger");
  }
}

function limpiarFormulario() {
  const form = document.getElementById("form-tipo");
  if (form) {
    form.reset();
    document.getElementById("tipo-id").value = "";
  }
}

function abrirModalCrear() {
  limpiarFormulario();
  document.getElementById("titulo-modal-tipo").textContent = "Nuevo Tipo de Medicamento";
  const modalEl = document.getElementById("modal-tipo");
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function cerrarModal() {
  const modalEl = document.getElementById("modal-tipo");
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}

function mostrarAlerta(mensaje, tipo = "info") {
  const contenedor = document.getElementById("contenedor-alerta");
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="alert alert-${tipo} alerta-flotante shadow-sm" role="alert">
      ${escapeHtml(mensaje)}
    </div>
  `;
  setTimeout(() => {
    if (contenedor) contenedor.innerHTML = "";
  }, 3500);
}

function escapeHtml(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
