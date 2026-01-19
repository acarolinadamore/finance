import { useState, useEffect } from "react"
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

interface DocumentCategory {
  id: number
  name: string
  description?: string
  icon: string
  color: string
  display_order: number
}

interface Document {
  id: number
  category_id?: number
  name: string
  description?: string
  file_name: string
  tags?: string[]
}

interface EditDocumentDialogProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: DocumentCategory[]
  onUpdate: (
    id: number,
    updates: {
      category_id?: number
      name?: string
      description?: string
      tags?: string[]
    }
  ) => Promise<void>
}

export const EditDocumentDialog = ({
  document,
  open,
  onOpenChange,
  categories,
  onUpdate,
}: EditDocumentDialogProps) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [tags, setTags] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (document && open) {
      setName(document.name)
      setDescription(document.description || "")
      setCategoryId(document.category_id ? document.category_id.toString() : "none")
      setTags(document.tags ? document.tags.join(", ") : "")
    }
  }, [document, open])

  const handleSave = async () => {
    if (!document) return

    if (!name.trim()) {
      alert("Por favor, insira um nome para o documento")
      return
    }

    try {
      setSaving(true)

      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      await onUpdate(document.id, {
        name,
        description: description || undefined,
        category_id: categoryId && categoryId !== "none" ? parseInt(categoryId) : undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao atualizar documento:", error)
      alert("Erro ao atualizar documento. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
          <DialogDescription>
            Altere o nome, categoria, descrição e tags do documento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome do arquivo original (apenas visualização) */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              Arquivo original
            </Label>
            <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border">
              {document?.file_name}
            </p>
          </div>

          {/* Nome do documento */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do Documento *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: CNH, RG, Certidão de Nascimento"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
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

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informações adicionais sobre o documento..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
            <Input
              id="edit-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: identidade, filho, pessoal"
            />
            <p className="text-xs text-muted-foreground">
              Use tags para facilitar a busca posterior
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
