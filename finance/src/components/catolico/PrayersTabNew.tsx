import { useState, useEffect } from "react"
import { Sunrise, Sun, Moon, BookHeart, Sparkles, Heart, Gift, Save, Eye, EyeOff, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import NovenasSection from "./NovenasSection"
import EjaculationsSection from "./EjaculationsSection"
import PenancesSection from "./PenancesSection"
import OfferingsSection from "./OfferingsSection"
import IntercessionsSection from "./IntercessionsSection"

interface PrayerPeriod {
  id?: number
  period: 'morning' | 'afternoon' | 'night'
  content: string
  updated_at?: string
}

const PrayersTabNew = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("daily")

  // Estados para os períodos do dia
  const [morningPrayer, setMorningPrayer] = useState("")
  const [afternoonPrayer, setAfternoonPrayer] = useState("")
  const [nightPrayer, setNightPrayer] = useState("")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Estados para controlar visibilidade dos períodos
  const [visiblePeriods, setVisiblePeriods] = useState(() => {
    const saved = localStorage.getItem('prayer-periods-visibility')
    return saved ? JSON.parse(saved) : { morning: true, afternoon: true, night: true }
  })

  useEffect(() => {
    loadAllPrayers()
  }, [])

  // Salvar visibilidade no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('prayer-periods-visibility', JSON.stringify(visiblePeriods))
  }, [visiblePeriods])

  const togglePeriodVisibility = (period: 'morning' | 'afternoon' | 'night') => {
    setVisiblePeriods(prev => ({
      ...prev,
      [period]: !prev[period]
    }))
  }

  const loadAllPrayers = async () => {
    try {
      setIsLoading(true)

      // Carregar orações dos períodos
      const periodsResponse = await api.get<PrayerPeriod[]>("/api/catolico/prayer-periods")
      periodsResponse.data.forEach((prayer) => {
        if (prayer.period === 'morning') setMorningPrayer(prayer.content || "")
        if (prayer.period === 'afternoon') setAfternoonPrayer(prayer.content || "")
        if (prayer.period === 'night') setNightPrayer(prayer.content || "")
      })
    } catch (error) {
      console.error("Erro ao carregar orações:", error)
      // Não mostrar erro se for 404 (ainda não existe)
    } finally {
      setIsLoading(false)
    }
  }

  const savePrayerPeriod = async (period: 'morning' | 'afternoon' | 'night', content: string) => {
    try {
      setIsSaving(true)
      await api.post("/api/catolico/prayer-periods", { period, content })
      toast({
        title: "Salvo com sucesso",
        description: "Suas orações foram salvas",
      })
    } catch (error) {
      console.error("Erro ao salvar oração:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as orações",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }


  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-muted-foreground">Carregando orações...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Dia a Dia
          </TabsTrigger>
          <TabsTrigger value="intercession" className="flex items-center gap-2">
            <HandHeart className="h-4 w-4" />
            Intercessão
          </TabsTrigger>
          <TabsTrigger value="novenas" className="flex items-center gap-2">
            <BookHeart className="h-4 w-4" />
            Novenas
          </TabsTrigger>
          <TabsTrigger value="ejaculations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Jaculatórias
          </TabsTrigger>
          <TabsTrigger value="penance" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Penitência
          </TabsTrigger>
          <TabsTrigger value="offerings" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Oferecimentos
          </TabsTrigger>
        </TabsList>

        {/* DIA A DIA */}
        <TabsContent value="daily" className="space-y-6">
          <div className={`grid grid-cols-1 gap-6 ${
            // Calcular quantos períodos estão visíveis e ajustar grid
            (() => {
              const visibleCount = [visiblePeriods.morning, visiblePeriods.afternoon, visiblePeriods.night].filter(Boolean).length
              if (visibleCount === 3) return 'lg:grid-cols-3'
              if (visibleCount === 2) return 'lg:grid-cols-2'
              return 'lg:grid-cols-1'
            })()
          }`}>
            {/* Manhã */}
            {visiblePeriods.morning && (
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-amber-800 text-lg">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                        <Sunrise className="h-4 w-4 text-white" />
                      </div>
                      Manhã
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePeriodVisibility('morning')}
                      className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                      title="Ocultar"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <Textarea
                    value={morningPrayer}
                    onChange={(e) => setMorningPrayer(e.target.value)}
                    className="min-h-[600px] resize-y text-base leading-relaxed flex-1"
                    style={{ fontFamily: 'Lora, serif' }}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => savePrayerPeriod('morning', morningPrayer)}
                      disabled={isSaving}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Save className="h-3 w-3 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tarde */}
            {visiblePeriods.afternoon && (
              <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sky-800 text-lg">
                      <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                        <Sun className="h-4 w-4 text-white" />
                      </div>
                      Tarde
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePeriodVisibility('afternoon')}
                      className="text-sky-600 hover:text-sky-800 hover:bg-sky-100"
                      title="Ocultar"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <Textarea
                    value={afternoonPrayer}
                    onChange={(e) => setAfternoonPrayer(e.target.value)}
                    className="min-h-[600px] resize-y text-base leading-relaxed flex-1"
                    style={{ fontFamily: 'Lora, serif' }}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => savePrayerPeriod('afternoon', afternoonPrayer)}
                      disabled={isSaving}
                      size="sm"
                      className="bg-sky-600 hover:bg-sky-700"
                    >
                      <Save className="h-3 w-3 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Noite */}
            {visiblePeriods.night && (
              <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-indigo-800 text-lg">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                        <Moon className="h-4 w-4 text-white" />
                      </div>
                      Noite
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePeriodVisibility('night')}
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                      title="Ocultar"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <Textarea
                    value={nightPrayer}
                    onChange={(e) => setNightPrayer(e.target.value)}
                    className="min-h-[600px] resize-y text-base leading-relaxed flex-1"
                    style={{ fontFamily: 'Lora, serif' }}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => savePrayerPeriod('night', nightPrayer)}
                      disabled={isSaving}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-3 w-3 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Botões para mostrar períodos ocultos */}
          {(!visiblePeriods.morning || !visiblePeriods.afternoon || !visiblePeriods.night) && (
            <div className="flex gap-3 justify-center flex-wrap">
              {!visiblePeriods.morning && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePeriodVisibility('morning')}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar Manhã
                </Button>
              )}
              {!visiblePeriods.afternoon && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePeriodVisibility('afternoon')}
                  className="border-sky-300 text-sky-700 hover:bg-sky-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar Tarde
                </Button>
              )}
              {!visiblePeriods.night && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePeriodVisibility('night')}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar Noite
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* INTERCESSÃO */}
        <TabsContent value="intercession">
          <IntercessionsSection />
        </TabsContent>

        {/* NOVENAS */}
        <TabsContent value="novenas">
          <NovenasSection />
        </TabsContent>

        {/* JACULATÓRIAS */}
        <TabsContent value="ejaculations">
          <EjaculationsSection />
        </TabsContent>

        {/* PENITÊNCIA */}
        <TabsContent value="penance">
          <PenancesSection />
        </TabsContent>

        {/* OFERECIMENTOS */}
        <TabsContent value="offerings">
          <OfferingsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PrayersTabNew
