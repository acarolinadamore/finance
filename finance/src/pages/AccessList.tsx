import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AccessListCard } from "@/components/AccessListCard"
import { useAccessLists } from "@/hooks/useAccessLists"
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableAccessListCardProps {
  list: any
  onDelete: (id: number) => void
  onUpdate: (id: number, name: string) => void
  onAddItem: (listId: number, item: any) => void
  onUpdateItem: (itemId: number, updates: any) => void
  onDeleteItem: (itemId: number) => void
}

const SortableAccessListCard = (props: SortableAccessListCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.list.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <AccessListCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

const AccessList = () => {
  const {
    lists,
    loading,
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
    reorderLists,
  } = useAccessLists()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = lists.findIndex((l) => l.id === active.id)
      const newIndex = lists.findIndex((l) => l.id === over.id)

      const newOrder = arrayMove(lists, oldIndex, newIndex)
      reorderLists(newOrder)
    }
  }

  const handleCreateList = async () => {
    if (newListName.trim()) {
      try {
        await createList(newListName)
        setNewListName("")
        setIsDialogOpen(false)
      } catch (err) {
        console.error("Erro ao criar lista:", err)
        alert("Erro ao criar lista. Verifique se o servidor está rodando.")
      }
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
              <h1 className="text-2xl font-semibold">Acessos</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Lista
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Lista</DialogTitle>
                  <DialogDescription>
                    Dê um nome para sua nova lista de acessos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="listName">Nome da Lista</Label>
                    <Input
                      id="listName"
                      placeholder="Ex: Redes Sociais, Trabalho, Pessoal..."
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateList()
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleCreateList} className="w-full">
                    Criar Lista
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem nenhuma lista de acessos
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Lista
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lists.map((l) => l.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map((list) => (
                  <SortableAccessListCard
                    key={list.id}
                    list={list}
                    onDelete={deleteList}
                    onUpdate={updateList}
                    onAddItem={addItem}
                    onUpdateItem={updateItem}
                    onDeleteItem={deleteItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  )
}

export default AccessList
