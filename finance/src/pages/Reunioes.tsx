import { Plus, Edit2, Trash2, Clock, Users, ExternalLink, Calendar as CalendarIcon, Tag, Paperclip, Download, FileText, Image as ImageIcon, Eye, Copy, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { useMeetingTags, useMeetings, useCreateMeetingTag, useUpdateMeetingTag, useDeleteMeetingTag, useDeleteMeeting } from "@/hooks/useMeetings"
import { MeetingDialog } from "@/components/MeetingDialog"
import { PageHeader } from "@/components/PageHeader"
import type { ApiMeeting, ApiMeetingTag } from "@/services/api"

const Reunioes = () => {
  const { toast } = useToast()
  const { data: tags = [], isLoading: tagsLoading } = useMeetingTags()
  const { data: meetings = [], isLoading: meetingsLoading } = useMeetings()
  const createTagMutation = useCreateMeetingTag()
  const updateTagMutation = useUpdateMeetingTag()
  const deleteTagMutation = useDeleteMeetingTag()
  const deleteMeetingMutation = useDeleteMeeting()

  const [currentTab, setCurrentTab] = useState<number | null>(null)
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<ApiMeeting | null>(null)
  const [isAddTagOpen, setIsAddTagOpen] = useState(false)
  const [isEditTagOpen, setIsEditTagOpen] = useState(false)
  const [isDeleteTagOpen, setIsDeleteTagOpen] = useState(false)
  const [tagToEdit, setTagToEdit] = useState<ApiMeetingTag | null>(null)
  const [tagToDelete, setTagToDelete] = useState<ApiMeetingTag | null>(null)
  const [newTagForm, setNewTagForm] = useState({ name: '', color: '#3b82f6' })
  const [editTagForm, setEditTagForm] = useState({ name: '', color: '#3b82f6' })

  // Definir primeira tab quando as tags carregarem
  useEffect(() => {
    if (tags.length > 0 && currentTab === null) {
      setCurrentTab(tags[0].id)
    }
  }, [tags, currentTab])

  const handleAddTag = async () => {
    if (!newTagForm.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome da categoria",
        variant: "destructive",
      })
      return
    }

    try {
      await createTagMutation.mutateAsync(newTagForm)
      setNewTagForm({ name: '', color: '#3b82f6' })
      setIsAddTagOpen(false)
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error)
    }
  }

  const handleOpenEditTag = (tag: ApiMeetingTag) => {
    setTagToEdit(tag)
    setEditTagForm({ name: tag.name, color: tag.color })
    setIsEditTagOpen(true)
  }

  const handleUpdateTag = async () => {
    if (!tagToEdit) return

    if (!editTagForm.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome da categoria",
        variant: "destructive",
      })
      return
    }

    try {
      await updateTagMutation.mutateAsync({ id: tagToEdit.id, data: editTagForm })
      setIsEditTagOpen(false)
      setTagToEdit(null)
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
    }
  }

  const handleOpenDeleteTag = (tag: ApiMeetingTag) => {
    setTagToDelete(tag)
    setIsDeleteTagOpen(true)
  }

  const handleConfirmDeleteTag = async () => {
    if (!tagToDelete) return

    try {
      await deleteTagMutation.mutateAsync(tagToDelete.id)
      // Se estava na tab excluída, mover para a primeira disponível
      if (currentTab === tagToDelete.id && tags.length > 1) {
        const remainingTags = tags.filter(t => t.id !== tagToDelete.id)
        if (remainingTags.length > 0) {
          setCurrentTab(remainingTags[0].id)
        } else {
          setCurrentTab(null)
        }
      }
      setIsDeleteTagOpen(false)
      setTagToDelete(null)
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error)
    }
  }

  const handleOpenMeetingDialog = (meeting?: ApiMeeting) => {
    if (meeting) {
      setEditingMeeting(meeting)
    } else {
      setEditingMeeting(null)
    }
    setIsMeetingDialogOpen(true)
  }

  const handleCloseMeetingDialog = () => {
    setIsMeetingDialogOpen(false)
    setEditingMeeting(null)
  }

  const handleDeleteMeeting = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta reunião?')) return

    try {
      await deleteMeetingMutation.mutateAsync(id)
    } catch (error) {
      console.error('Erro ao excluir reunião:', error)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  }

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return ''
    return timeString.substring(0, 5) // HH:MM
  }

  const handleDownloadAttachment = (attachment: any, meetingTitle: string) => {
    try {
      const byteCharacters = atob(attachment.file_data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: attachment.file_type })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar anexo:', error)
      alert('Erro ao baixar anexo. Tente novamente.')
    }
  }

  const handleViewAttachment = (attachment: any) => {
    try {
      const byteCharacters = atob(attachment.file_data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: attachment.file_type })

      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Erro ao visualizar anexo:', error)
      alert('Erro ao visualizar anexo. Tente novamente.')
    }
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência",
      })
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      })
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    }
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const getMeetingsByTag = (tagId: number) => {
    return meetings.filter(meeting => meeting.tag_id === tagId)
      .sort((a, b) => {
        const dateA = new Date(`${a.meeting_date}T${a.meeting_time || '00:00'}`)
        const dateB = new Date(`${b.meeting_date}T${b.meeting_time || '00:00'}`)
        return dateB.getTime() - dateA.getTime()
      })
  }

  const renderMeetingsGrid = (meetingsList: ApiMeeting[]) => {
    if (meetingsList.length === 0) {
      return (
        <div className="text-center py-12">
          <Video className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-muted-foreground mb-2">Nenhuma reunião cadastrada</p>
          <p className="text-sm text-muted-foreground">
            Clique em "Nova Reunião" para adicionar
          </p>
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meetingsList.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold">
                    {meeting.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{meeting.tag_name}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenMeetingDialog(meeting)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMeeting(meeting.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(meeting.meeting_date)}</span>
                  {meeting.meeting_time && (
                    <>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{formatTime(meeting.meeting_time)}</span>
                    </>
                  )}
                </div>

                {meeting.participants && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">{meeting.participants}</span>
                  </div>
                )}

                {meeting.summary && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Resumo:</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded-md">
                      {meeting.summary}
                    </p>
                  </div>
                )}

                {meeting.description && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Descrição:</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded-md">
                      {meeting.description}
                    </p>
                  </div>
                )}

                {meeting.links && Array.isArray(meeting.links) && meeting.links.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Links:</p>
                    {meeting.links.map((link: any, index: number) => (
                      <div key={index} className="p-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex-1 truncate"
                          >
                            {link.url}
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(link.url)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                            title="Copiar link"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                            className="h-6 w-6 p-0 flex-shrink-0"
                            title="Abrir link"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {meeting.my_definitions && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Definições da Minha Parte:</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded-md">
                      {meeting.my_definitions}
                    </p>
                  </div>
                )}

                {meeting.participant_definitions && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Definições do Participante:</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded-md">
                      {meeting.participant_definitions}
                    </p>
                  </div>
                )}

                {meeting.decisions && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Decisões/Combinados:</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded-md">
                      {meeting.decisions}
                    </p>
                  </div>
                )}

                {meeting.next_steps && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Próximos Passos:</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded-md">
                      {meeting.next_steps}
                    </p>
                  </div>
                )}

                {meeting.pending && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Pendência:</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded-md">
                      {meeting.pending}
                    </p>
                  </div>
                )}

                {meeting.attachments && meeting.attachments.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Paperclip className="h-3 w-3" />
                      <span>{meeting.attachments.length} {meeting.attachments.length === 1 ? 'anexo' : 'anexos'}</span>
                    </div>
                    {meeting.attachments.map((attachment: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted rounded text-xs"
                      >
                        {getFileIcon(attachment.file_type)}
                        <span className="flex-1 truncate">{attachment.file_name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAttachment(attachment)}
                          className="h-6 w-6 p-0"
                          title="Visualizar"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadAttachment(attachment, meeting.title)}
                          className="h-6 w-6 p-0"
                          title="Baixar"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tagsLoading || meetingsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  // Se não há tags, mostrar botão + no topo e mensagem simples
  const hasNoTags = tags.length === 0

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Reuniões"
        actions={
          <Button
            onClick={() => hasNoTags ? setIsAddTagOpen(true) : handleOpenMeetingDialog()}
            className="bg-gray-800 hover:bg-gray-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            {hasNoTags ? 'Nova Categoria' : 'Nova Reunião'}
          </Button>
        }
      />
      <div className="container mx-auto px-4 py-6">

        {/* Mostrar mensagem se não há tags */}
        {hasNoTags ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">Nenhuma categoria cadastrada</p>
            <p className="text-sm text-muted-foreground">
              Crie uma categoria clicando no botão acima
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            {currentTab && (
          <Tabs value={String(currentTab)} onValueChange={(value) => setCurrentTab(parseInt(value))}>
            <div className="flex items-center gap-4 mb-6">
              <TabsList>
                {tags.map(tag => (
                  <TabsTrigger key={tag.id} value={String(tag.id)}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddTagOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Categoria
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tag = tags.find(t => t.id === currentTab)
                    if (tag) handleOpenEditTag(tag)
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar Categoria
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const tag = tags.find(t => t.id === currentTab)
                    if (tag) handleOpenDeleteTag(tag)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Categoria
                </Button>
              </div>
            </div>

            {tags.map(tag => (
              <TabsContent key={tag.id} value={String(tag.id)}>
                {renderMeetingsGrid(getMeetingsByTag(tag.id))}
              </TabsContent>
            ))}
          </Tabs>
            )}
          </>
        )}
      </div>

      {/* Dialog de Reunião */}
      <MeetingDialog
        open={isMeetingDialogOpen}
        onOpenChange={handleCloseMeetingDialog}
        meeting={editingMeeting}
        tags={tags}
        defaultTagId={currentTab || undefined}
      />

      {/* Dialog para adicionar categoria */}
      <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma categoria para organizar suas reuniões
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome da Categoria</Label>
              <Input
                placeholder="Ex: Freelance, Trabalho..."
                value={newTagForm.name}
                onChange={(e) => setNewTagForm({ ...newTagForm, name: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag()
                  }
                }}
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={newTagForm.color}
                  onChange={(e) => setNewTagForm({ ...newTagForm, color: e.target.value })}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{newTagForm.color}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddTagOpen(false)
              setNewTagForm({ name: '', color: '#3b82f6' })
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddTag}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar categoria */}
      <Dialog open={isEditTagOpen} onOpenChange={setIsEditTagOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Altere o nome ou cor da categoria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome da Categoria</Label>
              <Input
                placeholder="Ex: Freelance, Trabalho..."
                value={editTagForm.name}
                onChange={(e) => setEditTagForm({ ...editTagForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={editTagForm.color}
                  onChange={(e) => setEditTagForm({ ...editTagForm, color: e.target.value })}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{editTagForm.color}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditTagOpen(false)
              setTagToEdit(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTag}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão de categoria */}
      <Dialog open={isDeleteTagOpen} onOpenChange={setIsDeleteTagOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a categoria "{tagToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta ação não poderá ser desfeita. A categoria só poderá ser excluída se não houver reuniões vinculadas a ela.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteTagOpen(false)
              setTagToDelete(null)
            }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteTag}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Reunioes
