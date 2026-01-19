import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Download, Edit } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useGoals } from "@/hooks/useGoals"
import { LifeWheel } from "@/components/LifeWheel"
import { EditLifeAreaDialog } from "@/components/EditLifeAreaDialog"

interface LifeArea {
  id: number
  name: string
  description: string
  color: string
  satisfaction_level: number
  display_order: number
  created_at: string
  updated_at: string
}

const RodaDaVida = () => {
  const { lifeAreas, loading, updateLifeArea } = useGoals()

  const [selectedArea, setSelectedArea] = useState<LifeArea | null>(null)
  const [isEditAreaDialogOpen, setIsEditAreaDialogOpen] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  const handleAreaClick = (area: LifeArea) => {
    setSelectedArea(area)
    setIsEditAreaDialogOpen(true)
  }

  const handleSaveArea = async (id: number, level: number) => {
    await updateLifeArea(id, level)
  }

  const handleDownloadWheel = async () => {
    if (!wheelRef.current) return

    try {
      const canvas = await html2canvas(wheelRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      })

      const imgData = canvas.toDataURL("image/png")

      // Criar PDF em formato A4
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Dimensões A4 em mm
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calcular dimensões da imagem mantendo proporção
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = imgWidth / imgHeight

      let finalWidth = pdfWidth - 20 // margem de 10mm de cada lado
      let finalHeight = finalWidth / ratio

      // Se a altura ultrapassar a página, ajustar pela altura
      if (finalHeight > pdfHeight - 20) {
        finalHeight = pdfHeight - 20
        finalWidth = finalHeight * ratio
      }

      // Centralizar
      const x = (pdfWidth - finalWidth) / 2
      const y = 10 // margem superior

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight)

      const date = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")
      pdf.save(`roda-da-vida-${date}.pdf`)
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      alert("Erro ao baixar a Roda da Vida")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold">Roda da Vida</h1>
            </div>
            <Button variant="outline" onClick={handleDownloadWheel}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Roda da Vida
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <>
            <EditLifeAreaDialog
              area={selectedArea}
              open={isEditAreaDialogOpen}
              onOpenChange={setIsEditAreaDialogOpen}
              onSave={handleSaveArea}
            />

            {/* Layout: Roda à esquerda (2/3), Áreas à direita (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Seção da Roda da Vida - 2 colunas */}
              <div className="lg:col-span-2">
                <div ref={wheelRef} className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Roda da Vida</h2>
                  <LifeWheel
                    lifeAreas={lifeAreas}
                    onAreaClick={handleAreaClick}
                  />
                </div>
              </div>

              {/* Seção de Áreas da Vida - 1 coluna */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Áreas da Vida
                  </h2>
                  <div className="space-y-3">
                    {lifeAreas.map((area) => (
                      <div
                        key={area.id}
                        className="bg-gray-50 rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => handleAreaClick(area)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: area.color }}
                            />
                            <h3 className="font-medium">{area.name}</h3>
                          </div>
                          <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {area.description}
                        </p>
                        <p className="text-sm font-semibold">
                          {area.satisfaction_level}/10
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default RodaDaVida
