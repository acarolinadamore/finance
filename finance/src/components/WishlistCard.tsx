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
import { Plus, MoreVertical, Pencil, Trash2, ExternalLink, Check, X, GripVertical } from "lucide-react"

interface ItemPrice {
  id: number
  item_id: number
  price: number
  link?: string
  store_name?: string
  selected: boolean
  created_at: string
  updated_at: string
}

interface WishlistItem {
  id: number
  wishlist_id: number
  name: string
  price?: number
  link?: string
  checked: boolean
  selected: boolean
  prices: ItemPrice[]
  created_at: string
  updated_at: string
}

interface Wishlist {
  id: number
  name: string
  items: WishlistItem[]
  created_at: string
  updated_at: string
}

interface WishlistCardProps {
  wishlist: Wishlist
  onDelete: (listId: number) => void
  onUpdate: (listId: number, name: string) => void
  onToggleCheck: (itemId: number, checked: boolean) => void
  onToggleSelected: (itemId: number, selected: boolean) => void
  onAddItem: (wishlistId: number, item: { name: string; price?: number; link?: string }) => void
  onUpdateItem: (itemId: number, item: { name: string; price?: number; link?: string }) => void
  onDeleteItem: (itemId: number) => void
  onAddPrice: (itemId: number, price: { price: number; link?: string; store_name?: string }) => void
  onUpdatePrice: (priceId: number, price: { price?: number; link?: string; store_name?: string }) => void
  onTogglePriceSelected: (priceId: number, selected: boolean) => void
  onDeletePrice: (priceId: number) => void
  dragHandleProps?: any
}

export const WishlistCard = ({
  wishlist,
  onDelete,
  onUpdate,
  onToggleCheck,
  onToggleSelected,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddPrice,
  onUpdatePrice,
  onTogglePriceSelected,
  onDeletePrice,
  dragHandleProps,
}: WishlistCardProps) => {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditListOpen, setIsEditListOpen] = useState(false)
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false)
  const [isEditPriceOpen, setIsEditPriceOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [editingPrice, setEditingPrice] = useState<ItemPrice | null>(null)
  const [selectedItemForPrice, setSelectedItemForPrice] = useState<number | null>(null)
  const [listName, setListName] = useState(wishlist.name)
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    link: "",
  })
  const [editItem, setEditItem] = useState({
    name: "",
    price: "",
    link: "",
  })
  const [newPrice, setNewPrice] = useState({
    price: "",
    link: "",
    store_name: "",
  })
  const [editPrice, setEditPrice] = useState({
    price: "",
    link: "",
    store_name: "",
  })

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      onAddItem(wishlist.id, {
        name: newItem.name,
      })
      setNewItem({ name: "", price: "", link: "" })
      setIsAddItemOpen(false)
    }
  }

  const handleEditList = () => {
    if (listName.trim()) {
      onUpdate(wishlist.id, listName)
      setIsEditListOpen(false)
    }
  }

  const handleOpenEditItem = (item: WishlistItem) => {
    setEditingItem(item)
    setEditItem({
      name: item.name,
      price: item.price?.toString() || "",
      link: item.link || "",
    })
    setIsEditItemOpen(true)
  }

  const handleUpdateItem = () => {
    if (editingItem && editItem.name.trim()) {
      onUpdateItem(editingItem.id, {
        name: editItem.name,
      })
      setIsEditItemOpen(false)
      setEditingItem(null)
      setEditItem({ name: "", price: "", link: "" })
    }
  }

  const handleOpenAddPrice = (itemId: number) => {
    setSelectedItemForPrice(itemId)
    setIsAddPriceOpen(true)
  }

  const handleAddPrice = () => {
    if (selectedItemForPrice && newPrice.price) {
      onAddPrice(selectedItemForPrice, {
        price: parseFloat(newPrice.price),
        link: newPrice.link || undefined,
        store_name: newPrice.store_name || undefined,
      })
      setNewPrice({ price: "", link: "", store_name: "" })
      setIsAddPriceOpen(false)
      setSelectedItemForPrice(null)
    }
  }

  const handleOpenEditPrice = (price: ItemPrice) => {
    setEditingPrice(price)
    setEditPrice({
      price: price.price.toString(),
      link: price.link || "",
      store_name: price.store_name || "",
    })
    setIsEditPriceOpen(true)
  }

  const handleUpdatePrice = () => {
    if (editingPrice && editPrice.price) {
      onUpdatePrice(editingPrice.id, {
        price: parseFloat(editPrice.price),
        link: editPrice.link || undefined,
        store_name: editPrice.store_name || undefined,
      })
      setIsEditPriceOpen(false)
      setEditingPrice(null)
      setEditPrice({ price: "", link: "", store_name: "" })
    }
  }

  const calculateTotal = () => {
    return wishlist.items.reduce((sum, item) => {
      // Soma os preços selecionados de cada item
      const itemTotal = (item.prices || [])
        .filter((price) => price.selected)
        .reduce((priceSum, price) => priceSum + Number(price.price), 0)
      return sum + itemTotal
    }, 0)
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
            <CardTitle>{wishlist.name}</CardTitle>
            <CardDescription>
              {wishlist.items.length} {wishlist.items.length === 1 ? "item" : "itens"}
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
                onClick={() => onDelete(wishlist.id)}
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
          {wishlist.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item adicionado
            </p>
          ) : (
            wishlist.items.map((item) => (
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
                      <div className="flex flex-col gap-1 mt-2">
                        {(item.prices || []).map((price) => (
                          <div key={price.id} className="flex items-center gap-2 group/price ml-8">
                            <Checkbox
                              checked={price.selected}
                              onCheckedChange={(checked) => onTogglePriceSelected(price.id, checked as boolean)}
                              title="Incluir no total"
                              className="h-4 w-4 shrink-0"
                            />
                            <p
                              className={`text-base font-bold ${
                                item.checked ? "line-through text-muted-foreground" : "text-primary"
                              }`}
                            >
                              R$ {Number(price.price).toFixed(2)}
                            </p>
                            {price.store_name && (
                              <span className="text-xs text-foreground font-medium">
                                {price.store_name}
                              </span>
                            )}
                            {price.link && (
                              <a
                                href={price.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline transition-colors flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                                Link
                              </a>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-fit h-6 text-xs ml-8"
                          onClick={() => handleOpenAddPrice(item.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar Preço
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
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
                      {(item.prices || []).map((price) => (
                        <div key={price.id} className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-blue-50 text-blue-600"
                            onClick={() => handleOpenEditPrice(price)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-red-50 text-red-400"
                            onClick={() => onDeletePrice(price.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
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
                  Adicione um novo item à lista "{wishlist.name}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Nome do Item *</Label>
                  <Input
                    id="itemName"
                    placeholder="Ex: iPhone 15 Pro, Impressora..."
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
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
              Altere o nome da sua lista de desejos
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

      {/* Dialog para adicionar preço */}
      <Dialog open={isAddPriceOpen} onOpenChange={setIsAddPriceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Preço</DialogTitle>
            <DialogDescription>
              Adicione um preço alternativo para comparação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="priceValue">Preço (R$) *</Label>
              <Input
                id="priceValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newPrice.price}
                onChange={(e) =>
                  setNewPrice({ ...newPrice, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceStoreName">Loja - Opcional</Label>
              <Input
                id="priceStoreName"
                placeholder="Ex: Mercado Livre, Shopee..."
                value={newPrice.store_name}
                onChange={(e) =>
                  setNewPrice({ ...newPrice, store_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceLink">Link - Opcional</Label>
              <Input
                id="priceLink"
                type="url"
                placeholder="https://..."
                value={newPrice.link}
                onChange={(e) =>
                  setNewPrice({ ...newPrice, link: e.target.value })
                }
              />
            </div>
            <Button onClick={handleAddPrice} className="w-full">
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar preço */}
      <Dialog open={isEditPriceOpen} onOpenChange={setIsEditPriceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Preço</DialogTitle>
            <DialogDescription>
              Altere as informações do preço
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editPriceValue">Preço (R$) *</Label>
              <Input
                id="editPriceValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={editPrice.price}
                onChange={(e) =>
                  setEditPrice({ ...editPrice, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPriceStoreName">Loja - Opcional</Label>
              <Input
                id="editPriceStoreName"
                placeholder="Ex: Mercado Livre, Shopee..."
                value={editPrice.store_name}
                onChange={(e) =>
                  setEditPrice({ ...editPrice, store_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPriceLink">Link - Opcional</Label>
              <Input
                id="editPriceLink"
                type="url"
                placeholder="https://..."
                value={editPrice.link}
                onChange={(e) =>
                  setEditPrice({ ...editPrice, link: e.target.value })
                }
              />
            </div>
            <Button onClick={handleUpdatePrice} className="w-full">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
