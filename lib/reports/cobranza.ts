import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // 👈 Importación directa obligatoria

export async function generateCobranzaReport(pagos: any[]) {
  const doc = new jsPDF()

  // --- Cabecera del Reporte ---
  doc.setFontSize(16)
  doc.text('Reporte de Cobranza', 14, 22)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 32)

  // --- Lógica de Resumen ---
  const totalPagos = pagos.length
  const montoCobrado = pagos
    .filter((p) => p.estado === 'confirmado')
    .reduce((sum, p) => sum + (p.monto || 0), 0)
  const pagosPendientes = pagos.filter((p) => p.estado === 'pendiente').length

  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text('Resumen de Caja:', 14, 45)

  const summaryData = [
    ['Total de Registros', totalPagos.toString()],
    ['Monto Total Confirmado', `S/. ${montoCobrado.toFixed(2)}`],
    ['Pagos por Confirmar', pagosPendientes.toString()],
  ]

  // --- PRIMERA TABLA: Resumen ---
  // CAMBIAMOS (doc as any).autoTable por autoTable(doc, ...)
  autoTable(doc, {
    startY: 52,
    head: [['Concepto', 'Valor']],
    body: summaryData,
    theme: 'grid',
    margin: 14,
  })

  // --- SEGUNDA TABLA: Detalle de Pagos ---
const tableData = pagos.map((pago) => {
  // 1. Intentamos obtener el cliente a través de la venta
  const cliente = pago.ventas?.clientes;

  // 2. Si no hay venta (pagos antiguos), quizás aún esté el cliente_id directo
  // Esto es opcional, pero ayuda si tienes registros viejos
  const nombreCliente = cliente 
    ? `${cliente.apellidos}, ${cliente.nombres}`
    : 'N/A';

  return [
    nombreCliente,
    pago.tipo_pago,
    `S/. ${pago.monto?.toFixed(2)}`,
    pago.metodo_pago || '-',
    pago.estado.toUpperCase(),
    pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-ES') : '-',
  ];
});

  autoTable(doc, {
    // Usamos finalY de la tabla anterior de forma segura
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Cliente', 'Tipo', 'Monto', 'Método', 'Estado', 'Fecha']],
    body: tableData,
    theme: 'striped',
    margin: 14,
    headStyles: { fillColor: [41, 128, 185] }, // Un azul profesional para cobranza
    columnStyles: {
      2: { halign: 'right' },
    },
  })

  // --- Pie de página ---
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  doc.save('reporte-cobranza.pdf')
}