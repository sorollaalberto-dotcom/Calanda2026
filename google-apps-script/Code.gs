/**
 * Recibe los envíos de los formularios de la web y los añade como fila en la
 * hoja de cálculo. Se despliega como "Aplicación web" (ver README.md).
 *
 * - Pedidos de camiseta (index.html): hoja "Camisetas".
 * - Respuestas del sorteo (sorteo.html): hoja "Respuestas".
 */
function doPost(e) {
  const datos = e.parameter;

  if (datos.tipo === 'camiseta') {
    hojaCamisetas().appendRow([
      new Date(),
      datos.nombre_solo || datos.nombre || '(sin nombre)',
      datos.apellidos || '',
      datos.talla || '',
      datos.movil || ''
    ]);
    return ContentService.createTextOutput('OK');
  }

  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Respuestas')
    || crearHojaRespuestas();

  hoja.appendRow([
    new Date(),
    datos.nombre || '(sin nombre)',
    datos.asiste || '',
    datos.cena || ''
  ]);

  return ContentService.createTextOutput('OK');
}

function hojaCamisetas() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName('Camisetas');
  if (!hoja) {
    hoja = libro.insertSheet('Camisetas');
    hoja.appendRow(['Fecha', 'Nombre', 'Apellidos', 'Talla', 'Móvil']);
    hoja.setFrozenRows(1);
    // Texto sin formato para que el móvil no pierda el "+" ni los ceros.
    hoja.getRange('E:E').setNumberFormat('@');
  }
  return hoja;
}

function crearHojaRespuestas() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = libro.insertSheet('Respuestas');
  hoja.appendRow(['Fecha', 'Nombre', '¿Asiste?', '¿Se queda a cenar?']);
  hoja.setFrozenRows(1);
  return hoja;
}
