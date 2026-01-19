import { useState, useEffect } from "react"

const API_URL = "http://localhost:3032/api"

interface Category {
  id: number
  name: string
  icon: string
  color: string
  display_order: number
}

interface ImportantDate {
  id: number
  user_id?: number
  date: string
  year: number
  title: string
  description?: string
  link?: string
  created_at: string
  updated_at: string
  tags: Category[]
}

export const useImportantDates = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [dates, setDates] = useState<ImportantDate[]>([])
  const [years, setYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/important-dates-categories`)
      if (!response.ok) throw new Error("Erro ao carregar categorias")
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    }
  }

  const fetchYears = async () => {
    try {
      const response = await fetch(`${API_URL}/important-dates-years`)
      if (!response.ok) throw new Error("Erro ao carregar anos")
      const data = await response.json()
      setYears(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    }
  }

  const fetchDates = async (year?: number, categoryId?: number, searchTerm?: string) => {
    try {
      setLoading(true)
      let url = `${API_URL}/important-dates`
      const params = new URLSearchParams()

      if (year) params.append("year", year.toString())
      if (categoryId) params.append("category_id", categoryId.toString())
      if (searchTerm) params.append("search", searchTerm)

      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      if (!response.ok) throw new Error("Erro ao carregar datas importantes")
      const data = await response.json()
      setDates(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchYears()
    fetchDates()
  }, [])

  const createDate = async (dateData: {
    date: string
    title: string
    description?: string
    link?: string
    tags?: number[]
  }) => {
    try {
      const response = await fetch(`${API_URL}/important-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dateData),
      })
      if (!response.ok) throw new Error("Erro ao criar data importante")
      await fetchDates()
      await fetchYears()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateDate = async (
    id: number,
    updates: {
      date?: string
      title?: string
      description?: string
      link?: string
      tags?: number[]
    }
  ) => {
    try {
      const response = await fetch(`${API_URL}/important-dates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar data importante")
      await fetchDates()
      await fetchYears()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const deleteDate = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/important-dates/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir data importante")
      setDates(dates.filter((d) => d.id !== id))
      await fetchYears()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  return {
    categories,
    dates,
    years,
    loading,
    error,
    fetchDates,
    createDate,
    updateDate,
    deleteDate,
    refresh: () => {
      fetchCategories()
      fetchYears()
      fetchDates()
    },
  }
}
