import { Link } from "react-router-dom"
import { ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const CatolicoCoral = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/catolico">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Coral
              </h1>
              <p className="text-muted-foreground mt-1">
                Músicas e cânticos litúrgicos
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-teal-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Em Construção
            </h2>
            <p className="text-muted-foreground">
              Este módulo está sendo preparado. Em breve você poderá organizar músicas e cânticos litúrgicos.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CatolicoCoral
