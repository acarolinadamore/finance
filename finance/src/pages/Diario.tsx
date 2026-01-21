import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowLeft,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  X,
  BookOpen,
  Eye,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RichTextEditor } from '@/components/catolico/RichTextEditor'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Category {
  id: number
  name: string
  color: string
}

interface DiaryEntry {
  id: number
  user_id: number
  entry_date: string
  title: string
  content: string
  categories: Category[]
  created_at: string
  updated_at: string
}

const Diario = () => {
  const { toast } = useToast()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [weekFilter, setWeekFilter] = useState<{ start: string; end: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    content: '',
    category_ids: [] as number[],
  })

  useEffect(() => {
    loadCategories()
    loadEntries()
  }, [selectedMonth, selectedYear, weekFilter, searchTerm])

  const loadCategories = async () => {
    try {
      const response = await api.get<Category[]>('/api/diary/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      })
    }
  }

  const loadEntries = async () => {
    try {
      setIsLoading(true)
      const params: any = {}

      if (selectedMonth && selectedYear) {
        params.month = selectedMonth
        params.year = selectedYear
      }

      if (weekFilter) {
        params.week_start = weekFilter.start
        params.week_end = weekFilter.end
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await api.get<DiaryEntry[]>('/api/diary/entries', { params })
      setEntries(response.data)
    } catch (error) {
      console.error('Erro ao carregar entradas:', error)
      toast({
        title: "Erro ao carregar entradas",
        description: "Não foi possível carregar as entradas do diário",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (entry?: DiaryEntry) => {
    if (entry) {
      setEditingEntry(entry)
      // Converter a data ISO para YYYY-MM-DD para o input
      const dateForInput = entry.entry_date.split('T')[0]
      setFormData({
        entry_date: dateForInput,
        title: entry.title,
        content: entry.content,
        category_ids: entry.categories.map(c => c.id),
      })
    } else {
      setEditingEntry(null)
      setFormData({
        entry_date: format(new Date(), 'yyyy-MM-dd'),
        title: '',
        content: '',
        category_ids: [],
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingEntry(null)
    setFormData({
      entry_date: format(new Date(), 'yyyy-MM-dd'),
      title: '',
      content: '',
      category_ids: [],
    })
  }

  const handleViewEntry = (entry: DiaryEntry) => {
    setViewingEntry(entry)
    setViewDialogOpen(true)
  }

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false)
    setViewingEntry(null)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e conteúdo",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingEntry) {
        await api.put(`/api/diary/entries/${editingEntry.id}`, formData)
        toast({ title: "Entrada atualizada com sucesso!" })
      } else {
        await api.post('/api/diary/entries', formData)
        toast({ title: "Entrada criada com sucesso!" })
      }
      handleCloseDialog()
      loadEntries()
    } catch (error) {
      console.error('Erro ao salvar entrada:', error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a entrada",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (entryId: number) => {
    setEntryToDelete(entryId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return

    try {
      await api.delete(`/api/diary/entries/${entryToDelete}`)
      toast({ title: "Entrada excluída com sucesso!" })
      setDeleteDialogOpen(false)
      setEntryToDelete(null)
      loadEntries()
    } catch (error) {
      console.error('Erro ao excluir entrada:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a entrada",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      // Extract YYYY-MM-DD from ISO format or use as is
      const dateOnly = dateString.split('T')[0]
      const [year, month, day] = dateOnly.split('-')
      // Create date in local timezone (avoid UTC conversion)
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (isNaN(date.getTime())) return dateString // Return original if invalid
      return format(date, "d 'de' MMMM 'de' yyyy (EEEE)", { locale: ptBR })
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  const toggleCategory = (categoryId: number) => {
    if (formData.category_ids.includes(categoryId)) {
      setFormData({
        ...formData,
        category_ids: formData.category_ids.filter(id => id !== categoryId)
      })
    } else {
      setFormData({
        ...formData,
        category_ids: [...formData.category_ids, categoryId]
      })
    }
  }

  const setThisWeek = () => {
    const now = new Date()
    const start = startOfWeek(now, { weekStartsOn: 0 })
    const end = endOfWeek(now, { weekStartsOn: 0 })
    setWeekFilter({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    })
    setSelectedMonth(undefined)
    setSelectedYear(undefined)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedMonth(undefined)
    setSelectedYear(undefined)
    setWeekFilter(null)
  }

  // Converter markdown para HTML para preview nos cards
  const markdownToHtml = (text: string): string => {
    let html = text
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/==(.+?)==/g, '<mark style="background-color: #fef08a; padding: 2px 4px;">$1</mark>')
    html = html.replace(/\n/g, '<br>')
    return html
  }

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="h-10 w-10 text-purple-600" />
                Diário
              </h1>
              <p className="text-gray-600 mt-1">
                Registre seus pensamentos e momentos especiais
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Nota
          </Button>
        </div>

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Busca */}
            <div className="flex-1 min-w-[200px]">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Ano */}
            <div className="w-32">
              <Label>Ano</Label>
              <Select
                value={selectedYear?.toString() || undefined}
                onValueChange={(value) => {
                  setSelectedYear(value ? parseInt(value) : undefined)
                  setWeekFilter(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mês */}
            <div className="w-40">
              <Label>Mês</Label>
              <Select
                value={selectedMonth?.toString() || undefined}
                onValueChange={(value) => {
                  setSelectedMonth(value ? parseInt(value) : undefined)
                  setWeekFilter(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semana Atual */}
            <Button
              variant="outline"
              onClick={setThisWeek}
              className={weekFilter ? 'bg-purple-100 border-purple-300' : ''}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Esta Semana
            </Button>

            {/* Limpar Filtros */}
            {(searchTerm || selectedMonth || selectedYear || weekFilter) && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Listagem */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma entrada encontrada</p>
            </div>
          ) : (
            entries.map(entry => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{entry.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(entry.entry_date)}
                      </CardDescription>
                      {entry.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {entry.categories.map(category => (
                            <Badge
                              key={category.id}
                              style={{ backgroundColor: category.color }}
                              className="text-white"
                            >
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEntry(entry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    style={{
                      fontFamily: 'Lora, serif',
                      fontSize: '15px',
                      lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(entry.content.substring(0, 300) + (entry.content.length > 300 ? '...' : '')) }}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialog de Adicionar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Editar Entrada' : 'Nova Entrada'}
            </DialogTitle>
            <DialogDescription>
              {formatDate(formData.entry_date)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Data */}
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.entry_date}
                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
              />
            </div>

            {/* Título */}
            <div>
              <Label>Título</Label>
              <Input
                placeholder="Digite o título da nota..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Categorias */}
            <div>
              <Label>Áreas da Vida (opcional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map(category => (
                  <Badge
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    style={{
                      backgroundColor: formData.category_ids.includes(category.id) ? category.color : '#e5e7eb',
                      color: formData.category_ids.includes(category.id) ? 'white' : '#6b7280',
                      cursor: 'pointer',
                    }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex flex-col">
              <Label className="mb-2">Conteúdo</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              {editingEntry ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={handleCloseViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{viewingEntry.title}</DialogTitle>
                <DialogDescription>
                  {formatDate(viewingEntry.entry_date)}
                </DialogDescription>
                {viewingEntry.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {viewingEntry.categories.map(category => (
                      <Badge
                        key={category.id}
                        style={{ backgroundColor: category.color }}
                        className="text-white"
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </DialogHeader>

              <div className="mt-6">
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  style={{
                    fontFamily: 'Lora, serif',
                    fontSize: '16px',
                    lineHeight: '1.8',
                  }}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(viewingEntry.content) }}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={handleCloseViewDialog}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    handleCloseViewDialog()
                    handleOpenDialog(viewingEntry)
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir entrada?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A entrada será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Diario
