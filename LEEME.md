# Veterinaria Villa Kanes — Sitio web

Sitio estático (HTML + CSS + JavaScript puro). No necesita npm, ni compilar, ni instalar nada para funcionar.

---

## 1. Abrir el proyecto en VS Code

1. Descomprime `villa-kanes-veterinaria.zip`.
2. En VS Code: **Archivo → Abrir carpeta…** y elige la carpeta `villa-kanes-veterinaria`.
3. VS Code te sugerirá instalar las extensiones recomendadas (aviso abajo a la derecha). Acepta. La importante es **Live Server**.
4. Abre `index.html` y haz clic en **Go Live** (barra inferior derecha), o clic derecho → **Open with Live Server**.
5. Se abre el navegador en `http://127.0.0.1:5500/`. Cada vez que guardes un archivo, la página se recarga sola.

> Sin Live Server también puedes hacer doble clic en `index.html`: el sitio funciona igual, solo que el mapa de Google puede tardar más en cargar.

---

## 2. Estructura

```
villa-kanes-veterinaria/
├── index.html          ← todo el contenido (textos, secciones, imágenes)
├── styles.css          ← diseño: colores, tipografías, tamaños, responsive
├── main.js             ← interacciones: pestañas, plan de cuidados, horario en vivo, galería, modales
├── lib/
│   ├── manifest.js     ← datos de la clínica: horario, WhatsApp, dirección
│   ├── gsap.min.js     ← librería de animación (no editar)
│   └── ScrollTrigger.min.js
├── assets/
│   ├── img/            ← 27 fotos en formato .webp
│   ├── favicon.svg     ← icono de la pestaña del navegador
│   └── credits.json    ← origen de cada foto (Unsplash)
├── .htaccess           ← evita que Hostinger muestre versiones viejas (no borrar)
└── .vscode/            ← configuración de VS Code y extensiones recomendadas
```

---

## 3. Qué editar y dónde

En `index.html` cada sección empieza con un comentario visible, por ejemplo `<!-- ===================== SERVICIOS (TABS) ===================== -->`. Usa **Cmd/Ctrl + F** para saltar a ellas:

| Quiero cambiar…                 | Archivo                  | Busca                               |
|---------------------------------|--------------------------|-------------------------------------|
| Título y texto principal        | `index.html`             | `HERO`                              |
| Servicios (8 pestañas)          | `index.html`             | `SERVICIOS (TABS)`                  |
| Plan de cuidados (textos)       | `main.js`                | `var CARE =`                        |
| Equipo (fotos, cargos, nombres) | `index.html`             | `EQUIPO`                            |
| Consejos y sus ventanas         | `index.html`             | `CONSEJOS` y `<dialog`              |
| Galería                         | `index.html`             | `GALERÍA`                           |
| Preguntas frecuentes            | `index.html`             | `FAQ`                               |
| Colores de marca                | `styles.css`             | `1. TOKENS` (al inicio del archivo) |

### Horario
Está en **dos lugares**, cámbialo en ambos:
- `lib/manifest.js` → `hours` (lo usa el aviso "Abierto ahora / Cerrado"). Formato decimal: `8.5` = 8:30, `22` = 10:00 p. m. `0` es domingo.
- `index.html` → busca `8:30 a. m.` (tabla de horarios, franja informativa y pie de página).

### WhatsApp
Busca y reemplaza en todo el proyecto (**Cmd/Ctrl + Shift + H**):
`https://wa.me/message/OZRYFTZSRGCHM1` → el nuevo enlace.

### Fotos
1. Pon la foto nueva en `assets/img/` (ideal en `.webp`; puedes convertir gratis en squoosh.app).
2. En `index.html` cambia el `src="assets/img/…"` y el texto `alt="…"` (describe la foto).
3. Tamaños recomendados: hero 1400 px de ancho, servicios 1200 px, equipo 800×1000 px, galería 900 px.

### Mapa
En `index.html` busca `maps.google.com/maps?q=` y cambia la búsqueda por la dirección exacta o, mejor, pega el enlace "Insertar mapa" de Google Maps de la clínica.

---

## 4. Publicar en Hostinger

1. **Antes de subir**, cambia la versión en `index.html`: busca `?v=20261018c` y reemplázala por la fecha del día (ej. `?v=20261105`). Así los visitantes ven los cambios al instante.
2. En Hostinger: **Administrador de archivos → public_html**.
3. Sube **el contenido** de la carpeta (no la carpeta en sí): `index.html`, `styles.css`, `main.js`, `.htaccess`, `lib/` y `assets/`.
4. No hace falta subir `.vscode/`, `LEEME.md` ni `.gitignore`.
5. Si `.htaccess` no aparece, activa "Mostrar archivos ocultos" en el administrador.

También funciona arrastrando la carpeta a Netlify Drop (app.netlify.com/drop).

---

## 5. Pendiente de confirmar con la clínica antes de publicar

El sitio tiene información verificada de su Instagram y otra de relleno. Confirmar:

- [ ] **Servicios reales.** Laboratorio, hospitalización y nutrición son supuestos.
- [ ] **Equipo:** nombres, cargos y fotos reales (las actuales son de stock).
- [ ] **Fotos reales** del local y pacientes (con permiso de los dueños).
- [ ] **Urgencias:** ¿atienden fuera del horario?
- [ ] **Medios de pago.**
- [ ] **Dirección exacta** para el mapa.
- [ ] **Reseñas reales** de Google, si quieren mostrarlas.

**Verificado en su Instagram:** nombre, dirección, horario, WhatsApp, colores de marca y temas de consejos (vacuna anual, bolas de pelo, huesos, anestesia, guardería).

---

## 6. Créditos

Fotografías de stock de Unsplash (licencia gratuita para uso comercial: unsplash.com/license). El detalle por foto está en `assets/credits.json`.
Tipografías: Bricolage Grotesque, Manrope e Instrument Serif (Google Fonts).
