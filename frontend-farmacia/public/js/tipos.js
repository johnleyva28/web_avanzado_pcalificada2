// ===========================================================
// tipos.js — CRUD de la tabla relacionada "tipos_medicamento"
// Permisos:
//   - admin     : ver, crear, editar, eliminar
//   - moderador : ver, crear, editar (no eliminar)
//   - cliente   : sin acceso (redirigido desde la navbar)
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  const usuario = Nav.requerirAutenticacion();
  if (!usuario) return;

  if (usuario.rol !== "admin" && usuario.rol !== "moderador") {
    window.location.href = "home.html";
    return;
  }

  Nav.renderizar("tipos");
  inicializarPaginaTipos(usuario);
  wireEventosEstaticos();
});

function wireEventosEstaticos() {
  const btnNuevo = document.getElementById("btn-nuevo-tipo");
  if (btnNuevo) btnNuevo.addEventListener("click", () => abrirModalCrear());

  const tbody = document.getElementById("tbody-tipos");
  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const nombre = btn.dataset.nombre || "";
      if (btn.dataset.action === "editar") editarTipo(id);
      if (btn.dataset.action === "eliminar") confirmarEliminarTipo(id, nombre);
    });
  }
}

let tiposEnMemoria = [];

function inicializarPaginaTipos(usuario) {
  const puedeEscribir = Nav.puedeEscribir("tipos-medicamento");
  const puedeEliminar = Nav.puedeEliminar("tipos-medicamento");

  const btnNuevo = document.getElementById("btn-nuevo-tipo");
  if (btnNuevo) {
    btnNuevo.style.display = puedeEscribir ? "inline-flex" : "none";
  }

  cargarYRenderizarTipos(puedeEscribir, puedeEliminar);

  const form = document.getElementById("form-tipo");
  if (form) {
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      await manejarEnvioFormulario(puedeEscribir);
    });
  }
}

async function cargarYRenderizarTipos(puedeEscribir, puedeEliminar) {
  const tbody = document.getElementById("tbody-tipos");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" class="sin-datos">
    <i class="bi bi-arrow-repeat spin" aria-hidden="true"></i> Cargando tipos...
  </td></tr>`;

  try {
    const tipos = await API.listarTipos();
    tiposEnMemoria = tipos;
    renderizarTabla(tipos, puedeEscribir, puedeEliminar);
  } catch (error) {
    Toast.error(error.message);
    tbody.innerHTML = `<tr><td colspan="4" class="sin-datos text-danger">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderizarTabla(tipos, puedeEscribir, puedeEliminar) {
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
          <button class="btn-accion editar" title="Editar" type="button"
                  data-action="editar" data-id="${t.id}"
                  ${puedeEscribir ? "" : "disabled"}>
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-accion eliminar" title="Eliminar" type="button"
                  data-action="eliminar" data-id="${t.id}" data-nombre="${escapeHtml(t.nombre).replace(/"/g, "&quot;")}"
                  ${puedeEliminar ? "" : "disabled"}>
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

async function manejarEnvioFormulario(puedeEscribir) {
  if (!puedeEscribir) {
    Toast.aviso("No tienes permisos para modificar tipos de medicamento.");
    return;
  }

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

  const esEdicion = !!idInput.value;

  try {
    if (esEdicion) {
      await API.actualizarTipo(idInput.value, datos);
      Toast.exito("Tipo de medicamento actualizado correctamente.");
    } else {
      await API.crearTipo(datos);
      Toast.exito("Tipo de medicamento creado correctamente.");
    }
    cerrarModal();
    limpiarFormulario();
    await cargarYRenderizarTipos(puedeEscribir, Nav.puedeEliminar("tipos-medicamento"));
  } catch (error) {
    Toast.error(error.message);
  }
}

window.editarTipo = function (id) {
  const tipo = tiposEnMemoria.find((t) => t.id === id);
  if (!tipo) {
    Toast.aviso("No se encontró el tipo de medicamento.");
    return;
  }
  document.getElementById("tipo-id").value = tipo.id;
  document.getElementById("tipo-nombre").value = tipo.nombre;
  document.getElementById("tipo-descripcion").value = tipo.descripcion || "";
  document.getElementById("titulo-modal-tipo").textContent = "Editar Tipo de Medicamento";
  abrirModal();
};

window.confirmarEliminarTipo = function (id, nombre) {
  if (!confirm(`¿Seguro que deseas eliminar el tipo "${nombre}"? Esta acción no se puede deshacer.`)) {
    return;
  }
  eliminarTipo(id);
};

async function eliminarTipo(id) {
  try {
    await API.eliminarTipo(id);
    Toast.exito("Tipo de medicamento eliminado correctamente.");
    const usuario = Sesion.obtenerUsuario();
    await cargarYRenderizarTipos(Nav.puedeEscribir("tipos-medicamento"));
  } catch (error) {
    Toast.error(error.message);
  }
}

window.abrirModalCrear = function () {
  limpiarFormulario();
  document.getElementById("titulo-modal-tipo").textContent = "Nuevo Tipo de Medicamento";
  abrirModal();
};

function limpiarFormulario() {
  const form = document.getElementById("form-tipo");
  if (form) {
    form.reset();
    document.getElementById("tipo-id").value = "";
    Validadores.limpiarTodosErrores(form);
  }
}

function abrirModal() {
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

function escapeHtml(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
