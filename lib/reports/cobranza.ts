import jsPDF from 'jspdf'
import 'jspdf-autotable'

export async function generateCobranzaReport(pagos: any[]) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(16)
  doc.text('Reporte de Cobranza', 14, 22)

  // Date
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 32)

  // Summary
  const totalPagos = pagos.length
  const montoCobrado = pagos.reduce((sum, p) => sum + (p.monto || 0), 0)
  const pagosConfirmados = pagos.filter((p) => p.estado === 'confirmado').length
  const pagosPendientes = pagos.filter((p) => p.estado === 'pendiente').length
  const montoPendiente = pagos
    .filter((p) => p.estado === 'pendiente')
    .reduce((sum, p) => sum + (p.monto || 0), 0)

  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text('Resumen:', 14, 45)

  const summaryData = [
    ['Total de Pagos Registrados', totalPagos.toString()],
    ['Monto Total Cobrado', `S/. ${montoCobrado.toFixed(2)}`],
    ['Pagos Confirmados', pagosConfirmados.toString()],
    ['Pagos Pendientes', pagosPendientes.toString()],
    ['Monto Pendiente', `S/. ${montoPendiente.toFixed(2)}`],
  ]

  ;(doc as any).autoTable({
    startY: 52,
    head: [['Concepto', 'Valor']],
    body: summaryData,
    theme: 'grid',
    margin: 14,
  })

  // Detailed table
  const tableData = pagos.map((pago) => [
    [pago.clientes?.apellidos, pago.clientes?.nombres].filter(Boolean).join(' ') || 'N/A',
    pago.tipo_pago,
    `S/. ${pago.monto?.toFixed(2)}`,
    pago.metodo_pago || '-',
    pago.estado,
    pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-ES') : '-',
  ])

  ;(doc as any).autoTable({
    startY: (doc as any).lastAutoTable?.finalY + 10 || 120,
    head: [['Cliente', 'Tipo Pago', 'Monto', 'Método', 'Estado', 'Fecha']],
    body: tableData,
    theme: 'striped',
    margin: 14,
    columnStyles: {
      2: { halign: 'right' },
    },
  })

  // Footer
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
