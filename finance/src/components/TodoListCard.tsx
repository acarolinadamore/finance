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
import { Plus, MoreVertical, Pencil, Trash2, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TodoListItem {
  id: number
  list_id: number
  name: string
  checked: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface TodoList {
  id: number
  name: string
  items: TodoListItem[]
  created_at: string
  updated_at: string
}

interface TodoListCardProps {
  list: TodoList
  onDelete: (listId: number) => void
  onUpdate: (listId: number, name: string) => void
  onToggleCheck: (itemId: number, checked: boolean) => void
  onAddItem: (listId: number, item: { name: string }) => void
  onUpdateItem: (itemId: number, item: { name: string }) => void
  onDeleteItem: (itemId: number) => void
  onReorderItems: (listId: number, newOrder: TodoListItem[]) => void
  dragHandleProps?: any
}

interface SortableTodoItemProps {
  item: TodoListItem
  onToggleCheck: (itemId: number, checked: boolean) => void
  onEdit: (item: TodoListItem) => void
  onDelete: (itemId: number) => void
}

const SortableTodoItem = ({
  item,
  onToggleCheck,
  onEdit,
  onDelete,
}: SortableTodoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 pt-1.5"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 flex items-center gap-2">
            <Checkbox
              checked={item.checked}
              onCheckedChange={(checked) => onToggleCheck(item.id, checked as boolean)}
              title="Marcar como concluído"
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
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-blue-50 text-blue-600"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-red-50 text-red-400"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const TodoListCard = ({
  list,
  onDelete,
  onUpdate,
  onToggleCheck,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItems,
  dragHandleProps,
}: TodoListCardProps) => {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditListOpen, setIsEditListOpen] = useState(false)
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TodoListItem | null>(null)
  const [listName, setListName] = useState(list.name)
  const [newItemName, setNewItemName] = useState("")
  const [editItemName, setEditItemName] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = list.items.findIndex((item) => item.id === active.id)
      const newIndex = list.items.findIndex((item) => item.id === over.id)

      const newOrder = arrayMove(list.items, oldIndex, newIndex)
      onReorderItems(list.id, newOrder)
    }
  }

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem(list.id, { name: newItemName })
      setNewItemName("")
      setIsAddItemOpen(false)
    }
  }

  const handleEditList = () => {
    if (listName.trim()) {
      onUpdate(list.id, listName)
      setIsEditListOpen(false)
    }
  }

  const handleOpenEditItem = (item: TodoListItem) => {
    setEditingItem(item)
    setEditItemName(item.name)
    setIsEditItemOpen(true)
  }

  const handleUpdateItem = () => {
    if (editingItem && editItemName.trim()) {
      onUpdateItem(editingItem.id, { name: editItemName })
      setIsEditItemOpen(false)
      setEditingItem(null)
      setEditItemName("")
    }
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={list.items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {list.items.map((item) => (
                  <SortableTodoItem
                    key={item.id}
                    item={item}
                    onToggleCheck={onToggleCheck}
                    onEdit={handleOpenEditItem}
                    onDelete={onDeleteItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="border-t pt-4">
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
                    placeholder="Ex: Comprar leite, Ligar para João..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
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
              Altere o nome da sua lista de tarefas
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
              Altere o nome do item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editItemName">Nome do Item *</Label>
              <Input
                id="editItemName"
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
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
