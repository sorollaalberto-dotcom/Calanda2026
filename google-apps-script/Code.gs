/**
 * Recibe las respuestas del formulario de index.html y las añade como fila
 * en la hoja activa. Se despliega como "Aplicación web" (ver README.md).
 */
function doPost(e) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Respuestas')
    || crearHojaRespuestas();

  const datos = e.parameter;
  hoja.appendRow([
    new Date(),
    datos.nombre || '(sin nombre)',
    datos.asiste || '',
    datos.cena || ''
  ]);

  return ContentService.createTextOutput('OK');
}

function crearHojaRespuestas() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = libro.insertSheet('Respuestas');
  hoja.appendRow(['Fecha', 'Nombre', '¿Asiste?', '¿Se queda a cenar?']);
  hoja.setFrozenRows(1);
  return hoja;
}
