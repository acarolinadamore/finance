import { Link } from "react-router-dom"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import VersesSection from "@/components/catolico/VersesSection"

const CatolicoVersiculos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/catolico">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Versículos
              </h1>
              <p className="text-muted-foreground mt-1">
                Seus versículos bíblicos favoritos
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <VersesSection />
      </div>
    </div>
  )
}

export default CatolicoVersiculos
