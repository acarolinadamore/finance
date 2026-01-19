import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Loader2 } from "lucide-react"

interface Document {
  id: number
  category_id?: number
  category_name?: string
  category_color?: string
  name: string
  description?: string
  file_name: string
  file_type: string
  file_size?: number
  file_data?: string
  tags?: string[]
  created_at: string
}

interface DocumentViewerDialogProps {
  documentId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onGetDocument: (id: number) => Promise<Document>
}

export const DocumentViewerDialog = ({
  documentId,
  open,
  onOpenChange,
  onGetDocument,
}: DocumentViewerDialogProps) => {
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && documentId) {
      loadDocument()
    }
  }, [open, documentId])

  const loadDocument = async () => {
    if (!documentId) return

    try {
      setLoading(true)
      setError(null)
      const doc = await onGetDocument(documentId)
      setDocument(doc)
    } catch (err) {
      console.error("Erro ao carregar documento:", err)
      setError("Erro ao carregar documento")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!document || !document.file_data) return

    try {
      // Converter base64 para blob
      const byteCharacters = atob(document.file_data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: document.file_type })

      // Criar link de download
      const url = window.URL.createObjectURL(blob)
      const link = window.createElement("a")
      link.href = url
      link.download = document.file_name
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao baixar documento:", error)
      alert("Erro ao baixar documento. Tente novamente.")
    }
  }

  const handlePrint = () => {
    if (!document || !document.file_data) return

    try {
      const byteCharacters = atob(document.file_data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: document.file_type })
      const url = window.URL.createObjectURL(blob)

      const printWindow = window.open(url)
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    } catch (error) {
      console.error("Erro ao imprimir documento:", error)
      alert("Erro ao imprimir documento. Tente novamente.")
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderPreview = () => {
    if (!document || !document.file_data) return null

    const dataUrl = `data:${document.file_type};base64,${document.file_data}`

    if (document.file_type.startsWith("image/")) {
      return (
        <div className="mt-4">
          <img
            src={dataUrl}
            alt={document.name}
            className="w-full h-auto max-h-[500px] object-contain rounded-lg border"
          />
        </div>
      )
    }

    if (document.file_type === "application/pdf") {
      return (
        <div className="mt-4">
          <iframe
            src={dataUrl}
            className="w-full h-[500px] border rounded-lg"
            title={document.name}
          />
        </div>
      )
    }

    // Para documentos Office e outros tipos
    const fileTypeName = document.file_type.includes('word') || document.file_type.includes('document')
      ? 'Word'
      : document.file_type.includes('sheet') || document.file_type.includes('excel')
      ? 'Excel'
      : document.file_type.includes('presentation') || document.file_type.includes('powerpoint')
      ? 'PowerPoint'
      : 'este tipo de arquivo'

    return (
      <div className="mt-4 p-8 text-center border rounded-lg bg-gray-50">
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-muted-foreground mb-2">
          Visualização não disponível para documentos {fileTypeName}
        </p>
        <p className="text-xs text-muted-foreground">
          Use os botões abaixo para baixar ou imprimir o documento
        </p>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualizar Documento</DialogTitle>
          <DialogDescription>
            Visualize e faça download do documento
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        ) : document ? (
          <div className="space-y-4">
            {/* Informações do documento */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-xl">{document.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {document.file_name}
                  </p>
                </div>
                {document.category_name && (
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: document.category_color,
                      color: document.category_color,
                    }}
                  >
                    {document.category_name}
                  </Badge>
                )}
              </div>

              {document.description && (
                <p className="text-sm">{document.description}</p>
              )}

              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span>Tamanho: {formatFileSize(document.file_size)}</span>
                <span>Adicionado em: {formatDate(document.created_at)}</span>
              </div>
            </div>

            {/* Preview do documento */}
            {renderPreview()}

            {/* Ações */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button onClick={handlePrint} variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
