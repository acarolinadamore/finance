import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
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
import { PageHeader } from "@/components/PageHeader"
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
    id: "providencias",
    title: "Providências e Graças",
    description: "Bênçãos e ações de Deus na sua vida",
    icon: Sparkles,
    path: "/catolico/providencias",
    color: "#fbbf24", // Yellow Gold
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
    color: "#f97316", // Orange
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
    icon: Cross,
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
      <Link to={module.path} className="h-full block">
        <Card className="h-full transition-all duration-500 hover:scale-[1.02] cursor-pointer group shadow-lg hover:shadow-xl rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="text-center py-4 flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center h-full gap-1">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md mb-2"
                style={{ backgroundColor: module.color }}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800 mb-0.5">
                {module.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 line-clamp-2 px-2 text-center">
                {module.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center px-5 pb-4 pt-0 mt-auto">
            <Button
              className="w-full h-10 text-white hover:opacity-90 transition-all duration-300 rounded-lg text-sm font-medium shadow-sm hover:shadow-md"
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
      const savedModules = savedIds
        .map((id: string) => defaultModules.find((m) => m.id === id))
        .filter(Boolean)

      // Adicionar novos módulos que não estão no localStorage
      const newModules = defaultModules.filter(
        (m) => !savedIds.includes(m.id)
      )

      return [...savedModules, ...newModules]
    }
    return defaultModules
  })

  const [visibleModules, setVisibleModules] = useState<Record<string, boolean>>(
    () => {
      const saved = localStorage.getItem("catolico-modules-visibility")
      const initial: Record<string, boolean> = {}

      // Inicializar todos os módulos como visíveis
      defaultModules.forEach((m) => {
        initial[m.id] = true
      })

      // Sobrescrever com as configurações salvas, se existirem
      if (saved) {
        const savedVisibility = JSON.parse(saved)
        Object.keys(savedVisibility).forEach((key) => {
          initial[key] = savedVisibility[key]
        })
      }

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
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Católico"
        actions={
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
        }
      />
      <div className="container mx-auto px-4 pt-8 pb-12 max-w-7xl">

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr items-stretch">
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
