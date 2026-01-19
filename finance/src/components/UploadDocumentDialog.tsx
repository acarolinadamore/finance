import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, FileText, X, Image as ImageIcon, FileSpreadsheet, Presentation } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocumentCategory {
  id: number
  name: string
  description?: string
  icon: string
  color: string
  display_order: number
}

interface FileToUpload {
  file: File
  name: string
  description: string
  categoryId: string
  tags: string
}

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: DocumentCategory[]
  onUpload: (document: {
    category_id?: number
    name: string
    description?: string
    file_name: string
    file_type: string
    file_size?: number
    file_data: string
    tags?: string[]
  }) => Promise<void>
}

export const UploadDocumentDialog = ({
  open,
  onOpenChange,
  categories,
  onUpload,
}: UploadDocumentDialogProps) => {
  const [files, setFiles] = useState<FileToUpload[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    // Microsoft Office
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // Outros
    'text/plain', // .txt
  ]

  const maxSize = 10 * 1024 * 1024 // 10MB

  const validateFile = (file: File): string | null => {
    if (!validTypes.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use PDF, imagens, documentos Office (Word, Excel, PowerPoint) ou texto.'
    }
    if (file.size > maxSize) {
      return 'Arquivo muito grande. O tamanho máximo é 10MB.'
    }
    return null
  }

  const handleFiles = (fileList: FileList) => {
    const newFiles: FileToUpload[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const error = validateFile(file)

      if (error) {
        alert(`${file.name}: ${error}`)
        continue
      }

      newFiles.push({
        file,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extensão
        description: "",
        categoryId: "",
        tags: "",
      })
    }

    setFiles([...files, ...newFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const updateFile = (index: number, field: keyof FileToUpload, value: string) => {
    const newFiles = [...files]
    newFiles[index] = { ...newFiles[index], [field]: value }
    setFiles(newFiles)
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Por favor, selecione pelo menos um arquivo")
      return
    }

    // Validar se todos os arquivos têm nome
    const invalidFiles = files.filter(f => !f.name.trim())
    if (invalidFiles.length > 0) {
      alert("Todos os arquivos precisam ter um nome")
      return
    }

    try {
      setUploading(true)

      // Upload de cada arquivo
      for (const fileData of files) {
        const base64Data = await convertFileToBase64(fileData.file)

        const tagsArray = fileData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)

        await onUpload({
          category_id: fileData.categoryId && fileData.categoryId !== "none"
            ? parseInt(fileData.categoryId)
            : undefined,
          name: fileData.name,
          description: fileData.description || undefined,
          file_name: fileData.file.name,
          file_type: fileData.file.type,
          file_size: fileData.file.size,
          file_data: base64Data,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        })
      }

      // Limpar e fechar
      setFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      alert("Erro ao fazer upload dos documentos. Tente novamente.")
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
    }
    if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-600 flex-shrink-0" />
    }
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <Presentation className="h-8 w-8 text-orange-500 flex-shrink-0" />
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
    }
    return <FileText className="h-8 w-8 text-gray-500 flex-shrink-0" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Adicionar Documentos</DialogTitle>
          <DialogDescription>
            Arraste arquivos ou clique para selecionar (até 10MB cada)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Área de drag & drop */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-1">
              {dragActive
                ? 'Solte os arquivos aqui'
                : 'Arraste arquivos aqui ou clique para selecionar'}
            </p>
            <p className="text-xs text-gray-400">
              PDF, imagens, Word, Excel, PowerPoint ou texto - máximo 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
          </div>

          {/* Lista de arquivos */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Arquivos selecionados ({files.length})
              </Label>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {files.map((fileData, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3 bg-gray-50"
                    >
                      {/* Header do arquivo */}
                      <div className="flex items-start gap-3">
                        {getFileIcon(fileData.file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {fileData.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(fileData.file.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Campos do documento */}
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Nome *</Label>
                          <Input
                            value={fileData.name}
                            onChange={(e) => updateFile(index, 'name', e.target.value)}
                            placeholder="Nome do documento"
                            className="h-9"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Categoria</Label>
                          <Select
                            value={fileData.categoryId}
                            onValueChange={(value) => updateFile(index, 'categoryId', value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem categoria</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Descrição</Label>
                          <Textarea
                            value={fileData.description}
                            onChange={(e) => updateFile(index, 'description', e.target.value)}
                            placeholder="Informações adicionais..."
                            rows={2}
                            className="resize-none"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Tags (separadas por vírgula)</Label>
                          <Input
                            value={fileData.tags}
                            onChange={(e) => updateFile(index, 'tags', e.target.value)}
                            placeholder="Ex: pessoal, importante"
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFiles([])
              onOpenChange(false)
            }}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading
              ? `Enviando ${files.length} ${files.length === 1 ? 'documento' : 'documentos'}...`
              : `Adicionar ${files.length} ${files.length === 1 ? 'Documento' : 'Documentos'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
