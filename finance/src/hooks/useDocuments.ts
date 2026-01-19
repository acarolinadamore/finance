import { useState, useEffect } from "react"

const API_URL = "http://localhost:3032/api"

interface DocumentCategory {
  id: number
  name: string
  description?: string
  icon: string
  color: string
  display_order: number
}

interface Document {
  id: number
  category_id?: number
  category_name?: string
  category_color?: string
  category_icon?: string
  name: string
  description?: string
  file_name: string
  file_type: string
  file_size?: number
  file_data?: string
  has_file?: boolean
  tags?: string[]
  created_at: string
  updated_at: string
}

export const useDocuments = () => {
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/document-categories`)
      if (!response.ok) throw new Error("Erro ao carregar categorias")
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    }
  }

  const fetchDocuments = async (categoryId?: number, searchTerm?: string) => {
    try {
      setLoading(true)
      let url = `${API_URL}/documents`
      const params = new URLSearchParams()

      if (categoryId) params.append("category_id", categoryId.toString())
      if (searchTerm) params.append("search", searchTerm)

      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      if (!response.ok) throw new Error("Erro ao carregar documentos")
      const data = await response.json()
      setDocuments(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchDocuments()
  }, [])

  const createDocument = async (document: {
    category_id?: number
    name: string
    description?: string
    file_name: string
    file_type: string
    file_size?: number
    file_data: string
    tags?: string[]
  }) => {
    try {
      const response = await fetch(`${API_URL}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(document),
      })
      if (!response.ok) throw new Error("Erro ao criar documento")
      const newDoc = await response.json()
      await fetchDocuments() // Recarregar lista
      return newDoc
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const getDocument = async (id: number): Promise<Document> => {
    try {
      const response = await fetch(`${API_URL}/documents/${id}`)
      if (!response.ok) throw new Error("Erro ao buscar documento")
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateDocument = async (
    id: number,
    updates: {
      category_id?: number
      name?: string
      description?: string
      tags?: string[]
    }
  ) => {
    try {
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar documento")
      await fetchDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const deleteDocument = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir documento")
      setDocuments(documents.filter((d) => d.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const createCategory = async (category: {
    name: string
    description?: string
    icon: string
    color: string
  }) => {
    try {
      const response = await fetch(`${API_URL}/document-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      })
      if (!response.ok) throw new Error("Erro ao criar categoria")
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateCategory = async (
    id: number,
    updates: {
      name?: string
      description?: string
      color?: string
    }
  ) => {
    try {
      const response = await fetch(`${API_URL}/document-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar categoria")
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/document-categories/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao excluir categoria")
      }
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  return {
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
    refresh: () => {
      fetchCategories()
      fetchDocuments()
    },
  }
}
