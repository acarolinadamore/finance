import { useState, useEffect } from "react"
import { Sparkles, Save, Heart, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"

interface RosaryContent {
  id?: number
  tipo: 'oferecimento' | 'gloriosos' | 'gozosos' | 'dolorosos' | 'oracoes_finais'
  conteudo: string
  updated_at?: string
}

const TercoContent = () => {
  const { toast } = useToast()

  // Estados para cada seção
  const [oferecimento, setOferecimento] = useState("")
  const [gloriosos, setGloriosos] = useState("")
  const [gozosos, setGozosos] = useState("")
  const [dolorosos, setDolorosos] = useState("")
  const [oracoesFinais, setOracoesFinais] = useState("")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Estados para controlar visibilidade dos mistérios
  const [visibleMisteries, setVisibleMisteries] = useState(() => {
    const saved = localStorage.getItem('rosary-misteries-visibility')
    return saved ? JSON.parse(saved) : { gloriosos: true, gozosos: true, dolorosos: true }
  })

  useEffect(() => {
    loadAllContent()
  }, [])

  // Salvar visibilidade no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('rosary-misteries-visibility', JSON.stringify(visibleMisteries))
  }, [visibleMisteries])

  const toggleMisteryVisibility = (mistery: 'gloriosos' | 'gozosos' | 'dolorosos') => {
    setVisibleMisteries(prev => ({
      ...prev,
      [mistery]: !prev[mistery]
    }))
  }

  const loadAllContent = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<RosaryContent[]>("/api/catolico/rosary")

      response.data.forEach((item) => {
        if (item.tipo === 'oferecimento') setOferecimento(item.conteudo || "")
        if (item.tipo === 'gloriosos') setGloriosos(item.conteudo || "")
        if (item.tipo === 'gozosos') setGozosos(item.conteudo || "")
        if (item.tipo === 'dolorosos') setDolorosos(item.conteudo || "")
        if (item.tipo === 'oracoes_finais') setOracoesFinais(item.conteudo || "")
      })
    } catch (error) {
      console.error("Erro ao carregar conteúdo do terço:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async (tipo: 'oferecimento' | 'gloriosos' | 'gozosos' | 'dolorosos' | 'oracoes_finais', conteudo: string) => {
    try {
      setIsSaving(true)
      await api.post("/api/catolico/rosary", { tipo, conteudo })
      toast({
        title: "Salvo com sucesso",
        description: "Conteúdo atualizado",
      })
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o conteúdo",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Instrução inicial */}
      <div className="space-y-1">
        <p className="font-semibold text-gray-800 text-lg">1. Fazer o Sinal da Cruz</p>
        <p className="text-gray-700" style={{ fontFamily: 'Lora, serif' }}>
          Em nome do Pai, (+) do Filho e do Espírito Santo. Amém.
        </p>
      </div>

      {/* Oferecimento do Terço */}
      <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-pink-800 text-xl">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-white" />
            </div>
            Oferecimento do Terço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={oferecimento}
            onChange={(e) => setOferecimento(e.target.value)}
            className="min-h-[300px] resize-y text-base leading-relaxed"
            style={{ fontFamily: 'Lora, serif' }}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => saveContent('oferecimento', oferecimento)}
              disabled={isSaving}
              size="sm"
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Save className="h-3 w-3 mr-2" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid dos Mistérios */}
      <div className={`grid grid-cols-1 gap-6 ${
        // Calcular quantos mistérios estão visíveis e ajustar grid
        (() => {
          const visibleCount = [visibleMisteries.gozosos, visibleMisteries.dolorosos, visibleMisteries.gloriosos].filter(Boolean).length
          if (visibleCount === 3) return 'lg:grid-cols-3'
          if (visibleCount === 2) return 'lg:grid-cols-2'
          return 'lg:grid-cols-1'
        })()
      }`}>
        {/* Mistérios Gozosos */}
        {visibleMisteries.gozosos && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-normal text-blue-600 mb-1">
                    Segundas e Quintas
                  </div>
                  <div>Mistérios Gozosos</div>
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMisteryVisibility('gozosos')}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                title="Ocultar"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col">
            <Textarea
              value={gozosos}
              onChange={(e) => setGozosos(e.target.value)}
              className="min-h-[600px] resize-y text-base leading-relaxed flex-1"
              style={{ fontFamily: 'Lora, serif' }}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => saveContent('gozosos', gozosos)}
                disabled={isSaving}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-3 w-3 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Mistérios Dolorosos */}
        {visibleMisteries.dolorosos && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-800 text-lg">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-normal text-purple-600 mb-1">
                    Terças e Sextas
                  </div>
                  <div>Mistérios Dolorosos</div>
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMisteryVisibility('dolorosos')}
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                title="Ocultar"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col">
            <Textarea
              value={dolorosos}
              onChange={(e) => setDolorosos(e.target.value)}
              className="min-h-[600px] resize-y text-base leading-relaxed flex-1"
              style={{ fontFamily: 'Lora, serif' }}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => saveContent('dolorosos', dolorosos)}
                disabled={isSaving}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="h-3 w-3 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Mistérios Gloriosos */}
        {visibleMisteries.gloriosos && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-yellow-800 text-lg">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-normal text-yellow-600 mb-1">
                    Quartas, Sábados e Domingos
                  </div>
                  <div>Mistérios Gloriosos</div>
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMisteryVisibility('gloriosos')}
                className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
                title="Ocultar"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col">
            <Textarea
              value={gloriosos}
              onChange={(e) => setGloriosos(e.target.value)}
              className="min-h-[600px] resize-y text-base leading-relaxed flex-1"
              style={{ fontFamily: 'Lora, serif' }}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => saveContent('gloriosos', gloriosos)}
                disabled={isSaving}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Save className="h-3 w-3 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Botões para mostrar mistérios ocultos */}
      {(!visibleMisteries.gozosos || !visibleMisteries.dolorosos || !visibleMisteries.gloriosos) && (
        <div className="flex gap-3 justify-center flex-wrap">
          {!visibleMisteries.gozosos && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleMisteryVisibility('gozosos')}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Mostrar Mistérios Gozosos
            </Button>
          )}
          {!visibleMisteries.dolorosos && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleMisteryVisibility('dolorosos')}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Mostrar Mistérios Dolorosos
            </Button>
          )}
          {!visibleMisteries.gloriosos && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleMisteryVisibility('gloriosos')}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Mostrar Mistérios Gloriosos
            </Button>
          )}
        </div>
      )}

      {/* Agradecimento do Terço */}
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-emerald-800 text-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Agradecimento do Terço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={oracoesFinais}
            onChange={(e) => setOracoesFinais(e.target.value)}
            className="min-h-[300px] resize-y text-base leading-relaxed"
            style={{ fontFamily: 'Lora, serif' }}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => saveContent('oracoes_finais', oracoesFinais)}
              disabled={isSaving}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-3 w-3 mr-2" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TercoContent
