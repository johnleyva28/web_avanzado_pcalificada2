// ===========================================================
// home.js — Menú principal que se muestra tras iniciar sesión
// Presenta tarjetas con los módulos disponibles según el rol
// y carga estadísticas reales del backend.
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  const usuario = Nav.requerirAutenticacion();
  if (!usuario) return;

  Nav.renderizar("inicio");

  const contenedorNombre = document.getElementById("nombre-usuario");
  if (contenedorNombre) contenedorNombre.textContent = usuario.nombre;

  const cuadricula = document.getElementById("cuadricula-modulos");
  if (cuadricula) {
    const modulos = [
      {
        clave: "medicamentos",
        icono: "bi-capsule",
        titulo: "Medicamentos",
        descripcion: "Consulta, crea, edita y elimina medicamentos del inventario.",
        href: "medicamentos.html",
        requiere: ["admin", "moderador", "cliente"],
        escritura: ["admin", "moderador"],
      },
      {
        clave: "tipos",
        icono: "bi-tags",
        titulo: "Tipos de Medicamento",
        descripcion: "Gestiona las categorías (Analgésicos, Antibióticos, etc.).",
        href: "tipos.html",
        requiere: ["admin", "moderador"],
        escritura: ["admin"],
      },
    ];

    cuadricula.innerHTML = modulos
      .map((mod) => {
        const disponible = mod.requiere.includes(usuario.rol);
        const puedeEscribir = mod.escritura.includes(usuario.rol);
        const bloqueada = !disponible;
        const insignia = bloqueada
          ? "Sin acceso"
          : puedeEscribir
          ? "Lectura y escritura"
          : "Solo lectura";
        return `
          <a href="${bloqueada ? "#" : mod.href}"
             class="tarjeta-modulo ${bloqueada ? "bloqueada" : ""}"
             ${bloqueada ? 'onclick="event.preventDefault();" aria-disabled="true"' : ""}>
            <div class="icono"><i class="bi ${mod.icono}"></i></div>
            <h3>${escapeHtml(mod.titulo)}</h3>
            <p>${escapeHtml(mod.descripcion)}</p>
            <small>${insignia}</small>
          </a>
        `;
      })
      .join("");
  }

  cargarEstadisticas();
});

async function cargarEstadisticas() {
  const tiles = document.querySelectorAll(".stat-tile .stat-valor");
  if (tiles.length < 3) return;

  try {
    const [medicamentos, tipos] = await Promise.all([
      API.listarMedicamentos().catch(() => []),
      API.listarTipos().catch(() => []),
    ]);
    const totalMedicamentos = Array.isArray(medicamentos) ? medicamentos.length : 0;
    const totalTipos = Array.isArray(tipos) ? tipos.length : 0;
    const stockTotal = Array.isArray(medicamentos)
      ? medicamentos.reduce((acc, m) => acc + (Number(m.stock) || 0), 0)
      : 0;

    tiles[0].textContent = totalMedicamentos;
    tiles[1].textContent = totalTipos;
    tiles[2].textContent = stockTotal;

    document.querySelectorAll(".stat-tile--skeleton").forEach((el) =>
      el.classList.remove("stat-tile--skeleton")
    );
  } catch (error) {
    // Silenciar: dejar los "—" si falla el backend
    document.querySelectorAll(".stat-tile--skeleton").forEach((el) =>
      el.classList.remove("stat-tile--skeleton")
    );
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
