import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus, Download } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
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
import { WishlistCard } from "@/components/WishlistCard"
import { useWishlists } from "@/hooks/useWishlists"
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

interface SortableWishlistCardProps {
  wishlist: any
  onDelete: (id: number) => void
  onUpdate: (id: number, name: string) => void
  onToggleCheck: (itemId: number, checked: boolean) => void
  onToggleSelected: (itemId: number, selected: boolean) => void
  onAddItem: (wishlistId: number, item: any) => void
  onUpdateItem: (itemId: number, updates: any) => void
  onDeleteItem: (itemId: number) => void
  onAddPrice: (itemId: number, price: any) => void
  onUpdatePrice: (priceId: number, updates: any) => void
  onTogglePriceSelected: (priceId: number, selected: boolean) => void
  onDeletePrice: (priceId: number) => void
}

const SortableWishlistCard = (props: SortableWishlistCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.wishlist.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <WishlistCard {...props} />
    </div>
  )
}

const Wishlist = () => {
  const {
    wishlists,
    loading,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    addItem,
    updateItem,
    toggleItemCheck,
    toggleItemSelected,
    deleteItem,
    addPrice,
    updatePrice,
    togglePriceSelected,
    deletePrice,
    reorderWishlists,
  } = useWishlists()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [selectedWishlists, setSelectedWishlists] = useState<number[]>([])
  const wishlistsRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = wishlists.findIndex((w) => w.id === active.id)
      const newIndex = wishlists.findIndex((w) => w.id === over.id)

      const newOrder = arrayMove(wishlists, oldIndex, newIndex)
      reorderWishlists(newOrder)
    }
  }

  const handleCreateList = async () => {
    if (newListName.trim()) {
      try {
        console.log("Criando lista:", newListName)
        await createWishlist(newListName)
        setNewListName("")
        setIsDialogOpen(false)
      } catch (err) {
        console.error("Erro ao criar lista:", err)
        alert("Erro ao criar lista. Verifique se o servidor está rodando.")
      }
    }
  }

  const handleToggleWishlistSelection = (wishlistId: number) => {
    setSelectedWishlists((prev) =>
      prev.includes(wishlistId)
        ? prev.filter((id) => id !== wishlistId)
        : [...prev, wishlistId]
    )
  }

  const handleSelectAll = () => {
    if (selectedWishlists.length === wishlists.length) {
      setSelectedWishlists([])
    } else {
      setSelectedWishlists(wishlists.map((w) => w.id))
    }
  }

  const handleDownloadWishlists = async () => {
    if (selectedWishlists.length === 0) {
      alert("Por favor, selecione pelo menos uma lista para baixar")
      return
    }

    if (!wishlistsRef.current) return

    try {
      const canvas = await html2canvas(wishlistsRef.current, {
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
      pdf.save(`wishlist-${date}.pdf`)

      setIsDownloadDialogOpen(false)
      setSelectedWishlists([])
    } catch (error) {
      console.error("Erro ao baixar wishlist:", error)
      alert("Erro ao baixar wishlist")
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
              <h1 className="text-2xl font-semibold">Wishlist</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsDownloadDialogOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Wishlist
              </Button>
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
                    Dê um nome para sua nova lista de desejos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="listName">Nome da Lista</Label>
                    <Input
                      id="listName"
                      placeholder="Ex: Eletrônicos, Casa, Viagem..."
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
        </div>
      </header>

      {/* Dialog de seleção para download */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baixar Wishlist</DialogTitle>
            <DialogDescription>
              Selecione quais listas você deseja incluir no download
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Selecionar:</Label>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedWishlists.length === wishlists.length
                  ? "Desmarcar Todas"
                  : "Todas"}
              </Button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {wishlists.map((wishlist) => (
                <div
                  key={wishlist.id}
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleToggleWishlistSelection(wishlist.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedWishlists.includes(wishlist.id)}
                    onChange={() => handleToggleWishlistSelection(wishlist.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{wishlist.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {wishlist.items?.length || 0} item(ns)
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleDownloadWishlists} className="w-full">
              Baixar Selecionadas ({selectedWishlists.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Container oculto para download - apenas listas selecionadas */}
      <div
        ref={wishlistsRef}
        className="fixed top-[-9999px] left-[-9999px] bg-white p-8"
        style={{ width: "1200px" }}
      >
        <h1 className="text-3xl font-bold mb-6">Minhas Wishlists</h1>
        <div className="space-y-6">
          {wishlists
            .filter((w) => selectedWishlists.includes(w.id))
            .map((wishlist) => (
              <div key={wishlist.id} className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">{wishlist.name}</h2>
                <div className="space-y-2">
                  {wishlist.items?.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.name}</p>
                        {item.prices && item.prices.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {item.prices.map((price: any) => (
                              <div key={price.id} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="font-semibold">
                                  R$ {price.price.toFixed(2).replace('.', ',')}
                                </span>
                                {price.store_name && (
                                  <span>- {price.store_name}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : wishlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem nenhuma lista de desejos
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
              items={wishlists.map((w) => w.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlists.map((wishlist) => (
                  <SortableWishlistCard
                    key={wishlist.id}
                    wishlist={wishlist}
                    onDelete={deleteWishlist}
                    onUpdate={updateWishlist}
                    onToggleCheck={toggleItemCheck}
                    onToggleSelected={toggleItemSelected}
                    onAddItem={addItem}
                    onUpdateItem={updateItem}
                    onDeleteItem={deleteItem}
                    onAddPrice={addPrice}
                    onUpdatePrice={updatePrice}
                    onTogglePriceSelected={togglePriceSelected}
                    onDeletePrice={deletePrice}
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

export default Wishlist
