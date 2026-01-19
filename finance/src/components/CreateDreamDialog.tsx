import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Upload } from "lucide-react"

interface LifeArea {
  id: number
  name: string
  color: string
}

interface CreateDreamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lifeAreas: LifeArea[]
  onCreateDream: (dream: {
    title: string
    description?: string
    image?: string
    deadline?: string
    life_area_id?: number
  }) => Promise<void>
}

export const CreateDreamDialog = ({
  open,
  onOpenChange,
  lifeAreas,
  onCreateDream,
}: CreateDreamDialogProps) => {
  const [title, setTitle] = useState("")
  const [lifeAreaId, setLifeAreaId] = useState<string>("")
  const [prazoTipo, setPrazoTipo] = useState<string>("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [deadline, setDeadline] = useState("")
  const [saving, setSaving] = useState(false)

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Redimensionar se for muito grande (max 800px)
          const maxSize = 800
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (ctx) {
            // Preencher fundo branco (para PNGs com transparência)
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, width, height)
            ctx.drawImage(img, 0, 0, width, height)
          }

          // Comprimir com qualidade 0.8 (melhor qualidade)
          const compressed = canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressed)
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Verificar se é imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem')
        return
      }

      // Verificar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB')
        return
      }

      setImageFile(file)

      try {
        // Comprimir e criar preview
        const compressed = await compressImage(file)
        setImagePreview(compressed)
      } catch (error) {
        console.error('Erro ao processar imagem:', error)
        alert('Erro ao processar imagem')
      }
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Por favor, insira um título para o sonho")
      return
    }

    try {
      setSaving(true)

      await onCreateDream({
        title,
        description: description || undefined,
        image: imagePreview || image || undefined,
        deadline: deadline || undefined,
        life_area_id: lifeAreaId ? parseInt(lifeAreaId) : undefined,
        prazo_tipo: prazoTipo as 'curto' | 'medio' | 'longo' | undefined,
      })

      // Limpar formulário
      setTitle("")
      setLifeAreaId("")
      setPrazoTipo("")
      setDescription("")
      setImage("")
      setImageFile(null)
      setImagePreview("")
      setDeadline("")

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar sonho:", error)
      alert("Erro ao criar sonho. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Sonho</DialogTitle>
          <DialogDescription>
            Defina seu sonho e acompanhe o tempo até realizá-lo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título do Sonho */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título do Sonho <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ex: Viajar para o Japão"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Área da Vida */}
          <div className="space-y-2">
            <Label htmlFor="lifeArea">Área da Vida (opcional)</Label>
            <Select value={lifeAreaId} onValueChange={setLifeAreaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem área específica</SelectItem>
                {lifeAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: area.color }}
                      />
                      {area.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Prazo */}
          <div className="space-y-2">
            <Label htmlFor="prazoTipo">Tipo de Prazo (opcional)</Label>
            <Select value={prazoTipo} onValueChange={setPrazoTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem prazo definido</SelectItem>
                <SelectItem value="curto">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    Curto Prazo
                  </div>
                </SelectItem>
                <SelectItem value="medio">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    Médio Prazo
                  </div>
                </SelectItem>
                <SelectItem value="longo">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    Longo Prazo
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva seu sonho..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload de Imagem */}
          <div className="space-y-2">
            <Label htmlFor="imageUpload">Imagem (opcional)</Label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('imageUpload')?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imageFile ? imageFile.name : 'Escolher do computador'}
                </Button>
              </div>
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ou
                  </span>
                </div>
              </div>
              <Input
                id="imageUrl"
                placeholder="Cole a URL de uma imagem"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value)
                  if (e.target.value) {
                    setImagePreview(e.target.value)
                    setImageFile(null)
                  }
                }}
              />
              {imagePreview && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Prazo */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={saving}>
              {saving ? "Criando..." : "Criar Sonho"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
