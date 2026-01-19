import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Upload,
  Search,
  FileText,
  Download,
  Trash2,
  FolderOpen,
  File,
  Image as ImageIcon,
  User,
  Users,
  Scale,
  Heart,
  DollarSign,
  Home as HomeIcon,
  Folder,
  Filter,
  X,
  Briefcase,
  Eye,
  Edit,
  Plus,
  Settings,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { UploadDocumentDialog } from '@/components/UploadDocumentDialog';
import { DocumentViewerDialog } from '@/components/DocumentViewerDialog';
import { EditDocumentDialog } from '@/components/EditDocumentDialog';
import { CreateCategoryDialog } from '@/components/CreateCategoryDialog';
import { EditCategoryDialog } from '@/components/EditCategoryDialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const categoryIcons: { [key: string]: any } = {
  User,
  Users,
  FileText,
  Scale,
  Heart,
  DollarSign,
  Home: HomeIcon,
  Folder,
  Briefcase,
  Image: ImageIcon,
};

const Documentos = () => {
  const {
    categories,
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useDocuments();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [editDocDialogOpen, setEditDocDialogOpen] = useState(false);
  const [createCatDialogOpen, setCreateCatDialogOpen] = useState(false);
  const [editCatDialogOpen, setEditCatDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  const [deleteDocDialogOpen, setDeleteDocDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [documentToView, setDocumentToView] = useState<number | null>(null);
  const [documentToEdit, setDocumentToEdit] = useState<any>(null);

  const [deleteCatDialogOpen, setDeleteCatDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);

  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    fetchDocuments(selectedCategory, searchTerm);
  }, [selectedCategory, searchTerm]);

  const handleCategoryClick = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(undefined);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Document actions
  const handleViewDocument = (documentId: number) => {
    setDocumentToView(documentId);
    setViewerDialogOpen(true);
  };

  const handleEditDocument = (document: any) => {
    setDocumentToEdit(document);
    setEditDocDialogOpen(true);
  };

  const handleDeleteDocClick = (documentId: number) => {
    setDocumentToDelete(documentId);
    setDeleteDocDialogOpen(true);
  };

  const handleDeleteDocConfirm = async () => {
    if (documentToDelete) {
      try {
        await deleteDocument(documentToDelete);
        setDeleteDocDialogOpen(false);
        setDocumentToDelete(null);
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
      }
    }
  };

  const handleDownload = async (documentId: number, fileName: string) => {
    try {
      setDownloading(documentId);
      const document = await getDocument(documentId);

      if (!document.file_data) {
        alert('Arquivo não encontrado');
        return;
      }

      const byteCharacters = atob(document.file_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: document.file_type });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      alert('Erro ao baixar documento. Tente novamente.');
    } finally {
      setDownloading(null);
    }
  };

  const handlePrint = async (documentId: number) => {
    try {
      const document = await getDocument(documentId);

      if (!document.file_data) {
        alert('Arquivo não encontrado');
        return;
      }

      const byteCharacters = atob(document.file_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: document.file_type });
      const url = window.URL.createObjectURL(blob);

      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Erro ao imprimir documento:', error);
      alert('Erro ao imprimir documento. Tente novamente.');
    }
  };

  // Category actions
  const handleEditCategory = (category: any) => {
    setCategoryToEdit(category);
    setEditCatDialogOpen(true);
  };

  const handleDeleteCatClick = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setDeleteCatDialogOpen(true);
  };

  const handleDeleteCatConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        setDeleteCatDialogOpen(false);
        setCategoryToDelete(null);
      } catch (error: any) {
        console.error('Erro ao excluir categoria:', error);
        alert(error.message || 'Erro ao excluir categoria. Tente novamente.');
      }
    }
  };

  // Helper functions
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-10 w-10 text-blue-500" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-10 w-10 text-red-500" />;
    }
    if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-10 w-10 text-green-600" />;
    }
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <Presentation className="h-10 w-10 text-orange-500" />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-10 w-10 text-blue-600" />;
    }
    return <FileText className="h-10 w-10 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Documentos Importantes</h1>
            <p className="text-muted-foreground text-sm">
              Seus documentos importantes sempre à mão
            </p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Documento
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Categorias */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Categorias</h2>
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(undefined)}
                  className="h-7"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar filtro
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateCatDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Categoria
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((category) => {
              const Icon = categoryIcons[category.icon] || Folder;
              const isSelected = selectedCategory === category.id;

              return (
                <div key={category.id} className="relative group">
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: isSelected ? category.color : undefined,
                    }}
                  >
                    <Icon
                      className="h-6 w-6 mx-auto mb-2"
                      style={{ color: category.color }}
                    />
                    <p className="text-xs font-medium text-center line-clamp-2">
                      {category.name}
                    </p>
                  </button>

                  {/* Menu de opções da categoria */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteCatClick(category.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar documentos por nome, descrição ou tags..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name
                : 'Todos os Documentos'}
            </CardTitle>
            <CardDescription>
              {documents.length} {documents.length === 1 ? 'documento' : 'documentos'} encontrado
              {documents.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando documentos...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <File className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-muted-foreground mb-2">Nenhum documento encontrado</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || selectedCategory
                    ? 'Tente ajustar os filtros de busca'
                    : 'Adicione seu primeiro documento clicando no botão acima'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Ícone do arquivo */}
                      <div className="flex-shrink-0">
                        {getFileIcon(document.file_type)}
                      </div>

                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{document.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {document.file_name}
                            </p>
                          </div>
                          {document.category_name && (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: document.category_color,
                                color: document.category_color,
                              }}
                            >
                              {document.category_name}
                            </Badge>
                          )}
                        </div>

                        {document.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {document.description}
                          </p>
                        )}

                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {document.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatFileSize(document.file_size)}</span>
                          <span>Adicionado em {formatDate(document.created_at)}</span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(document.id)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDocument(document)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(document.id, document.file_name)}
                          disabled={downloading === document.id}
                          title="Baixar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(document.id)}
                          title="Imprimir"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocClick(document.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        categories={categories}
        onUpload={createDocument}
      />

      <DocumentViewerDialog
        documentId={documentToView}
        open={viewerDialogOpen}
        onOpenChange={setViewerDialogOpen}
        onGetDocument={getDocument}
      />

      <EditDocumentDialog
        document={documentToEdit}
        open={editDocDialogOpen}
        onOpenChange={setEditDocDialogOpen}
        categories={categories}
        onUpdate={updateDocument}
      />

      <CreateCategoryDialog
        open={createCatDialogOpen}
        onOpenChange={setCreateCatDialogOpen}
        onCreate={createCategory}
      />

      <EditCategoryDialog
        category={categoryToEdit}
        open={editCatDialogOpen}
        onOpenChange={setEditCatDialogOpen}
        onUpdate={updateCategory}
      />

      {/* Delete Document Confirmation */}
      <AlertDialog open={deleteDocDialogOpen} onOpenChange={setDeleteDocDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O documento será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocConfirm} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={deleteCatDialogOpen} onOpenChange={setDeleteCatDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria será permanentemente excluída.
              Certifique-se de que não há documentos nesta categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCatConfirm} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documentos;
