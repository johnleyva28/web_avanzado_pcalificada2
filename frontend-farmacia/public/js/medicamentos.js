// ===========================================================
// medicamentos.js — CRUD completo para la tabla "medicamentos"
// relacionada con "tipos_medicamento".
//   - admin     : crear, editar, eliminar
//   - moderador : crear, editar (no eliminar)
//   - cliente   : solo lectura
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  const usuario = Nav.requerirAutenticacion();
  if (!usuario) return;
  Nav.renderizar("medicamentos");
  inicializarPaginaMedicamentos(usuario);
});

let tiposDisponibles = [];
let medicamentosEnMemoria = [];

async function inicializarPaginaMedicamentos(usuario) {
  const puedeEscribir = Nav.puedeEscribir("medicamentos");
  const puedeEliminar = usuario.rol === "admin";

  // Si no puede escribir, ocultamos el botón "Nuevo"
  const btnNuevo = document.getElementById("btn-nuevo-medicamento");
  if (btnNuevo) {
    btnNuevo.style.display = puedeEscribir ? "inline-flex" : "none";
  }

  // Cargar tipos (para el select del modal)
  try {
    tiposDisponibles = await API.listarTipos();
  } catch (error) {
    Toast.error("No se pudieron cargar los tipos de medicamento: " + error.message);
    tiposDisponibles = [];
  }

  await cargarYRenderizarMedicamentos(puedeEscribir, puedeEliminar);

  const form = document.getElementById("form-medicamento");
  if (form) {
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      await manejarEnvioFormulario(puedeEscribir);
    });
  }
}

async function cargarYRenderizarMedicamentos(puedeEscribir, puedeEliminar) {
  const tbody = document.getElementById("tbody-medicamentos");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" class="sin-datos">
    <i class="bi bi-arrow-repeat spin" aria-hidden="true"></i> Cargando medicamentos...
  </td></tr>`;

  try {
    const meds = await API.listarMedicamentos();
    medicamentosEnMemoria = meds;
    renderizarTabla(meds, puedeEscribir, puedeEliminar);
  } catch (error) {
    Toast.error(error.message);
    tbody.innerHTML = `<tr><td colspan="7" class="sin-datos text-danger">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderizarTabla(meds, puedeEscribir, puedeEliminar) {
  const tbody = document.getElementById("tbody-medicamentos");
  if (!meds || meds.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="sin-datos">No hay medicamentos registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = meds
    .map((m) => {
      const tipo = m.tipo ? m.tipo.nombre : "—";
      const precioFmt = `S/ ${Number(m.precio).toFixed(2)}`;
      return `
      <tr>
        <td>${m.id}</td>
        <td>${escapeHtml(m.nombre)}</td>
        <td>${m.descripcion ? escapeHtml(m.descripcion) : '<span class="text-muted">—</span>'}</td>
        <td>${precioFmt}</td>
        <td>${m.stock}</td>
        <td>${escapeHtml(tipo)}</td>
        <td>
          <div class="acciones-celda">
            <button class="btn-accion editar" title="Editar"
                    ${puedeEscribir ? "" : "disabled"}
                    onclick="editarMedicamento(${m.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn-accion eliminar" title="Eliminar"
                    ${puedeEliminar ? "" : "disabled"}
                    onclick="confirmarEliminarMedicamento(${m.id}, '${escapeHtml(m.nombre).replace(/'/g, "&#39;")}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

async function manejarEnvioFormulario(puedeEscribir) {
  if (!puedeEscribir) return;

  const idInput = document.getElementById("med-id");
  const nombreInput = document.getElementById("med-nombre");
  const descripcionInput = document.getElementById("med-descripcion");
  const precioInput = document.getElementById("med-precio");
  const stockInput = document.getElementById("med-stock");
  const tipoInput = document.getElementById("med-tipo");

  const esEdicion = !!idInput.value;

  const especificaciones = [
    {
      input: nombreInput,
      reglas: [
        (v) => Validadores.reglas.requerido(v, "El nombre"),
        (v) => Validadores.reglas.longitudMinima(v, 2, "El nombre"),
        (v) => Validadores.reglas.longitudMaxima(v, 100, "El nombre"),
      ],
    },
    {
      input: descripcionInput,
      reglas: [(v) => Validadores.reglas.longitudMaxima(v, 250, "La descripción")],
    },
    {
      input: precioInput,
      reglas: [
        (v) => Validadores.reglas.requerido(v, "El precio"),
        (v) => Validadores.reglas.numeroPositivo(v, "El precio"),
      ],
    },
    {
      input: stockInput,
      reglas: [
        (v) => Validadores.reglas.requerido(v, "El stock"),
        (v) => Validadores.reglas.enteroPositivo(v, "El stock"),
      ],
    },
    {
      input: tipoInput,
      reglas: [(v) => Validadores.reglas.requerido(v, "El tipo de medicamento")],
    },
  ];

  if (!Validadores.validarCampos(especificaciones)) {
    return;
  }

  const datos = {
    nombre: nombreInput.value.trim(),
    descripcion: descripcionInput.value.trim() || null,
    precio: Number(precioInput.value),
    stock: Number(stockInput.value),
    tipoMedicId: Number(tipoInput.value),
  };

  try {
    if (esEdicion) {
      await API.actualizarMedicamento(idInput.value, datos);
      Toast.exito("Medicamento actualizado correctamente.");
    } else {
      await API.crearMedicamento(datos);
      Toast.exito("Medicamento creado correctamente.");
    }
    cerrarModal();
    limpiarFormulario();
    const usuario = Sesion.obtenerUsuario();
    await cargarYRenderizarMedicamentos(Nav.puedeEscribir("medicamentos"), usuario.rol === "admin");
  } catch (error) {
    Toast.error(error.message);
  }
}

window.editarMedicamento = function (id) {
  const med = medicamentosEnMemoria.find((m) => m.id === id);
  if (!med) {
    Toast.aviso("No se encontró el medicamento.");
    return;
  }
  cargarTiposEnSelect(med.tipoMedicId);
  document.getElementById("med-id").value = med.id;
  document.getElementById("med-nombre").value = med.nombre;
  document.getElementById("med-descripcion").value = med.descripcion || "";
  document.getElementById("med-precio").value = med.precio;
  document.getElementById("med-stock").value = med.stock;
  document.getElementById("med-tipo").value = med.tipoMedicId;
  document.getElementById("titulo-modal-medicamento").textContent = "Editar Medicamento";
  abrirModal();
};

window.confirmarEliminarMedicamento = function (id, nombre) {
  if (!confirm(`¿Seguro que deseas eliminar el medicamento "${nombre}"? Esta acción no se puede deshacer.`)) {
    return;
  }
  eliminarMedicamento(id);
};

async function eliminarMedicamento(id) {
  try {
    await API.eliminarMedicamento(id);
    Toast.exito("Medicamento eliminado correctamente.");
    const usuario = Sesion.obtenerUsuario();
    await cargarYRenderizarMedicamentos(Nav.puedeEscribir("medicamentos"), usuario.rol === "admin");
  } catch (error) {
    Toast.error(error.message);
  }
}

window.abrirModalCrearMedicamento = function () {
  limpiarFormulario();
  cargarTiposEnSelect();
  document.getElementById("titulo-modal-medicamento").textContent = "Nuevo Medicamento";
  abrirModal();
};

function cargarTiposEnSelect(tipoSeleccionado = null) {
  const select = document.getElementById("med-tipo");
  if (!select) return;
  if (!tiposDisponibles || tiposDisponibles.length === 0) {
    select.innerHTML = `<option value="">— No hay tipos registrados —</option>`;
    return;
  }
  select.innerHTML = `<option value="">Seleccione un tipo...</option>` +
    tiposDisponibles
      .map(
        (t) => `
        <option value="${t.id}" ${t.id === tipoSeleccionado ? "selected" : ""}>
          ${escapeHtml(t.nombre)}
        </option>`
      )
      .join("");
}

function limpiarFormulario() {
  const form = document.getElementById("form-medicamento");
  if (form) {
    form.reset();
    document.getElementById("med-id").value = "";
    Validadores.limpiarTodosErrores(form);
  }
}

function abrirModal() {
  const modalEl = document.getElementById("modal-medicamento");
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function cerrarModal() {
  const modalEl = document.getElementById("modal-medicamento");
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}

function mostrarAlerta(mensaje, tipo = "info") {
  // Deprecado: usar Toast.* directamente. Mantenido por compatibilidad.
  if (typeof Toast !== "undefined") {
    if (tipo === "success") return Toast.exito(mensaje);
    if (tipo === "danger")  return Toast.error(mensaje);
    if (tipo === "warning") return Toast.aviso(mensaje);
    return Toast.info(mensaje);
  }
  console.warn("mostrarAlerta llamado sin Toast disponible:", mensaje);
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
