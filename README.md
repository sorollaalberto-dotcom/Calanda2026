# Fiestas de Calanda

Dos páginas independientes, sin build ni dependencias, publicadas con
GitHub Pages:

| Página | Para qué |
|---|---|
| `index.html` | Web pública de La Sobremesa, con el formulario del sorteo. |
| `sorteo.html` | Página suelta para apuntarse al sorteo. |
| `caja.html` | Tracker de caja de uso interno durante las fiestas. |

Las dos guardan sus datos en la **misma hoja de cálculo de Google**, en
pestañas distintas ("Respuestas" y "Caja"), mediante un único Apps Script.
No hace falta backend propio: el navegador habla directamente con el
script ligado a la hoja.

El formulario del sorteo pide tres campos —nombre (opcional), si asistes y
si te quedas a cenar— y añade una fila por respuesta. Cualquiera que tenga
la hoja abierta las ve aparecer en tiempo real, sin recargar nada.

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

## Tracker de caja (`caja.html`)

Página de uso interno para llevar la caja durante las fiestas: apertura
contando monedas y billetes, ingresos y retiradas con denominación,
traspasos entre personas y registro de todo lo apuntado.

Al abrir se cuenta lo que hay de verdad: una fila por denominación —de 50
céntimos a 50 euros— donde se pone cuántas piezas hay de cada una, y el
total se calcula solo. Empieza todo a cero, así que si un día salís sin
fondo basta con abrir sin tocar nada. El botón "Fondo habitual" rellena de
un toque las cantidades que soléis sacar (1500 €), y desde ahí se corrigen
las que hagan falta. El desglose del recuento se guarda en la hoja junto a
la apertura.

Si cambian las cantidades habituales, están en `caja.html` en
`FONDO_HABITUAL`, expresadas en número de piezas por denominación.

**Sin conectar a la hoja funciona igual, pero cada móvil lleva su propia
caja por separado.** Para que todos veáis la misma caja —y para que quede
registro— hay que conectarla, siguiendo estos pasos.

### 1. Actualizar el script

`google-apps-script/Code.gs` ya trae el código que atiende a las dos
páginas. Si el script del sorteo ya estaba desplegado, pega el contenido
actualizado del archivo encima del que tenías y guarda.

### 2. Volver a implementar

El código nuevo **no llega solo** a la URL que ya tenías: hay que publicar
una versión.

1. En el editor de Apps Script: **Implementar → Gestionar implementaciones**.
2. En la implementación existente, pulsa el lápiz (**Editar**).
3. En "Versión" elige **Nueva versión** y pulsa **Implementar**.
4. Comprueba que sigue en **Quién tiene acceso: cualquier usuario**. Sin
   eso, la página no puede leer los movimientos.

La URL `/exec` no cambia. Si aún no tenías script, sigue los pasos de la
sección anterior para crear la implementación desde cero.

### 3. Pegar la URL en la página

1. Abre `caja.html`.
2. Arriba del `<script>`, busca:
   ```js
   var API = '';
   ```
3. Pon ahí la URL de la aplicación web (la que termina en `/exec`).
4. Guarda y sube el cambio.

### 4. Comprobar

Abre `caja.html` en dos móviles. Bajo el saldo debe poner **"Al día"** con
un punto verde. Apunta un movimiento en uno y en el otro pulsa esa misma
línea para refrescar: debería aparecer. En la hoja tendrás una pestaña
"Caja" con una fila por movimiento.

### Cómo se comporta

- **Se refresca sola** cada 25 segundos mientras la tienes abierta, y al
  volver a la pestaña. También puedes tocar la línea de estado para forzarlo.
- **Funciona sin cobertura.** Lo que apuntes se guarda en el móvil, se marca
  como "sin guardar" y se envía en cuanto vuelve la señal. Los envíos llevan
  un identificador propio y el script no los duplica, así que reintentar es
  seguro.
- **Nunca se borra nada.** "Cerrar caja" no elimina movimientos: anota una
  fila de cierre y el contador vuelve a cero. Todo el histórico se queda en
  la hoja.
- El saldo que ves es el de la caja abierta ahora, es decir, lo posterior al
  último cierre.

> Ojo: quien pueda abrir la hoja puede editarla a mano. Comparte con permiso
> de **Lector** a quien solo tenga que consultarla.

## Notas

- El campo nombre es opcional: si se deja vacío se guarda como
  "(sin nombre)".
- La página no necesita build ni dependencias: es HTML/CSS/JS puro.
- Si quieres cambiar el nombre del evento, el texto o los colores, edita
  directamente `index.html` (todo el diseño está en el mismo archivo).
