'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { generateVentasReport } from '@/lib/reports/ventas'
import { generateCobranzaReport } from '@/lib/reports/cobranza'
import { FileDown } from 'lucide-react'

interface ReportesContentProps {
  clientes: any[]
  costos: any[]
  pagos: any[]
  userRole?: string
}

export function ReportesContent({
  clientes,
  costos,
  pagos,
  userRole,
}: ReportesContentProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateVentasPDF = async () => {
    setIsGenerating(true)
    try {
      await generateVentasReport(costos)
    } catch (error) {
      console.error('[v0] Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCobranzaPDF = async () => {
    setIsGenerating(true)
    try {
      await generateCobranzaReport(pagos)
    } catch (error) {
      console.error('[v0] Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ventas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ventas">Reporte de Ventas</TabsTrigger>
          <TabsTrigger value="cobranza">Reporte de Cobranza</TabsTrigger>
        </TabsList>

        <TabsContent value="ventas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Ventas</CardTitle>
              <CardDescription>
                Reportes de transacciones de venta completadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Ventas</p>
                  <p className="text-2xl font-bold">{costos.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto Total</p>
                  <p className="text-2xl font-bold">
                    S/. {(costos.reduce((sum, c) => sum + (c.costo_venta || 0), 0) / 1000).toFixed(1)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ventas Financiadas</p>
                  <p className="text-2xl font-bold">
                    {costos.filter((c) => c.tipo_venta === 'financiado').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comisiones Pagadas</p>
                  <p className="text-2xl font-bold">
                    S/. {(costos.reduce((sum, c) => sum + (c.comision_venta || 0), 0) / 1000).toFixed(1)}K
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Opciones de Exportación</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateVentasPDF}
                    disabled={isGenerating}
                    variant="outline"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cobranza" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Cobranza</CardTitle>
              <CardDescription>
                Reportes de pagos y cobros registrados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pagos</p>
                  <p className="text-2xl font-bold">{pagos.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto Cobrado</p>
                  <p className="text-2xl font-bold">
                    S/. {(pagos
                      .filter((p) => p.estado === 'confirmado')
                      .reduce((sum, p) => sum + (p.monto || 0), 0) / 1000).toFixed(1)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagos Confirmados</p>
                  <p className="text-2xl font-bold">
                    {pagos.filter((p) => p.estado === 'confirmado').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
                  <p className="text-2xl font-bold">
                    {pagos.filter((p) => p.estado === 'pendiente').length}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Opciones de Exportación</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateCobranzaPDF}
                    disabled={isGenerating}
                    variant="outline"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
