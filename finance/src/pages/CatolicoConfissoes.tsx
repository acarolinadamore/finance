import { Link } from "react-router-dom"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConfessionsTab from "@/components/catolico/ConfessionsTab"

const CatolicoConfissoes = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/catolico">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Confissões
              </h1>
              <p className="text-muted-foreground mt-1">
                Registro de confissões e exames de consciência
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <ConfessionsTab />
      </div>
    </div>
  )
}

export default CatolicoConfissoes
