import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  BookOpen,
  Cross,
  FileText,
  Heart,
  Sparkles,
  Users,
  BookMarked,
  Quote,
  HelpCircle,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface CatholicModule {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  color: string
}

const defaultModules: CatholicModule[] = [
  {
    id: "oracoes",
    title: "Orações",
    description: "Suas orações diárias",
    icon: Heart,
    path: "/catolico/oracoes",
    color: "#ec4899", // Pink
  },
  {
    id: "versiculos",
    title: "Versículos",
    description: "Seus versículos bíblicos favoritos",
    icon: Quote,
    path: "/catolico/versiculos",
    color: "#3b82f6", // Blue
  },
  {
    id: "duvidas",
    title: "Dúvidas",
    description: "Dúvidas para levar ao padre",
    icon: HelpCircle,
    path: "/catolico/duvidas",
    color: "#f59e0b", // Amber
  },
  {
    id: "leituras",
    title: "Leituras",
    description: "Leituras espirituais e reflexões",
    icon: BookOpen,
    path: "/catolico/leituras",
    color: "#8b5cf6", // Violet
  },
  {
    id: "confissoes",
    title: "Confissões",
    description: "Registro de confissões e exames de consciência",
    icon: FileText,
    path: "/catolico/confissoes",
    color: "#6366f1", // Indigo
  },
  {
    id: "lectio-divina",
    title: "Lectio Divina",
    description: "Meditação orante da Palavra de Deus",
    icon: BookMarked,
    path: "/catolico/lectio-divina",
    color: "#7c3aed", // Purple
  },
  {
    id: "terco",
    title: "Terço",
    description: "Registro e meditação do Santo Terço",
    icon: Sparkles,
    path: "/catolico/terco",
    color: "#0ea5e9", // Sky
  },
  {
    id: "coral",
    title: "Coral",
    description: "Músicas e cânticos litúrgicos",
    icon: Users,
    path: "/catolico/coral",
    color: "#14b8a6", // Teal
  },
]

interface SortableModuleCardProps {
  module: CatholicModule
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

const Catolico = () => {
  const [modules, setModules] = useState<CatholicModule[]>(() => {
    const saved = localStorage.getItem("catolico-modules-order")
    if (saved) {
      const savedIds = JSON.parse(saved)
      return savedIds
        .map((id: string) => defaultModules.find((m) => m.id === id))
        .filter(Boolean)
    }
    return defaultModules
  })

  const [visibleModules, setVisibleModules] = useState<Record<string, boolean>>(
    () => {
      const saved = localStorage.getItem("catolico-modules-visibility")
      if (saved) {
        return JSON.parse(saved)
      }
      const initial: Record<string, boolean> = {}
      defaultModules.forEach((m) => {
        initial[m.id] = true
      })
      return initial
    }
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    localStorage.setItem(
      "catolico-modules-order",
      JSON.stringify(modules.map((m) => m.id))
    )
  }, [modules])

  useEffect(() => {
    localStorage.setItem(
      "catolico-modules-visibility",
      JSON.stringify(visibleModules)
    )
  }, [visibleModules])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id)
      const newIndex = modules.findIndex((m) => m.id === over.id)

      setModules(arrayMove(modules, oldIndex, newIndex))
    }
  }

  const toggleModuleVisibility = (moduleId: string) => {
    setVisibleModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  const visibleCount = Object.values(visibleModules).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Católico</h1>
              <p className="text-muted-foreground mt-1">
                Sua jornada espiritual organizada
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  Módulos Visíveis ({visibleCount}/{modules.length})
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {modules.map((module) => (
                  <DropdownMenuCheckboxItem
                    key={module.id}
                    checked={visibleModules[module.id]}
                    onCheckedChange={() => toggleModuleVisibility(module.id)}
                  >
                    <div className="flex items-center gap-2">
                      {visibleModules[module.id] ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                      {module.title}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cards dos Módulos */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules
                .filter((m) => visibleModules[m.id])
                .map((module) => (
                  <SortableModuleCard key={module.id} module={module} />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

export default Catolico
