import { Link } from "react-router-dom"
import { ArrowLeft, BookMarked } from "lucide-react"
import { Button } from "@/components/ui/button"
import LectioDivinaSection from "@/components/catolico/LectioDivinaSection"

const CatolicoLectioDivina = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/catolico">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <BookMarked className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Lectio Divina
              </h1>
              <p className="text-muted-foreground mt-1">
                Meditação orante da Palavra de Deus
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <LectioDivinaSection />
      </div>
    </div>
  )
}

export default CatolicoLectioDivina
