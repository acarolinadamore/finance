import { useState, useEffect } from "react"

const API_URL = "http://localhost:3032/api"

interface ShoppingListItem {
  id: number
  list_id: number
  name: string
  price?: number
  checked: boolean
  selected: boolean
  created_at: string
  updated_at: string
}

interface ShoppingList {
  id: number
  name: string
  items: ShoppingListItem[]
  created_at: string
  updated_at: string
}

export const useShoppingLists = () => {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLists = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/shopping-lists`)
      if (!response.ok) throw new Error("Erro ao carregar listas")
      const data = await response.json()
      setLists(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLists()
  }, [])

  const createList = async (name: string) => {
    try {
      const response = await fetch(`${API_URL}/shopping-lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error("Erro ao criar lista")
      const newList = await response.json()
      setLists([newList, ...lists])
      return newList
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateList = async (id: number, name: string) => {
    try {
      const response = await fetch(`${API_URL}/shopping-lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error("Erro ao atualizar lista")
      const updated = await response.json()
      setLists(
        lists.map((list) =>
          list.id === id ? { ...list, name: updated.name } : list
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const deleteList = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/shopping-lists/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir lista")
      setLists(lists.filter((list) => list.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const addItem = async (
    listId: number,
    item: { name: string; price?: number }
  ) => {
    try {
      const response = await fetch(`${API_URL}/shopping-lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
      if (!response.ok) throw new Error("Erro ao adicionar item")
      const newItem = await response.json()
      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, items: [...list.items, newItem] } : list
        )
      )
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateItem = async (
    itemId: number,
    updates: { name?: string; price?: number; checked?: boolean; selected?: boolean }
  ) => {
    try {
      const response = await fetch(`${API_URL}/shopping-list-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar item")
      const updatedItem = await response.json()
      setLists(
        lists.map((list) => ({
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? updatedItem : item
          ),
        }))
      )
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const toggleItemCheck = async (itemId: number, checked: boolean) => {
    return updateItem(itemId, { checked })
  }

  const toggleItemSelected = async (itemId: number, selected: boolean) => {
    return updateItem(itemId, { selected })
  }

  const deleteItem = async (itemId: number) => {
    try {
      const response = await fetch(`${API_URL}/shopping-list-items/${itemId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir item")
      setLists(
        lists.map((list) => ({
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const reorderLists = async (newOrder: ShoppingList[]) => {
    const orders = newOrder.map((list, index) => ({
      id: list.id,
      display_order: index,
    }))

    // Atualiza otimisticamente
    setLists(newOrder)

    try {
      const response = await fetch(`${API_URL}/shopping-lists/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      })
      if (!response.ok) throw new Error("Erro ao reordenar")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      // Reverte em caso de erro
      fetchLists()
      throw err
    }
  }

  return {
    lists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    toggleItemCheck,
    toggleItemSelected,
    deleteItem,
    reorderLists,
    refresh: fetchLists,
  }
}
