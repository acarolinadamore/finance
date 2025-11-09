import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Target, Heart, ShoppingCart } from "lucide-react"
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

interface Module {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  color: string
}

interface SortableModuleCardProps {
  module: Module
}

const SortableModuleCard = ({ module }: SortableModuleCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = module.icon

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link to={module.path}>
        <Card className="h-full transition-all duration-500 hover:scale-[1.02] cursor-pointer group shadow-xl hover:shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center py-8 pb-2">
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-4"
                style={{ backgroundColor: module.color }}
              >
                <Icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-800 mb-2">
                {module.title}
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                {module.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center px-6 pb-8 pt-2">
            <Button
              className="w-full h-14 text-white hover:opacity-90 transition-all duration-300 rounded-xl text-1xl shadow-md hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${module.color}, ${module.color}dd)`,
              }}
            >
              Acessar
            </Button>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

const Home = () => {
  // Configuração do degradê do background (altere os valores hexadecimais)
  const bgGradientTop = "#0956C7" // Cor de cima
  const bgGradientBottom = "#12398D" // Cor de baixo

  // Lista de imagens de fundo (adicione os nomes das suas imagens aqui)
  const backgroundImages = [
    "/backgrounds/5567325.jpg",
    "/backgrounds/5567336.jpg",
    "/backgrounds/85254.jpg",
    "/backgrounds/mar.jpg",
  ]

  // Estado para controlar qual imagem está sendo exibida
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Alterna a imagem a cada 20 minutos (1200000 milissegundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      )
    }, 1200000) // 20 minutos = 20 * 60 * 1000 = 1200000ms

    return () => clearInterval(interval) // Limpa o intervalo quando o componente é desmontado
  }, [backgroundImages.length])

  const backgroundImage = backgroundImages[currentImageIndex]

  const defaultModules: Module[] = [
    {
      id: "finance",
      title: "Financeiro",
      description: "Suas finanças organizadas e sob controle",
      icon: Wallet,
      path: "/finance",
      color: "#0ea5e9", // Sky
    },
    {
      id: "metas",
      title: "Sonhos & Metas",
      description: "Seus objetivos acompanhados de perto",
      icon: Target,
      path: "/metas",
      color: "#8b5cf6", // Violet
    },
    {
      id: "wishlist",
      title: "Wishlist",
      description: "Seus desejos planejados com inteligência",
      icon: Heart,
      path: "/wishlist",
      color: "#ec4899", // Pink
    },
    {
      id: "lista-mercado",
      title: "Lista Mercado",
      description: "Suas compras planejadas e econômicas",
      icon: ShoppingCart,
      path: "/lista-mercado",
      color: "#14b8a6", // Teal
    },
  ]

  const [modules, setModules] = useState<Module[]>(() => {
    const savedOrder = localStorage.getItem("home-modules-order")
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder)
        return orderIds
          .map((id: string) => defaultModules.find((m) => m.id === id))
          .filter(Boolean)
      } catch {
        return defaultModules
      }
    }
    return defaultModules
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((m) => m.id === active.id)
        const newIndex = items.findIndex((m) => m.id === over.id)

        const newOrder = arrayMove(items, oldIndex, newIndex)
        localStorage.setItem(
          "home-modules-order",
          JSON.stringify(newOrder.map((m) => m.id))
        )
        return newOrder
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-2">
        <header className="mb-4 max-w-4xl mx-auto">
          <div className="px-6 py-6">
            <div className="text-center">
              <h1
                className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent relative z-10 py-2"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Simplifica
              </h1>
              <p className="text-muted-foreground text-base mt-2 relative z-0">
                Sua vida organizada em um só lugar.
              </p>
            </div>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {modules.map((module) => (
                <SortableModuleCard key={module.id} module={module} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>
    </div>
  )
}

export default Home
