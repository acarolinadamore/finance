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
import {
  Wallet,
  Target,
  Heart,
  ShoppingCart,
  Settings,
  UtensilsCrossed,
  Calendar as CalendarIcon,
  FileText,
  TrendingDown,
  BookOpen,
  CheckSquare,
  Repeat,
  BookMarked,
  GraduationCap,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
        <Card className="h-full transition-all duration-500 hover:scale-[1.02] cursor-pointer group shadow-lg hover:shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="text-center py-5 pb-3">
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md mb-3"
                style={{ backgroundColor: module.color }}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800 mb-1">
                {module.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 line-clamp-2">
                {module.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center px-5 pb-5 pt-2">
            <Button
              className="w-full h-10 text-white hover:opacity-90 transition-all duration-300 rounded-lg text-sm shadow-sm hover:shadow-md"
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
    {
      id: "refeicoes",
      title: "Refeições",
      description: "Acompanhe o que você come e como se sente",
      icon: UtensilsCrossed,
      path: "/meals",
      color: "#ef4444", // Red
    },
    {
      id: "rotina",
      title: "Rotina & Hábitos",
      description: "Organize sua rotina e controle seus hábitos",
      icon: Repeat,
      path: "/rotina",
      color: "#10b981", // Emerald
    },
    {
      id: "calendario",
      title: "Calendário",
      description: "Seus compromissos e eventos organizados",
      icon: CalendarIcon,
      path: "/calendario",
      color: "#3b82f6", // Blue
    },
    {
      id: "documentos",
      title: "Documentos",
      description: "Documentos importantes sempre à mão",
      icon: FileText,
      path: "/documentos",
      color: "#6366f1", // Indigo
    },
    {
      id: "peso",
      title: "Registro de Peso",
      description: "Acompanhe sua evolução de peso e saúde",
      icon: TrendingDown,
      path: "/peso",
      color: "#84cc16", // Lime
    },
    {
      id: "diario",
      title: "Diário",
      description: "Registre seus pensamentos e sentimentos",
      icon: BookOpen,
      path: "/diario",
      color: "#a855f7", // Purple
    },
    {
      id: "leituras",
      title: "Leituras",
      description: "Acompanhe seus livros e progresso de leitura",
      icon: BookMarked,
      path: "/leituras",
      color: "#f59e0b", // Amber
    },
    {
      id: "estudos",
      title: "Estudos",
      description: "Organize seus cursos e materiais de estudo",
      icon: GraduationCap,
      path: "/estudos",
      color: "#06b6d4", // Cyan
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

  const [visibleModules, setVisibleModules] = useState<Record<string, boolean>>(
    () => {
      const savedVisibility = localStorage.getItem("home-modules-visibility")
      if (savedVisibility) {
        try {
          return JSON.parse(savedVisibility)
        } catch {
          return defaultModules.reduce(
            (acc, m) => ({ ...acc, [m.id]: true }),
            {}
          )
        }
      }
      return defaultModules.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
    }
  )

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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

  const handleToggleModuleVisibility = (moduleId: string, visible: boolean) => {
    const newVisibility = { ...visibleModules, [moduleId]: visible }
    setVisibleModules(newVisibility)
    localStorage.setItem(
      "home-modules-visibility",
      JSON.stringify(newVisibility)
    )
  }

  const visibleModulesList = modules.filter((m) => visibleModules[m.id])

  return (
    <div className="min-h-screen bg-background">
      {/* Settings no canto superior direito da tela */}
      <div className="fixed top-4 right-4 z-50">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurações de Módulos</DialogTitle>
              <DialogDescription>
                Selecione quais módulos deseja visualizar na tela principal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {defaultModules.map((module) => {
                const Icon = module.icon
                return (
                  <div
                    key={module.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`module-${module.id}`}
                      checked={visibleModules[module.id]}
                      onCheckedChange={(checked) =>
                        handleToggleModuleVisibility(
                          module.id,
                          checked as boolean
                        )
                      }
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: module.color }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <Label
                        htmlFor={`module-${module.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{module.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <main className="container mx-auto px-4">
        <header className="mb-4 max-w-7xl mx-auto">
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
            items={visibleModulesList.map((m) => m.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {visibleModulesList.map((module) => (
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
