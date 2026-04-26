import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function generateReciboPDF(pago: any, cliente: any) {
    if (!cliente) {
    alert("No se encontró información del cliente para generar el recibo.");
    return;
  }
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 150] // Formato ticket (80mm de ancho)
  })

  // Encabezado
  doc.setFontSize(12)
  doc.text('RECIBO DE PAGO', 40, 10, { align: 'center' })
  
  doc.setFontSize(8)
  doc.text('------------------------------------------', 40, 15, { align: 'center' })
  doc.text(`Fecha: ${new Date(pago.fecha_pago).toLocaleDateString()}`, 10, 20)
  doc.text(`Recibo N°: ${pago.numero_recibo || 'S/N'}`, 10, 24)

  // Datos del Cliente
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENTE:', 10, 32)
  doc.setFont('helvetica', 'normal')
  doc.text(`${cliente.apellidos}, ${cliente.nombres}`, 10, 36)
  doc.text(`Código: ${cliente.codigo_cliente}`, 10, 40)

  // Detalle del Pago
  autoTable(doc, {
    startY: 45,
    head: [['Descripción', 'Monto']],
    body: [
      [pago.tipo_pago.toUpperCase(), `S/. ${pago.monto.toFixed(2)}`]
    ],
    theme: 'plain',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] }
  })

  const finalY = (doc as any).lastAutoTable.finalY

  // Totales y Método
  doc.text(`Método: ${pago.metodo_pago}`, 10, finalY + 10)
  doc.setFontSize(11)
  doc.text(`TOTAL PAGADO: S/. ${pago.monto.toFixed(2)}`, 10, finalY + 18)

  // Pie de página
  doc.setFontSize(7)
  doc.text('Gracias por su pago', 40, finalY + 30, { align: 'center' })

  // Acción: Abrir ventana de impresión automáticamente
  doc.autoPrint()
  window.open(doc.output('bloburl'), '_blank')
}