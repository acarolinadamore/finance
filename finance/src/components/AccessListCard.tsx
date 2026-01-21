import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Pencil, Trash2, GripVertical, ExternalLink, Eye, EyeOff, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AccessListItem {
  id: number
  list_id: number
  title: string
  url?: string
  username?: string
  password?: string
  created_at: string
  updated_at: string
}

interface AccessList {
  id: number
  name: string
  items: AccessListItem[]
  created_at: string
  updated_at: string
}

interface AccessListCardProps {
  list: AccessList
  onDelete: (listId: number) => void
  onUpdate: (listId: number, name: string) => void
  onAddItem: (listId: number, item: { title: string; url?: string; username?: string; password?: string }) => void
  onUpdateItem: (itemId: number, item: { title?: string; url?: string; username?: string; password?: string }) => void
  onDeleteItem: (itemId: number) => void
  dragHandleProps?: any
}

export const AccessListCard = ({
  list,
  onDelete,
  onUpdate,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  dragHandleProps,
}: AccessListCardProps) => {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditListOpen, setIsEditListOpen] = useState(false)
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AccessListItem | null>(null)
  const [listName, setListName] = useState(list.name)
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({})
  const [newItem, setNewItem] = useState({
    title: "",
    url: "",
    username: "",
    password: "",
  })
  const [editItem, setEditItem] = useState({
    title: "",
    url: "",
    username: "",
    password: "",
  })

  const handleAddItem = () => {
    if (newItem.title.trim()) {
      onAddItem(list.id, {
        title: newItem.title,
        url: newItem.url || undefined,
        username: newItem.username || undefined,
        password: newItem.password || undefined,
      })
      setNewItem({ title: "", url: "", username: "", password: "" })
      setIsAddItemOpen(false)
    }
  }

  const handleEditList = () => {
    if (listName.trim()) {
      onUpdate(list.id, listName)
      setIsEditListOpen(false)
    }
  }

  const handleOpenEditItem = (item: AccessListItem) => {
    setEditingItem(item)
    setEditItem({
      title: item.title,
      url: item.url || "",
      username: item.username || "",
      password: item.password || "",
    })
    setIsEditItemOpen(true)
  }

  const handleUpdateItem = () => {
    if (editingItem && editItem.title.trim()) {
      onUpdateItem(editingItem.id, {
        title: editItem.title,
        url: editItem.url || undefined,
        username: editItem.username || undefined,
        password: editItem.password || undefined,
      })
      setIsEditItemOpen(false)
      setEditingItem(null)
      setEditItem({ title: "", url: "", username: "", password: "" })
    }
  }

  const togglePasswordVisibility = (itemId: number) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: `${field} copiado para a área de transferência`,
      duration: 2000,
    })
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 pt-1"
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle>{list.name}</CardTitle>
            <CardDescription>
              {list.items.length} {list.items.length === 1 ? "item" : "itens"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditListOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar Nome
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(list.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Lista
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-2 mb-4">
          {list.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item adicionado
            </p>
          ) : (
            list.items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary">{item.title}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-blue-50 text-blue-600"
                      onClick={() => handleOpenEditItem(item)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-red-50 text-red-400"
                      onClick={() => onDeleteItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  {item.url && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-[60px]">URL:</span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 flex-1 min-w-0 truncate"
                      >
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyToClipboard(item.url!, "URL")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {item.username && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-[60px]">Login:</span>
                      <span className="flex-1 font-mono">{item.username}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyToClipboard(item.username!, "Login")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {item.password && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-[60px]">Senha:</span>
                      <span className="flex-1 font-mono">
                        {visiblePasswords[item.id] ? item.password : "••••••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => togglePasswordVisibility(item.id)}
                      >
                        {visiblePasswords[item.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyToClipboard(item.password!, "Senha")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Acesso</DialogTitle>
              <DialogDescription>
                Adicione um novo acesso à lista "{list.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemTitle">Título *</Label>
                <Input
                  id="itemTitle"
                  placeholder="Ex: Gmail, Netflix, GitHub..."
                  value={newItem.title}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemUrl">URL</Label>
                <Input
                  id="itemUrl"
                  type="url"
                  placeholder="https://exemplo.com"
                  value={newItem.url}
                  onChange={(e) =>
                    setNewItem({ ...newItem, url: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemUsername">Login/Usuário</Label>
                <Input
                  id="itemUsername"
                  placeholder="usuario@exemplo.com"
                  value={newItem.username}
                  onChange={(e) =>
                    setNewItem({ ...newItem, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemPassword">Senha</Label>
                <Input
                  id="itemPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newItem.password}
                  onChange={(e) =>
                    setNewItem({ ...newItem, password: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddItem()
                    }
                  }}
                />
              </div>
              <Button onClick={handleAddItem} className="w-full">
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>

      {/* Dialog para editar nome da lista */}
      <Dialog open={isEditListOpen} onOpenChange={setIsEditListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nome da Lista</DialogTitle>
            <DialogDescription>
              Altere o nome da sua lista de acessos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editListName">Nome da Lista</Label>
              <Input
                id="editListName"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditList()
                  }
                }}
              />
            </div>
            <Button onClick={handleEditList} className="w-full">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar item */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Acesso</DialogTitle>
            <DialogDescription>
              Altere as informações do acesso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editItemTitle">Título *</Label>
              <Input
                id="editItemTitle"
                value={editItem.title}
                onChange={(e) =>
                  setEditItem({ ...editItem, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemUrl">URL</Label>
              <Input
                id="editItemUrl"
                type="url"
                placeholder="https://exemplo.com"
                value={editItem.url}
                onChange={(e) =>
                  setEditItem({ ...editItem, url: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemUsername">Login/Usuário</Label>
              <Input
                id="editItemUsername"
                placeholder="usuario@exemplo.com"
                value={editItem.username}
                onChange={(e) =>
                  setEditItem({ ...editItem, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemPassword">Senha</Label>
              <Input
                id="editItemPassword"
                type="password"
                placeholder="••••••••"
                value={editItem.password}
                onChange={(e) =>
                  setEditItem({ ...editItem, password: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateItem()
                  }
                }}
              />
            </div>
            <Button onClick={handleUpdateItem} className="w-full">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
