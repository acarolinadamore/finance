import { Link } from "react-router-dom"
import { ArrowLeft, Stethoscope, Pill, Calendar, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Saude = () => {
  const sections = [
    {
      id: "consultas",
      title: "Consultas",
      description: "Gerencie suas consultas médicas e odontológicas",
      icon: Calendar,
      path: "/saude/consultas",
      color: "#3b82f6", // Blue
      disabled: false,
    },
    {
      id: "receitas",
      title: "Receitas",
      description: "Registre suas receitas médicas",
      icon: Pill,
      path: "/saude/receitas",
      color: "#10b981", // Green
      disabled: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Stethoscope className="h-10 w-10 text-green-600" />
              Saúde
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas consultas e receitas médicas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon

            if (section.disabled) {
              return (
                <div key={section.id} className="opacity-60 cursor-not-allowed">
                  <Card className="h-full transition-all duration-500 rounded-xl overflow-hidden shadow-lg">
                    <CardHeader className="text-center py-5 pb-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md mb-3 relative"
                          style={{ backgroundColor: section.color }}
                        >
                          <Icon className="h-7 w-7 text-white" />
                          <Construction className="h-4 w-4 text-orange-500 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-800 mb-1">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 line-clamp-2">
                          {section.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex justify-center px-5 pb-5 pt-2">
                      <Button
                        disabled
                        className="w-full h-10 text-white rounded-lg text-sm shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${section.color}, ${section.color}dd)`,
                        }}
                      >
                        Em Breve
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )
            }

            return (
              <Link key={section.id} to={section.path}>
                <Card className="h-full transition-all duration-500 hover:scale-[1.02] cursor-pointer group shadow-lg hover:shadow-xl rounded-xl overflow-hidden">
                  <CardHeader className="text-center py-5 pb-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md mb-3"
                        style={{ backgroundColor: section.color }}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-800 mb-1">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {section.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-center px-5 pb-5 pt-2">
                    <Button
                      className="w-full h-10 text-white hover:opacity-90 transition-all duration-300 rounded-lg text-sm shadow-sm hover:shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${section.color}, ${section.color}dd)`,
                      }}
                    >
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Saude
