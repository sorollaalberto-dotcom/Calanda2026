# Fiestas de Calanda — confirmación de asistencia

Página independiente (`index.html`) con un formulario de tres campos
—nombre (opcional), si asistes y si te quedas a cenar— que guarda cada
respuesta como una fila nueva en una hoja de cálculo de Google. Al estar en
Google Sheets, cualquiera que tenga la hoja abierta ve las respuestas
aparecer en tiempo real, sin recargar nada.

No hace falta backend propio: el envío va directo del navegador a un
"Apps Script" ligado a la hoja.

## Publicar la página (GitHub Pages)

1. En este repositorio, ve a **Settings → Pages**.
2. En "Source" elige **"Deploy from a branch"**.
3. Rama: **main**, carpeta: **/ (root)**. Guarda.
4. GitHub te da una URL pública, algo como
   `https://sorollaalberto-dotcom.github.io/fiesta-calanda/` — esa es la que
   compartes con la gente del pueblo.

## Conectar las respuestas a Google Sheets

### 1. Crear la hoja de cálculo

Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva
(por ejemplo, "Fiestas de Calanda — respuestas").

### 2. Añadir el script que guarda las respuestas

1. En la hoja, ve a **Extensiones → Apps Script**.
2. Borra el contenido de `Code.gs` que aparece por defecto y pega el
   contenido de [`google-apps-script/Code.gs`](./google-apps-script/Code.gs)
   de este repositorio.
3. Guarda el proyecto (icono de disquete o `Ctrl/Cmd+S`).

### 3. Publicar el script como aplicación web

1. Arriba a la derecha, pulsa **Implementar → Nueva implementación**.
2. En "Selecciona el tipo", elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
4. Pulsa **Implementar**. Google te pedirá autorizar el script la primera
   vez (es tuyo, dale permiso).
5. Copia la **URL de la aplicación web** que te da (termina en `/exec`).

> Si más adelante cambias el código del script, tendrás que crear una
> **nueva implementación** (o "gestionar implementaciones" → editar) para
> que los cambios se apliquen a esa misma URL.

### 4. Conectar la página con el script

1. Abre `index.html`.
2. Busca la línea:
   ```js
   const SCRIPT_URL = '...';
   ```
3. Sustituye esa URL por la que copiaste en el paso anterior.
4. Guarda y sube el cambio (commit + push).

### 5. Probar

- Abre la URL pública de GitHub Pages, rellena el formulario y envíalo.
- Abre la hoja de cálculo: debería aparecer una fila nueva en la pestaña
  "Respuestas" con fecha, nombre, si asiste y si se queda a cenar.
- Comparte la hoja con quien organice la fiesta (permiso de "Lector" o
  "Comentador" es suficiente) para que vea las respuestas en directo.

## Notas

- El campo nombre es opcional: si se deja vacío se guarda como
  "(sin nombre)".
- La página no necesita build ni dependencias: es HTML/CSS/JS puro.
- Si quieres cambiar el nombre del evento, el texto o los colores, edita
  directamente `index.html` (todo el diseño está en el mismo archivo).
