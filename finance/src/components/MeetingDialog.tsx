import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateMeeting, useUpdateMeeting } from '@/hooks/useMeetings';
import type { ApiMeeting, ApiMeetingTag, MeetingAttachment } from '@/services/api';
import { Upload, X, FileText, Image as ImageIcon, Plus } from 'lucide-react';

interface MeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: ApiMeeting | null;
  tags: ApiMeetingTag[];
  defaultTagId?: number;
}

export function MeetingDialog({
  open,
  onOpenChange,
  meeting,
  tags,
  defaultTagId,
}: MeetingDialogProps) {
  const [formData, setFormData] = useState({
    tag_id: defaultTagId || (tags[0]?.id || 0),
    meeting_date: '',
    meeting_time: '',
    title: '',
    summary: '',
    description: '',
    participants: '',
    my_definitions: '',
    participant_definitions: '',
    decisions: '',
    next_steps: '',
    pending: '',
  });

  const [links, setLinks] = useState<{ url: string }[]>([]);

  const [attachments, setAttachments] = useState<MeetingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();

  useEffect(() => {
    if (open && meeting) {
      setFormData({
        tag_id: meeting.tag_id,
        meeting_date: formatDateForInput(meeting.meeting_date),
        meeting_time: meeting.meeting_time || '',
        title: meeting.title,
        summary: meeting.summary || '',
        description: meeting.description || '',
        participants: meeting.participants || '',
        my_definitions: meeting.my_definitions || '',
        participant_definitions: meeting.participant_definitions || '',
        decisions: meeting.decisions || '',
        next_steps: meeting.next_steps || '',
        pending: meeting.pending || '',
      });
      setLinks(meeting.links || []);
      setAttachments(meeting.attachments || []);
    } else if (open && !meeting) {
      setFormData({
        tag_id: defaultTagId || (tags[0]?.id || 0),
        meeting_date: '',
        meeting_time: '',
        title: '',
        summary: '',
        description: '',
        participants: '',
        my_definitions: '',
        participant_definitions: '',
        decisions: '',
        next_steps: '',
        pending: '',
      });
      setLinks([]);
      setAttachments([]);
    }
  }, [open, meeting, tags, defaultTagId]);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const newAttachments: MeetingAttachment[] = [];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];

      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Tipo de arquivo não suportado`);
        continue;
      }

      if (file.size > maxSize) {
        alert(`${file.name}: Arquivo muito grande (máximo 10MB)`);
        continue;
      }

      try {
        const base64Data = await convertFileToBase64(file);
        newAttachments.push({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_data: base64Data,
        });
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        alert(`Erro ao processar ${file.name}`);
      }
    }

    setAttachments([...attachments, ...newAttachments]);

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Por favor, insira um título para a reunião');
      return;
    }

    if (!formData.meeting_date) {
      alert('Por favor, selecione uma data');
      return;
    }

    if (!formData.tag_id) {
      alert('Por favor, selecione uma tag');
      return;
    }

    try {
      const dataToSave = {
        tag_id: formData.tag_id,
        meeting_date: formData.meeting_date,
        meeting_time: formData.meeting_time || undefined,
        title: formData.title.trim(),
        summary: formData.summary || undefined,
        description: formData.description || undefined,
        participants: formData.participants || undefined,
        links: links.length > 0 ? links : undefined,
        my_definitions: formData.my_definitions || undefined,
        participant_definitions: formData.participant_definitions || undefined,
        decisions: formData.decisions || undefined,
        next_steps: formData.next_steps || undefined,
        pending: formData.pending || undefined,
        attachments: attachments,
      };

      if (meeting) {
        await updateMeeting.mutateAsync({ id: meeting.id, data: dataToSave });
      } else {
        await createMeeting.mutateAsync(dataToSave as any);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar reunião:', error);
    }
  };

  const handleAddLink = () => {
    setLinks([...links, { url: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { url: value };
    setLinks(newLinks);
  };

  const handleClose = () => {
    setFormData({
      tag_id: defaultTagId || (tags[0]?.id || 0),
      meeting_date: '',
      meeting_time: '',
      title: '',
      summary: '',
      description: '',
      participants: '',
      my_definitions: '',
      participant_definitions: '',
      decisions: '',
      next_steps: '',
      pending: '',
    });
    setLinks([]);
    setAttachments([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meeting ? 'Editar Reunião' : 'Nova Reunião'}</DialogTitle>
          <DialogDescription>
            Preencha as informações da reunião
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tag */}
          <div className="space-y-2">
            <Label htmlFor="tag">Categoria *</Label>
            <Select
              value={formData.tag_id.toString()}
              onValueChange={(value) => setFormData({ ...formData, tag_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.meeting_date}
                onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora (opcional)</Label>
              <Input
                id="time"
                type="time"
                value={formData.meeting_time}
                onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
              />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Reunião com cliente, Sprint Planning..."
            />
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <Label htmlFor="summary">Resumo (opcional)</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Breve resumo da reunião..."
              rows={2}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes sobre a reunião..."
              rows={3}
            />
          </div>

          {/* Participantes */}
          <div className="space-y-2">
            <Label htmlFor="participants">Participantes (opcional)</Label>
            <Input
              id="participants"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              placeholder="Ex: João, Maria, Pedro..."
            />
          </div>

          {/* Links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Links (opcional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLink}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Link
              </Button>
            </div>
            {links.length > 0 && (
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      placeholder="Ex: https://meet.google.com/..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Definições da Minha Parte */}
          <div className="space-y-2">
            <Label htmlFor="my_definitions">Definições da Minha Parte (opcional)</Label>
            <Textarea
              id="my_definitions"
              value={formData.my_definitions}
              onChange={(e) => setFormData({ ...formData, my_definitions: e.target.value })}
              placeholder="Minhas definições e compromissos..."
              rows={3}
            />
          </div>

          {/* Definições do Participante */}
          <div className="space-y-2">
            <Label htmlFor="participant_definitions">Definições do Participante (opcional)</Label>
            <Textarea
              id="participant_definitions"
              value={formData.participant_definitions}
              onChange={(e) => setFormData({ ...formData, participant_definitions: e.target.value })}
              placeholder="Definições e compromissos dos participantes..."
              rows={3}
            />
          </div>

          {/* Decisões/Combinados */}
          <div className="space-y-2">
            <Label htmlFor="decisions">Decisões/Combinados (opcional)</Label>
            <Textarea
              id="decisions"
              value={formData.decisions}
              onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
              placeholder="Decisões tomadas e acordos estabelecidos..."
              rows={3}
            />
          </div>

          {/* Próximos Passos */}
          <div className="space-y-2">
            <Label htmlFor="next_steps">Próximos Passos (opcional)</Label>
            <Textarea
              id="next_steps"
              value={formData.next_steps}
              onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
              placeholder="Próximos passos e itens de ação..."
              rows={3}
            />
          </div>

          {/* Pendência */}
          <div className="space-y-2">
            <Label htmlFor="pending">Pendência (opcional)</Label>
            <Textarea
              id="pending"
              value={formData.pending}
              onChange={(e) => setFormData({ ...formData, pending: e.target.value })}
              placeholder="Itens pendentes ou acompanhamentos..."
              rows={3}
            />
          </div>

          {/* Upload de Arquivos */}
          <div className="space-y-2">
            <Label>Anexos (opcional)</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Arquivos
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                PDF, imagens, Word, Excel - máximo 10MB por arquivo
              </p>
            </div>

            {/* Lista de anexos */}
            {attachments.length > 0 && (
              <div className="space-y-2 mt-3">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded bg-muted"
                  >
                    {getFileIcon(attachment.file_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.file_size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={createMeeting.isPending || updateMeeting.isPending}
          >
            {createMeeting.isPending || updateMeeting.isPending
              ? 'Salvando...'
              : meeting
              ? 'Salvar Alterações'
              : 'Criar Reunião'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
