import jsPDF from 'jspdf'
import 'jspdf-autotable'

export async function generateVentasReport(costos: any[]) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(16)
  doc.text('Reporte de Ventas', 14, 22)

  // Date
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 32)

  // Summary
  const totalVentas = costos.length
  const montoTotal = costos.reduce((sum, c) => sum + (c.costo_venta || 0), 0)
  const ventasFinanciadas = costos.filter((c) => c.tipo_venta === 'financiado').length
  const comisionesTotal = costos.reduce((sum, c) => sum + (c.comision_venta || 0), 0)

  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text('Resumen:', 14, 45)

  const summaryData = [
    ['Total de Ventas', totalVentas.toString()],
    ['Monto Total Vendido', `S/. ${montoTotal.toFixed(2)}`],
    ['Ventas Financiadas', ventasFinanciadas.toString()],
    ['Comisiones Pagadas', `S/. ${comisionesTotal.toFixed(2)}`],
  ]

  ;(doc as any).autoTable({
    startY: 52,
    head: [['Concepto', 'Valor']],
    body: summaryData,
    theme: 'grid',
    margin: 14,
  })

  // Detailed table
  const tableData = costos.map((venta) => [
    [venta.clientes?.apellidos, venta.clientes?.nombres].filter(Boolean).join(' ') || 'N/A',
    venta.tipo_venta,
    `S/. ${venta.costo_venta?.toFixed(2)}`,
    `S/. ${venta.aporte_cuota_inicial?.toFixed(2) || '-'}`,
    `S/. ${venta.monto_financiar?.toFixed(2) || '-'}`,
    venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString('es-ES') : '-',
  ])

  ;(doc as any).autoTable({
    startY: (doc as any).lastAutoTable?.finalY + 10 || 100,
    head: [['Cliente', 'Tipo', 'Costo', 'Cuota Inicial', 'Monto Financiar', 'Fecha']],
    body: tableData,
    theme: 'striped',
    margin: 14,
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
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

  doc.save('reporte-ventas.pdf')
}
