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
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"

interface ShoppingListItem {
  id: number
  list_id: number
  name: string
  price?: number
  checked: boolean
  selected: boolean
  created_at: string
  updated_at: string
}

interface ShoppingList {
  id: number
  name: string
  items: ShoppingListItem[]
  created_at: string
  updated_at: string
}

interface ShoppingListCardProps {
  list: ShoppingList
  onDelete: (listId: number) => void
  onUpdate: (listId: number, name: string) => void
  onToggleCheck: (itemId: number, checked: boolean) => void
  onToggleSelected: (itemId: number, selected: boolean) => void
  onAddItem: (listId: number, item: { name: string; price?: number }) => void
  onUpdateItem: (itemId: number, item: { name: string; price?: number }) => void
  onDeleteItem: (itemId: number) => void
}

export const ShoppingListCard = ({
  list,
  onDelete,
  onUpdate,
  onToggleCheck,
  onToggleSelected,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: ShoppingListCardProps) => {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditListOpen, setIsEditListOpen] = useState(false)
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null)
  const [listName, setListName] = useState(list.name)
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
  })
  const [editItem, setEditItem] = useState({
    name: "",
    price: "",
  })

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      onAddItem(list.id, {
        name: newItem.name,
        price: newItem.price ? parseFloat(newItem.price) : undefined,
      })
      setNewItem({ name: "", price: "" })
      setIsAddItemOpen(false)
    }
  }

  const handleEditList = () => {
    if (listName.trim()) {
      onUpdate(list.id, listName)
      setIsEditListOpen(false)
    }
  }

  const handleOpenEditItem = (item: ShoppingListItem) => {
    setEditingItem(item)
    setEditItem({
      name: item.name,
      price: item.price?.toString() || "",
    })
    setIsEditItemOpen(true)
  }

  const handleUpdateItem = () => {
    if (editingItem && editItem.name.trim()) {
      onUpdateItem(editingItem.id, {
        name: editItem.name,
        price: editItem.price ? parseFloat(editItem.price) : undefined,
      })
      setIsEditItemOpen(false)
      setEditingItem(null)
      setEditItem({ name: "", price: "" })
    }
  }

  const calculateTotal = () => {
    return list.items
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + (Number(item.price) || 0), 0)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
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
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={(checked) => onToggleCheck(item.id, checked as boolean)}
                          title="Marcar como comprado"
                          className="h-6 w-6 rounded-sm data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 [&_svg]:h-4 [&_svg]:w-4 shrink-0"
                        />
                        <p
                          className={`text-sm font-medium ${
                            item.checked ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {item.name}
                        </p>
                      </div>
                      {item.price !== undefined && item.price !== null && (
                        <div className="flex items-center gap-2 ml-8 mt-1">
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={(checked) => onToggleSelected(item.id, checked as boolean)}
                            title="Incluir no total"
                            className="h-4 w-4 shrink-0"
                          />
                          <p
                            className={`text-base font-bold ${
                              item.checked ? "line-through text-muted-foreground" : "text-primary"
                            }`}
                          >
                            R$ {Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      )}
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
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Total Selecionado:</span>
            <span className="text-lg font-bold text-primary">
              R$ {calculateTotal().toFixed(2)}
            </span>
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
                <DialogTitle>Adicionar Item</DialogTitle>
                <DialogDescription>
                  Adicione um novo item à lista "{list.name}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Nome do Item *</Label>
                  <Input
                    id="itemName"
                    placeholder="Ex: Arroz, Feijão, Maçã..."
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        const priceInput = document.getElementById("itemPrice")
                        if (priceInput) {
                          priceInput.focus()
                        }
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemPrice">Preço (R$) - Opcional</Label>
                  <Input
                    id="itemPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
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
        </div>
      </CardContent>

      {/* Dialog para editar nome da lista */}
      <Dialog open={isEditListOpen} onOpenChange={setIsEditListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nome da Lista</DialogTitle>
            <DialogDescription>
              Altere o nome da sua lista de mercado
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
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Altere as informações do item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editItemName">Nome do Item *</Label>
              <Input
                id="editItemName"
                value={editItem.name}
                onChange={(e) =>
                  setEditItem({ ...editItem, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemPrice">Preço (R$) - Opcional</Label>
              <Input
                id="editItemPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={editItem.price}
                onChange={(e) =>
                  setEditItem({ ...editItem, price: e.target.value })
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
