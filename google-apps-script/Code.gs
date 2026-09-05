/**
 * Recibe los datos de las páginas del repositorio y los guarda en la hoja.
 *
 *   index.html  →  formulario del sorteo     →  pestaña "Respuestas"
 *   caja.html   →  movimientos de la caja    →  pestaña "Caja"
 *
 * Se despliega como "Aplicación web" (ver README.md). Una sola
 * implementación sirve para las dos páginas: el parámetro "origen"
 * decide a dónde va cada cosa.
 */

/* ------------------------------------------------------------------
   PIN de la caja

   La página está publicada en internet y cualquiera con el enlace puede
   abrirla. Con un PIN puesto aquí, quien no lo sepa no puede ver los
   movimientos ni apuntar nada: el PIN vive solo en este script, nunca
   viaja dentro del código de la página.

   Pon el que queráis (por ejemplo '2026') y dilo al grupo. Cada uno lo
   escribe una vez en su móvil y se le queda guardado.

   Déjalo vacío ('') para que la caja quede abierta sin PIN.

   El formulario del sorteo no se ve afectado: nunca pide PIN.
   ------------------------------------------------------------------ */

var PIN = '';

var HOJA_RESPUESTAS = 'Respuestas';
var HOJA_CAJA       = 'Caja';

var CABECERA_CAJA = [
  'ID', 'Fecha', 'Tipo', 'Importe (€)', 'Concepto', 'Persona', 'Denominación', 'Hacia'
];


/* ============================ entradas ============================ */

function doPost(e) {
  var datos = (e && e.parameter) || {};

  if (datos.origen === 'caja') {
    if (!pinCorrecto(datos)) return pinMal();
    return guardarMovimiento(datos);
  }
  return guardarRespuesta(datos);   // el sorteo nunca pide PIN
}

function doGet(e) {
  var datos = (e && e.parameter) || {};

  if (datos.origen === 'caja') {
    if (!pinCorrecto(datos)) return pinMal();
    return json({ ok: true, movimientos: leerMovimientos() });
  }
  return json({ ok: false, error: 'Falta el parámetro origen.' });
}

function pinCorrecto(datos) {
  if (!PIN) return true;                                  // sin PIN configurado
  return String(datos.pin || '') === String(PIN);
}

/** La página distingue este caso por "pin": pide el PIN en vez de dar error. */
function pinMal() {
  return json({ ok: false, pin: true, error: 'PIN incorrecto.' });
}


/* ============================ caja ============================ */

/**
 * Añade un movimiento. Es idempotente: si el id ya está en la hoja no
 * lo duplica. Eso permite que el móvil reintente el envío sin miedo
 * cuando no ha podido confirmar si llegó (cobertura mala en fiestas).
 */
function guardarMovimiento(datos) {
  if (!datos.id) {
    return json({ ok: false, error: 'Falta el id del movimiento.' });
  }

  // Sin el candado, dos móviles apuntando a la vez pueden escribir en la
  // misma fila y perderse un movimiento.
  var candado = LockService.getScriptLock();
  try {
    candado.waitLock(20000);
  } catch (err) {
    return json({ ok: false, error: 'La hoja está ocupada, reinténtalo.' });
  }

  try {
    var hoja = hojaCaja();

    if (existeId(hoja, datos.id)) {
      return json({ ok: true, id: datos.id, duplicado: true });
    }

    hoja.appendRow([
      datos.id,
      datos.fecha || new Date().toISOString(),
      datos.tipo || '',
      Number(datos.cantidad || 0),
      datos.concepto || '',
      datos.persona || '',
      datos.denom || '',
      datos.hacia || ''
    ]);

    return json({ ok: true, id: datos.id });

  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    candado.releaseLock();
  }
}

function leerMovimientos() {
  var hoja = hojaCaja();
  var filas = hoja.getDataRange().getValues();
  var salida = [];

  for (var i = 1; i < filas.length; i++) {      // la 0 es la cabecera
    var f = filas[i];
    if (!f[0]) continue;                        // fila vacía o borrada a mano

    salida.push({
      id:       String(f[0]),
      hora:     aISO(f[1]),
      tipo:     String(f[2]),
      cantidad: Number(f[3]) || 0,
      concepto: String(f[4]),
      persona:  String(f[5]),
      denom:    f[6] ? String(f[6]) : null,
      hacia:    f[7] ? String(f[7]) : null
    });
  }

  salida.sort(function (a, b) { return a.hora < b.hora ? -1 : (a.hora > b.hora ? 1 : 0); });
  return salida;
}

function existeId(hoja, id) {
  var ultima = hoja.getLastRow();
  if (ultima < 2) return false;

  var ids = hoja.getRange(2, 1, ultima - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return true;
  }
  return false;
}

function hojaCaja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja  = libro.getSheetByName(HOJA_CAJA);
  if (hoja) return hoja;

  hoja = libro.insertSheet(HOJA_CAJA);
  hoja.appendRow(CABECERA_CAJA);
  hoja.setFrozenRows(1);
  hoja.getRange('D:D').setNumberFormat('#,##0.00 €');
  hoja.setColumnWidth(1, 150);
  hoja.setColumnWidth(2, 170);
  hoja.setColumnWidth(5, 240);
  return hoja;
}

/** Las celdas de fecha vuelven como Date; el móvil espera texto ISO. */
function aISO(v) {
  if (v instanceof Date) return v.toISOString();
  return String(v || '');
}


/* ========================= sorteo (index.html) ========================= */

function guardarRespuesta(datos) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_RESPUESTAS)
    || crearHojaRespuestas();

  hoja.appendRow([
    new Date(),
    datos.nombre || '(sin nombre)',
    datos.asiste || '',
    datos.cena || ''
  ]);

  return ContentService.createTextOutput('OK');
}

function crearHojaRespuestas() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.insertSheet(HOJA_RESPUESTAS);
  hoja.appendRow(['Fecha', 'Nombre', '¿Asiste?', '¿Se queda a cenar?']);
  hoja.setFrozenRows(1);
  return hoja;
}


/* ============================ utilidades ============================ */

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
