// ===========================================================
// home.js — Menú principal que se muestra tras iniciar sesión
// Presenta tarjetas con los módulos disponibles según el rol.
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  const usuario = Nav.requerirAutenticacion();
  if (!usuario) return;

  Nav.renderizar("inicio");

  const contenedorNombre = document.getElementById("nombre-usuario");
  if (contenedorNombre) contenedorNombre.textContent = usuario.nombre;

  const contenedorRol = document.getElementById("rol-usuario");
  if (contenedorRol) contenedorRol.textContent = Nav.formatearRol(usuario.rol);

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
        return `
          <a href="${bloqueada ? "#" : mod.href}"
             class="tarjeta-modulo ${bloqueada ? "bloqueada" : ""}"
             ${bloqueada ? 'onclick="event.preventDefault();"' : ""}>
            <div class="icono"><i class="bi ${mod.icono}"></i></div>
            <h3>${mod.titulo}</h3>
            <p>${mod.descripcion}</p>
            <small class="text-muted">
              ${
                bloqueada
                  ? "Sin acceso"
                  : puedeEscribir
                  ? "Acceso de lectura y escritura"
                  : "Acceso de solo lectura"
              }
            </small>
          </a>
        `;
      })
      .join("");
  }
});
