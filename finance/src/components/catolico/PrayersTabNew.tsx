import { useState, useEffect } from "react"
import { Sunrise, Sun, Moon, BookHeart, Sparkles, Heart, Gift, Save, Eye, EyeOff, HandHeart, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import jsPDF from "jspdf"
import NovenasSection from "./NovenasSection"
import EjaculationsSection from "./EjaculationsSection"
import PenancesSection from "./PenancesSection"
import OfferingsSection from "./OfferingsSection"
import IntercessionsSection from "./IntercessionsSection"
import { RichTextEditor } from "./RichTextEditor"

interface PrayerPeriod {
  id?: number
  period: 'morning' | 'afternoon' | 'night'
  content: string
  updated_at?: string
}

interface Intercession {
  id: number
  title: string
  content: string
  display_order: number
}

interface Novena {
  id: number
  title: string
  content: string
  display_order: number
}

interface Ejaculation {
  id: number
  title: string
  content: string
  display_order: number
}

interface Penance {
  id: number
  title: string
  content: string
  display_order: number
}

interface Offering {
  id: number
  title: string
  content: string
  display_order: number
}

const PrayersTabNew = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("daily")

  // Estados para os períodos do dia
  const [morningPrayer, setMorningPrayer] = useState("")
  const [afternoonPrayer, setAfternoonPrayer] = useState("")
  const [nightPrayer, setNightPrayer] = useState("")

  // Estados para outras seções
  const [intercessions, setIntercessions] = useState<Intercession[]>([])
  const [novenas, setNovenas] = useState<Novena[]>([])
  const [ejaculations, setEjaculations] = useState<Ejaculation[]>([])
  const [penances, setPenances] = useState<Penance[]>([])
  const [offerings, setOfferings] = useState<Offering[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Estados para controlar visibilidade dos períodos
  const [visiblePeriods, setVisiblePeriods] = useState(() => {
    const saved = localStorage.getItem('prayer-periods-visibility')
    return saved ? JSON.parse(saved) : { morning: true, afternoon: true, night: true }
  })

  // Estados para download
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<{type: string, id?: number}[]>([])

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

      // Carregar outras seções
      try {
        const intercessionsResponse = await api.get<Intercession[]>("/api/catolico/intercessions")
        setIntercessions(intercessionsResponse.data)
      } catch (error) {
        console.error("Erro ao carregar intercessões:", error)
      }

      try {
        const novenasResponse = await api.get<Novena[]>("/api/catolico/novenas")
        setNovenas(novenasResponse.data)
      } catch (error) {
        console.error("Erro ao carregar novenas:", error)
      }

      try {
        const ejaculationsResponse = await api.get<Ejaculation[]>("/api/catolico/ejaculations")
        setEjaculations(ejaculationsResponse.data)
      } catch (error) {
        console.error("Erro ao carregar jaculatórias:", error)
      }

      try {
        const penancesResponse = await api.get<Penance[]>("/api/catolico/penances")
        setPenances(penancesResponse.data)
      } catch (error) {
        console.error("Erro ao carregar penitências:", error)
      }

      try {
        const offeringsResponse = await api.get<Offering[]>("/api/catolico/offerings")
        setOfferings(offeringsResponse.data)
      } catch (error) {
        console.error("Erro ao carregar oferecimentos:", error)
      }
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

  // Funções de download
  const handleToggleItem = (type: string, id?: number) => {
    setSelectedItems((prev) => {
      const itemKey = id ? `${type}-${id}` : type
      const exists = prev.some(item => {
        const key = item.id ? `${item.type}-${item.id}` : item.type
        return key === itemKey
      })

      if (exists) {
        return prev.filter(item => {
          const key = item.id ? `${item.type}-${item.id}` : item.type
          return key !== itemKey
        })
      } else {
        return [...prev, { type, id }]
      }
    })
  }

  const isItemSelected = (type: string, id?: number) => {
    const itemKey = id ? `${type}-${id}` : type
    return selectedItems.some(item => {
      const key = item.id ? `${item.type}-${item.id}` : item.type
      return key === itemKey
    })
  }

  const handleSelectAll = () => {
    const allItems: {type: string, id?: number}[] = []
    if (morningPrayer.trim()) allItems.push({ type: 'morning' })
    if (afternoonPrayer.trim()) allItems.push({ type: 'afternoon' })
    if (nightPrayer.trim()) allItems.push({ type: 'night' })
    intercessions.forEach(item => allItems.push({ type: 'intercession', id: item.id }))
    novenas.forEach(item => allItems.push({ type: 'novena', id: item.id }))
    ejaculations.forEach(item => allItems.push({ type: 'ejaculation', id: item.id }))
    penances.forEach(item => allItems.push({ type: 'penance', id: item.id }))
    offerings.forEach(item => allItems.push({ type: 'offering', id: item.id }))

    if (selectedItems.length === allItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(allItems)
    }
  }

  const handleDownloadPrayers = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Selecione pelo menos um item",
        variant: "destructive"
      })
      return
    }

    try {
      // Criar PDF em formato A4
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Dimensões e margens
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const marginTop = 20
      const marginBottom = 20
      const marginLeft = 15
      const marginRight = 15
      const contentWidth = pageWidth - marginLeft - marginRight
      const maxY = pageHeight - marginBottom

      let currentY = marginTop

      // Função para processar e adicionar texto com formatação markdown
      const addText = (text: string, fontSize: number, isBold: boolean = false) => {
        pdf.setFontSize(fontSize)
        const lineHeight = fontSize * 0.5

        // Primeiro, dividir o texto em linhas
        const rawLines = text.split('\n')

        rawLines.forEach(rawLine => {
          if (!rawLine.trim()) {
            // Linha vazia, adicionar espaçamento
            currentY += lineHeight
            return
          }

          // Processar markdown na linha
          const segments: Array<{text: string, bold: boolean, highlight: boolean}> = []
          let remainingText = rawLine

          // Regex para encontrar **negrito** e ==marca==
          const boldRegex = /\*\*(.+?)\*\*/g
          const highlightRegex = /==(.+?)==/g

          let lastIndex = 0
          const matches: Array<{start: number, end: number, type: 'bold' | 'highlight', content: string}> = []

          // Encontrar todos os matches de negrito
          let match
          while ((match = boldRegex.exec(remainingText)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              type: 'bold',
              content: match[1]
            })
          }

          // Encontrar todos os matches de highlight
          while ((match = highlightRegex.exec(remainingText)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              type: 'highlight',
              content: match[1]
            })
          }

          // Ordenar matches por posição
          matches.sort((a, b) => a.start - b.start)

          // Construir segmentos
          let currentIndex = 0
          matches.forEach(m => {
            // Adicionar texto antes do match
            if (currentIndex < m.start) {
              const plainText = remainingText.substring(currentIndex, m.start)
              if (plainText) {
                segments.push({text: plainText, bold: isBold, highlight: false})
              }
            }

            // Adicionar o match
            segments.push({
              text: m.content,
              bold: m.type === 'bold' || isBold,
              highlight: m.type === 'highlight'
            })

            currentIndex = m.end
          })

          // Adicionar texto restante
          if (currentIndex < remainingText.length) {
            const plainText = remainingText.substring(currentIndex)
            if (plainText) {
              segments.push({text: plainText, bold: isBold, highlight: false})
            }
          }

          // Se não há segmentos, apenas usar o texto original
          if (segments.length === 0) {
            segments.push({text: remainingText, bold: isBold, highlight: false})
          }

          // Renderizar os segmentos
          let currentX = marginLeft

          segments.forEach(segment => {
            pdf.setFont("helvetica", segment.bold ? "bold" : "normal")
            pdf.setTextColor(0, 0, 0)

            // Quebrar o segmento em palavras se necessário
            const words = segment.text.split(' ')

            words.forEach((word, wordIndex) => {
              // Adicionar espaço antes da palavra (exceto primeira palavra do segmento)
              const textToRender = wordIndex === 0 ? word : ' ' + word
              const textWidth = pdf.getTextWidth(textToRender)

              // Verificar se precisa quebrar linha
              if (currentX + textWidth > pageWidth - marginRight && currentX > marginLeft) {
                // Quebrar para próxima linha
                currentY += lineHeight
                currentX = marginLeft

                // Verificar se precisa adicionar nova página
                if (currentY + lineHeight > maxY) {
                  pdf.addPage()
                  currentY = marginTop
                }

                // Se quebrou linha, não adicionar o espaço inicial
                const adjustedText = wordIndex === 0 ? word : word
                const adjustedWidth = pdf.getTextWidth(adjustedText)

                // Se tem highlight, desenhar retângulo ANTES do texto
                if (segment.highlight) {
                  const padding = 0.4
                  const highlightHeight = fontSize * 0.3
                  const highlightY = currentY - highlightHeight
                  pdf.setFillColor(254, 240, 138) // #fef08a
                  pdf.rect(currentX - padding, highlightY, adjustedWidth + (padding * 2), highlightHeight, 'F')
                }

                pdf.text(adjustedText, currentX, currentY)
                currentX += adjustedWidth
              } else {
                // Verificar se precisa adicionar nova página
                if (currentY + lineHeight > maxY) {
                  pdf.addPage()
                  currentY = marginTop
                  currentX = marginLeft
                }

                // Se tem highlight, desenhar retângulo ANTES do texto
                if (segment.highlight) {
                  const padding = 0.4
                  const highlightHeight = fontSize * 0.3
                  const highlightY = currentY - highlightHeight
                  pdf.setFillColor(254, 240, 138) // #fef08a
                  pdf.rect(currentX - padding, highlightY, textWidth + (padding * 2), highlightHeight, 'F')
                }

                pdf.text(textToRender, currentX, currentY)
                currentX += textWidth
              }
            })
          })

          // Avançar para próxima linha
          currentY += lineHeight
        })
      }

      const addSpacing = (space: number) => {
        currentY += space
        if (currentY > maxY) {
          pdf.addPage()
          currentY = marginTop
        }
      }

      // Título
      addText("Orações", 20, true)
      addSpacing(4)

      // Adicionar itens selecionados
      if (isItemSelected('morning')) {
        addText("Manhã", 14, true)
        addSpacing(4)
        addText(morningPrayer, 10.5)
        addSpacing(3)
      }

      if (isItemSelected('afternoon')) {
        addText("Tarde", 14, true)
        addSpacing(4)
        addText(afternoonPrayer, 10.5)
        addSpacing(3)
      }

      if (isItemSelected('night')) {
        addText("Noite", 14, true)
        addSpacing(4)
        addText(nightPrayer, 10.5)
        addSpacing(3)
      }

      // Intercessões
      const selectedIntercessions = intercessions.filter(item => isItemSelected('intercession', item.id))
      if (selectedIntercessions.length > 0) {
        addText("Intercessão", 14, true)
        addSpacing(5)
        selectedIntercessions.forEach((item, idx) => {
          addText(item.title, 11, true)
          addSpacing(3)
          addText(item.content, 10.5)
          if (idx < selectedIntercessions.length - 1) addSpacing(6)
        })
        addSpacing(8)
      }

      // Novenas
      const selectedNovenas = novenas.filter(item => isItemSelected('novena', item.id))
      if (selectedNovenas.length > 0) {
        addText("Novenas", 14, true)
        addSpacing(5)
        selectedNovenas.forEach((item, idx) => {
          addText(item.title, 11, true)
          addSpacing(3)
          addText(item.content, 10.5)
          if (idx < selectedNovenas.length - 1) addSpacing(6)
        })
        addSpacing(8)
      }

      // Jaculatórias
      const selectedEjaculations = ejaculations.filter(item => isItemSelected('ejaculation', item.id))
      if (selectedEjaculations.length > 0) {
        addText("Jaculatórias", 14, true)
        addSpacing(5)
        selectedEjaculations.forEach((item, idx) => {
          addText(item.title, 11, true)
          addSpacing(3)
          addText(item.content, 10.5)
          if (idx < selectedEjaculations.length - 1) addSpacing(6)
        })
        addSpacing(8)
      }

      // Penitências
      const selectedPenances = penances.filter(item => isItemSelected('penance', item.id))
      if (selectedPenances.length > 0) {
        addText("Penitências", 14, true)
        addSpacing(5)
        selectedPenances.forEach((item, idx) => {
          addText(item.title, 11, true)
          addSpacing(3)
          addText(item.content, 10.5)
          if (idx < selectedPenances.length - 1) addSpacing(6)
        })
        addSpacing(8)
      }

      // Oferecimentos
      const selectedOfferings = offerings.filter(item => isItemSelected('offering', item.id))
      if (selectedOfferings.length > 0) {
        addText("Oferecimentos", 14, true)
        addSpacing(5)
        selectedOfferings.forEach((item, idx) => {
          addText(item.title, 11, true)
          addSpacing(3)
          addText(item.content, 10.5)
          if (idx < selectedOfferings.length - 1) addSpacing(6)
        })
      }

      const date = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")
      pdf.save(`oracoes-${date}.pdf`)

      setIsDownloadDialogOpen(false)
      setSelectedItems([])
      toast({
        title: "PDF gerado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast({
        title: "Erro ao gerar PDF",
        variant: "destructive"
      })
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
      {/* Botão de Download */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setIsDownloadDialogOpen(true)}>
          <Download className="h-4 w-4 mr-2" />
          Baixar Orações
        </Button>
      </div>

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
                  <RichTextEditor
                    value={morningPrayer}
                    onChange={setMorningPrayer}
                    className="flex-1"
                    actionButtons={(isEditing) => isEditing ? (
                      <Button
                        onClick={() => savePrayerPeriod('morning', morningPrayer)}
                        disabled={isSaving}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Save className="h-3 w-3 mr-2" />
                        Salvar
                      </Button>
                    ) : null}
                  />
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
                  <RichTextEditor
                    value={afternoonPrayer}
                    onChange={setAfternoonPrayer}
                    className="flex-1"
                    actionButtons={(isEditing) => isEditing ? (
                      <Button
                        onClick={() => savePrayerPeriod('afternoon', afternoonPrayer)}
                        disabled={isSaving}
                        size="sm"
                        className="bg-sky-600 hover:bg-sky-700"
                      >
                        <Save className="h-3 w-3 mr-2" />
                        Salvar
                      </Button>
                    ) : null}
                  />
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
                  <RichTextEditor
                    value={nightPrayer}
                    onChange={setNightPrayer}
                    className="flex-1"
                    actionButtons={(isEditing) => isEditing ? (
                      <Button
                        onClick={() => savePrayerPeriod('night', nightPrayer)}
                        disabled={isSaving}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Save className="h-3 w-3 mr-2" />
                        Salvar
                      </Button>
                    ) : null}
                  />
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

      {/* Dialog de seleção para download */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baixar Orações</DialogTitle>
            <DialogDescription>
              Selecione quais orações você deseja incluir no PDF
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Selecionar:</Label>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Todas / Nenhuma
              </Button>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {/* Dia a Dia */}
              {(morningPrayer.trim() || afternoonPrayer.trim() || nightPrayer.trim()) && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 px-2">Dia a Dia</h3>
                  {morningPrayer.trim() && (
                    <div
                      className="flex items-center gap-2 p-2 pl-6 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => handleToggleItem('morning')}
                    >
                      <input
                        type="checkbox"
                        checked={isItemSelected('morning')}
                        onChange={() => handleToggleItem('morning')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Manhã</span>
                    </div>
                  )}
                  {afternoonPrayer.trim() && (
                    <div
                      className="flex items-center gap-2 p-2 pl-6 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => handleToggleItem('afternoon')}
                    >
                      <input
                        type="checkbox"
                        checked={isItemSelected('afternoon')}
                        onChange={() => handleToggleItem('afternoon')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Tarde</span>
                    </div>
                  )}
                  {nightPrayer.trim() && (
                    <div
                      className="flex items-center gap-2 p-2 pl-6 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => handleToggleItem('night')}
                    >
                      <input
                        type="checkbox"
                        checked={isItemSelected('night')}
                        onChange={() => handleToggleItem('night')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Noite</span>
                    </div>
                  )}
                </div>
              )}

              {/* Intercessão */}
              {intercessions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 px-2">Intercessão</h3>
                  {intercessions.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 pl-6 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => handleToggleItem('intercession', item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isItemSelected('intercession', item.id)}
                        onChange={() => handleToggleItem('intercession', item.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Novenas */}
              {novenas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 px-2">Novenas</h3>
                  {novenas.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 pl-6 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => handleToggleItem('novena', item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isItemSelected('novena', item.id)}
                        onChange={() => handleToggleItem('novena', item.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Jaculatórias */}
              {ejaculations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 px-2">Jaculatórias</h3>
                  {ejaculations.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 pl-6 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => handleToggleItem('ejaculation', item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isItemSelected('ejaculation', item.id)}
                        onChange={() => handleToggleItem('ejaculation', item.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Penitências */}
              {penances.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 px-2">Penitências</h3>
                  {penances.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 pl-6 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => handleToggleItem('penance', item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isItemSelected('penance', item.id)}
                        onChange={() => handleToggleItem('penance', item.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Oferecimentos */}
              {offerings.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 px-2">Oferecimentos</h3>
                  {offerings.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 pl-6 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => handleToggleItem('offering', item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isItemSelected('offering', item.id)}
                        onChange={() => handleToggleItem('offering', item.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleDownloadPrayers}
              className="w-full"
              disabled={selectedItems.length === 0}
            >
              Baixar Selecionadas ({selectedItems.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default PrayersTabNew
