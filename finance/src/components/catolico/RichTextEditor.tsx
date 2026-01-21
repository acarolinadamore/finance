import { useRef, useState } from "react"
import { Bold, Highlighter, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  style?: React.CSSProperties
  actionButtons?: (isEditing: boolean) => React.ReactNode
}

export const RichTextEditor = ({ value, onChange, className = "", style = {}, actionButtons }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showPreview, setShowPreview] = useState(true)

  // Converter markdown para HTML para preview
  const markdownToHtml = (text: string): string => {
    let html = text

    // Escapar HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // Processar negrito (**texto**)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    // Processar marca texto (==texto==)
    html = html.replace(/==(.+?)==/g, '<mark style="background-color: #fef08a; padding: 2px 4px;">$1</mark>')

    // Converter quebras de linha
    html = html.replace(/\n/g, '<br>')

    return html
  }

  // Aplicar/remover negrito
  const toggleBold = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start === end) {
      alert('Selecione um texto primeiro')
      return
    }

    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    let newText: string
    let newCursorPos: number

    // Verificar se já está formatado
    if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
      // Remover formatação
      const unwrapped = selectedText.substring(2, selectedText.length - 2)
      newText = beforeText + unwrapped + afterText
      newCursorPos = start + unwrapped.length
    } else if (beforeText.endsWith('**') && afterText.startsWith('**')) {
      // Está entre marcadores, remover
      const newBefore = beforeText.substring(0, beforeText.length - 2)
      const newAfter = afterText.substring(2)
      newText = newBefore + selectedText + newAfter
      newCursorPos = start - 2 + selectedText.length
    } else {
      // Adicionar formatação
      newText = beforeText + '**' + selectedText + '**' + afterText
      newCursorPos = start + 2 + selectedText.length + 2
    }

    onChange(newText)

    // Restaurar foco e posição do cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Aplicar/remover marca texto
  const toggleHighlight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start === end) {
      alert('Selecione um texto primeiro')
      return
    }

    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    let newText: string
    let newCursorPos: number

    // Verificar se já está formatado
    if (selectedText.startsWith('==') && selectedText.endsWith('==')) {
      // Remover formatação
      const unwrapped = selectedText.substring(2, selectedText.length - 2)
      newText = beforeText + unwrapped + afterText
      newCursorPos = start + unwrapped.length
    } else if (beforeText.endsWith('==') && afterText.startsWith('==')) {
      // Está entre marcadores, remover
      const newBefore = beforeText.substring(0, beforeText.length - 2)
      const newAfter = afterText.substring(2)
      newText = newBefore + selectedText + newAfter
      newCursorPos = start - 2 + selectedText.length
    } else {
      // Adicionar formatação
      newText = beforeText + '==' + selectedText + '==' + afterText
      newCursorPos = start + 2 + selectedText.length + 2
    }

    onChange(newText)

    // Restaurar foco e posição do cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className="space-y-2 flex-1 flex flex-col">
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleBold}
            title="Negrito"
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleHighlight}
            title="Marca Texto"
            className="h-8 w-8 p-0"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            title="Visualizar formatação"
            className="h-8 px-3"
          >
            <Eye className="h-4 w-4 mr-1" />
            {showPreview ? 'Editar' : 'Visualizar'}
          </Button>
        </div>
        {actionButtons && actionButtons(!showPreview)}
      </div>

      {showPreview ? (
        <div
          className={`border rounded-md p-3 overflow-auto bg-white ${className}`}
          style={{
            minHeight: '600px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Lora, serif',
            fontSize: '16px',
            lineHeight: '1.6',
            ...style
          }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
        />
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 resize-y text-base leading-relaxed ${className}`}
          style={{
            minHeight: '600px',
            fontFamily: 'Lora, serif',
            ...style
          }}
        />
      )}
    </div>
  )
}
