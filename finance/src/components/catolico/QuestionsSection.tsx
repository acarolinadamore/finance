import { useState, useEffect, useRef } from "react"
import { Plus, GripVertical, Edit, Trash2, HelpCircle, Download, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Question {
  id: number
  pergunta: string
  contexto: string | null
  resposta: string | null
  status: 'pendente' | 'respondida'
  display_order: number
  created_at: string
}

interface SortableQuestionProps {
  question: Question
  onEdit: (question: Question) => void
  onDelete: (id: number) => void
}

const SortableQuestion = ({ question, onEdit, onDelete }: SortableQuestionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`border-2 ${
        question.status === 'respondida'
          ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
          : 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50'
      } hover:shadow-md transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className={`cursor-grab active:cursor-grabbing mt-1 ${
                question.status === 'respondida' ? 'text-green-400 hover:text-green-600' : 'text-amber-400 hover:text-amber-600'
              }`}
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                {question.status === 'respondida' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    question.status === 'respondida' ? 'text-green-900' : 'text-amber-900'
                  } mb-1`}>
                    {question.pergunta}
                  </h3>
                  {question.contexto && (
                    <p className={`text-sm italic ${
                      question.status === 'respondida' ? 'text-green-700' : 'text-amber-700'
                    } mb-2`}>
                      Contexto: {question.contexto}
                    </p>
                  )}
                  {question.resposta && (
                    <div className="mt-2 p-3 bg-white/50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-800 mb-1">Resposta do Padre:</p>
                      <p className="text-green-900 whitespace-pre-wrap" style={{ fontFamily: 'Lora, serif' }}>
                        {question.resposta}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(question)}
                className={question.status === 'respondida'
                  ? 'text-green-600 hover:text-green-800 hover:bg-green-100'
                  : 'text-amber-600 hover:text-amber-800 hover:bg-amber-100'
                }
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(question.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const QuestionsSection = () => {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [formData, setFormData] = useState({
    pergunta: "",
    contexto: "",
    resposta: "",
    status: "pendente" as "pendente" | "respondida"
  })
  const questionsRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Question[]>("/api/catolico/questions")
      setQuestions(response.data)
    } catch (error) {
      console.error("Erro ao carregar dúvidas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.pergunta) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha a pergunta",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingQuestion) {
        await api.put(`/api/catolico/questions/${editingQuestion.id}`, formData)
        toast({ title: "Dúvida atualizada com sucesso" })
      } else {
        await api.post("/api/catolico/questions", formData)
        toast({ title: "Dúvida adicionada com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadQuestions()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a dúvida",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta dúvida?")) return

    try {
      await api.delete(`/api/catolico/questions/${id}`)
      toast({ title: "Dúvida deletada com sucesso" })
      loadQuestions()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        variant: "destructive"
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex((q) => q.id === active.id)
    const newIndex = questions.findIndex((q) => q.id === over.id)

    const newOrder = arrayMove(questions, oldIndex, newIndex)
    setQuestions(newOrder)

    try {
      const orders = newOrder.map((question, index) => ({
        id: question.id,
        display_order: index
      }))
      await api.post("/api/catolico/questions/reorder", { orders })
    } catch (error) {
      toast({
        title: "Erro ao reordenar",
        variant: "destructive"
      })
      loadQuestions()
    }
  }

  const resetForm = () => {
    setFormData({ pergunta: "", contexto: "", resposta: "", status: "pendente" })
    setEditingQuestion(null)
  }

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      pergunta: question.pergunta,
      contexto: question.contexto || "",
      resposta: question.resposta || "",
      status: question.status
    })
    setIsDialogOpen(true)
  }

  const handleToggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(questions.map((q) => q.id))
    }
  }

  const handleDownloadQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Nenhuma dúvida selecionada",
        description: "Selecione pelo menos uma dúvida para imprimir",
        variant: "destructive"
      })
      return
    }

    if (!questionsRef.current) return

    try {
      const canvas = await html2canvas(questionsRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      })

      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = imgWidth / imgHeight

      let finalWidth = pdfWidth - 20
      let finalHeight = finalWidth / ratio

      if (finalHeight > pdfHeight - 20) {
        finalHeight = pdfHeight - 20
        finalWidth = finalHeight * ratio
      }

      const x = (pdfWidth - finalWidth) / 2
      const y = 10

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight)

      const date = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")
      pdf.save(`duvidas-para-padre-${date}.pdf`)

      setIsDownloadDialogOpen(false)
      setSelectedQuestions([])
      toast({ title: "PDF gerado com sucesso" })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast({
        title: "Erro ao gerar PDF",
        variant: "destructive"
      })
    }
  }

  const pendingQuestions = questions.filter(q => q.status === 'pendente')
  const answeredQuestions = questions.filter(q => q.status === 'respondida')

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Dúvidas para o Padre</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsDownloadDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Imprimir Lista
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Dúvida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? "Editar Dúvida" : "Nova Dúvida"}</DialogTitle>
                <DialogDescription>
                  {editingQuestion ? "Edite a dúvida ou adicione a resposta do padre" : "Adicione uma dúvida para levar ao padre"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="pergunta">Pergunta *</Label>
                  <Textarea
                    id="pergunta"
                    value={formData.pergunta}
                    onChange={(e) => setFormData({ ...formData, pergunta: e.target.value })}
                    placeholder="Digite sua dúvida..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contexto">Contexto (opcional)</Label>
                  <Textarea
                    id="contexto"
                    value={formData.contexto}
                    onChange={(e) => setFormData({ ...formData, contexto: e.target.value })}
                    placeholder="Ex: Dúvida surgiu durante leitura espiritual, versículo João 3:16, etc."
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resposta">Resposta do Padre</Label>
                  <Textarea
                    id="resposta"
                    value={formData.resposta}
                    onChange={(e) => setFormData({ ...formData, resposta: e.target.value })}
                    placeholder="Anote aqui a resposta do padre..."
                    rows={5}
                    className="resize-none text-base"
                    style={{ fontFamily: 'Lora, serif' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "pendente" | "respondida" })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="respondida">Respondida</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="bg-amber-600 hover:bg-amber-700">
                  {editingQuestion ? "Salvar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dialog de seleção para impressão */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir Dúvidas</DialogTitle>
            <DialogDescription>
              Selecione quais dúvidas você deseja incluir no PDF
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Selecionar:</Label>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedQuestions.length === questions.length
                  ? "Desmarcar Todas"
                  : "Todas"}
              </Button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`flex items-start gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                    question.status === 'respondida' ? 'border-green-200' : 'border-amber-200'
                  }`}
                  onClick={() => handleToggleQuestionSelection(question.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => handleToggleQuestionSelection(question.id)}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {question.status === 'respondida' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-amber-600" />
                      )}
                      <p className="font-medium">{question.pergunta}</p>
                    </div>
                    {question.contexto && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {question.contexto}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleDownloadQuestions} className="w-full bg-amber-600 hover:bg-amber-700">
              Gerar PDF ({selectedQuestions.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Container oculto para impressão */}
      <div
        ref={questionsRef}
        className="fixed top-[-9999px] left-[-9999px] bg-white p-8"
        style={{ width: "1200px" }}
      >
        <h1 className="text-3xl font-bold mb-2">Dúvidas para o Padre</h1>
        <p className="text-gray-600 mb-6">
          Data: {new Date().toLocaleDateString("pt-BR")}
        </p>
        <div className="space-y-6">
          {questions
            .filter((q) => selectedQuestions.includes(q.id))
            .map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-bold text-lg">{index + 1}.</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{question.pergunta}</h3>
                    {question.contexto && (
                      <p className="text-sm italic text-gray-600 mb-2">
                        Contexto: {question.contexto}
                      </p>
                    )}
                    {question.status === 'respondida' && question.resposta ? (
                      <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-sm font-semibold text-green-800 mb-1">Resposta:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{question.resposta}</p>
                      </div>
                    ) : (
                      <div className="mt-3 p-6 border-2 border-gray-300 rounded">
                        <p className="text-sm text-gray-400 italic">Espaço para resposta...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <HelpCircle className="h-16 w-16 mx-auto text-amber-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Nenhuma dúvida cadastrada
            </h2>
            <p className="text-muted-foreground">
              Clique em "Nova Dúvida" para começar a registrar suas dúvidas espirituais
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Dúvidas Pendentes */}
          {pendingQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                <Circle className="h-5 w-5" />
                Pendentes ({pendingQuestions.length})
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={pendingQuestions.map(q => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {pendingQuestions.map((question) => (
                      <SortableQuestion
                        key={question.id}
                        question={question}
                        onEdit={openEditDialog}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Dúvidas Respondidas */}
          {answeredQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Respondidas ({answeredQuestions.length})
              </h3>
              <div className="space-y-3">
                {answeredQuestions.map((question) => (
                  <SortableQuestion
                    key={question.id}
                    question={question}
                    onEdit={openEditDialog}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default QuestionsSection
