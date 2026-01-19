import { useState, useEffect } from "react"

const API_URL = "http://localhost:3032/api"

export interface Tag {
  id: number
  name: string
  color: string
  created_at?: string
}

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/tags`)
      if (!response.ok) throw new Error("Erro ao carregar tags")
      const data = await response.json()
      setTags(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const createTag = async (tag: { name: string; color?: string }) => {
    try {
      const response = await fetch(`${API_URL}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tag),
      })
      if (!response.ok) throw new Error("Erro ao criar tag")
      const newTag = await response.json()
      setTags([...tags, newTag])
      return newTag
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const linkTagToGoal = async (goalId: number, tagId: number) => {
    try {
      const response = await fetch(`${API_URL}/goals/${goalId}/tags/${tagId}`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Erro ao vincular tag à meta")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const unlinkTagFromGoal = async (goalId: number, tagId: number) => {
    try {
      const response = await fetch(`${API_URL}/goals/${goalId}/tags/${tagId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao desvincular tag da meta")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const linkTagToDream = async (dreamId: number, tagId: number) => {
    try {
      const response = await fetch(`${API_URL}/dreams/${dreamId}/tags/${tagId}`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Erro ao vincular tag ao sonho")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const unlinkTagFromDream = async (dreamId: number, tagId: number) => {
    try {
      const response = await fetch(`${API_URL}/dreams/${dreamId}/tags/${tagId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao desvincular tag do sonho")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  return {
    tags,
    loading,
    error,
    createTag,
    linkTagToGoal,
    unlinkTagFromGoal,
    linkTagToDream,
    unlinkTagFromDream,
    refresh: fetchTags,
  }
}
