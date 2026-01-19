import { useState, useEffect } from "react"

const API_URL = "http://localhost:3032/api"

interface LinkedGoal {
  id: number
  title: string
  progress: number
  life_area_color?: string
}

interface Dream {
  id: number
  title: string
  description?: string
  image?: string
  deadline?: string
  life_area_id?: number
  life_area_name?: string
  life_area_color?: string
  prazo_tipo?: 'curto' | 'medio' | 'longo'
  linked_goals?: LinkedGoal[]
  created_at: string
  updated_at: string
}

export const useDreams = () => {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDreams = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/dreams`)
      if (!response.ok) throw new Error("Erro ao carregar sonhos")
      const data = await response.json()
      setDreams(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDreams()
  }, [])

  const createDream = async (dream: {
    title: string
    description?: string
    image?: string
    deadline?: string
    life_area_id?: number
    prazo_tipo?: 'curto' | 'medio' | 'longo'
  }) => {
    try {
      const response = await fetch(`${API_URL}/dreams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dream),
      })
      if (!response.ok) throw new Error("Erro ao criar sonho")
      const newDream = await response.json()
      setDreams([newDream, ...dreams])
      return newDream
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateDream = async (
    id: number,
    updates: {
      title?: string
      description?: string
      image?: string
      deadline?: string
      life_area_id?: number
      prazo_tipo?: 'curto' | 'medio' | 'longo'
    }
  ) => {
    try {
      const response = await fetch(`${API_URL}/dreams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar sonho")
      const updated = await response.json()
      setDreams(dreams.map((d) => (d.id === id ? { ...d, ...updated } : d)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const deleteDream = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/dreams/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir sonho")
      setDreams(dreams.filter((d) => d.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const reorderDreams = async (orders: { id: number; display_order: number }[]) => {
    try {
      const response = await fetch(`${API_URL}/dreams/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      })
      if (!response.ok) throw new Error("Erro ao reordenar sonhos")
      // Atualizar lista local
      await fetchDreams()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const linkGoal = async (dreamId: number, goalId: number) => {
    try {
      const response = await fetch(`${API_URL}/dreams/${dreamId}/goals/${goalId}`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Erro ao vincular meta")
      // Atualizar lista local
      await fetchDreams()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const unlinkGoal = async (dreamId: number, goalId: number) => {
    try {
      const response = await fetch(`${API_URL}/dreams/${dreamId}/goals/${goalId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao desvincular meta")
      // Atualizar lista local
      await fetchDreams()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  return {
    dreams,
    loading,
    error,
    createDream,
    updateDream,
    deleteDream,
    reorderDreams,
    linkGoal,
    unlinkGoal,
    refresh: fetchDreams,
  }
}
