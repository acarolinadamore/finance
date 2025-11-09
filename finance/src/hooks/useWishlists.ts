import { useState, useEffect } from "react"

const API_URL = "http://localhost:3032/api"

interface ItemPrice {
  id: number
  item_id: number
  price: number
  link?: string
  store_name?: string
  selected: boolean
  created_at: string
  updated_at: string
}

interface WishlistItem {
  id: number
  wishlist_id: number
  name: string
  price?: number
  link?: string
  checked: boolean
  selected: boolean
  prices: ItemPrice[]
  created_at: string
  updated_at: string
}

interface Wishlist {
  id: number
  name: string
  items: WishlistItem[]
  created_at: string
  updated_at: string
}

export const useWishlists = () => {
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWishlists = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/wishlists`)
      if (!response.ok) throw new Error("Erro ao carregar wishlists")
      const data = await response.json()
      setWishlists(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlists()
  }, [])

  const createWishlist = async (name: string) => {
    try {
      const response = await fetch(`${API_URL}/wishlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error("Erro ao criar wishlist")
      const newWishlist = await response.json()
      setWishlists([newWishlist, ...wishlists])
      return newWishlist
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateWishlist = async (id: number, name: string) => {
    try {
      const response = await fetch(`${API_URL}/wishlists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error("Erro ao atualizar wishlist")
      const updated = await response.json()
      setWishlists(
        wishlists.map((w) =>
          w.id === id ? { ...w, name: updated.name } : w
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const deleteWishlist = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/wishlists/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir wishlist")
      setWishlists(wishlists.filter((w) => w.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const addItem = async (
    wishlistId: number,
    item: { name: string; price?: number; link?: string }
  ) => {
    try {
      const response = await fetch(`${API_URL}/wishlists/${wishlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
      if (!response.ok) throw new Error("Erro ao adicionar item")
      const newItem = await response.json()
      setWishlists(
        wishlists.map((w) =>
          w.id === wishlistId ? { ...w, items: [...w.items, newItem] } : w
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
    updates: { name?: string; price?: number; link?: string; checked?: boolean; selected?: boolean }
  ) => {
    try {
      const response = await fetch(`${API_URL}/wishlist-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar item")
      const updatedItem = await response.json()
      setWishlists(
        wishlists.map((w) => ({
          ...w,
          items: w.items.map((item) =>
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
      const response = await fetch(`${API_URL}/wishlist-items/${itemId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir item")
      setWishlists(
        wishlists.map((w) => ({
          ...w,
          items: w.items.filter((item) => item.id !== itemId),
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const reorderWishlists = async (newOrder: Wishlist[]) => {
    const orders = newOrder.map((wishlist, index) => ({
      id: wishlist.id,
      display_order: index,
    }))

    // Atualiza otimisticamente
    setWishlists(newOrder)

    try {
      const response = await fetch(`${API_URL}/wishlists/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      })
      if (!response.ok) throw new Error("Erro ao reordenar")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      // Reverte em caso de erro
      fetchWishlists()
      throw err
    }
  }

  const addPrice = async (
    itemId: number,
    price: { price: number; link?: string; store_name?: string }
  ) => {
    try {
      const response = await fetch(`${API_URL}/wishlist-items/${itemId}/prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(price),
      })
      if (!response.ok) throw new Error("Erro ao adicionar preço")
      const newPrice = await response.json()
      setWishlists(
        wishlists.map((w) => ({
          ...w,
          items: w.items.map((item) =>
            item.id === itemId
              ? { ...item, prices: [...(item.prices || []), newPrice] }
              : item
          ),
        }))
      )
      return newPrice
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updatePrice = async (
    priceId: number,
    updates: { price?: number; link?: string; store_name?: string; selected?: boolean }
  ) => {
    try {
      const response = await fetch(`${API_URL}/wishlist-item-prices/${priceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar preço")
      const updatedPrice = await response.json()
      setWishlists(
        wishlists.map((w) => ({
          ...w,
          items: w.items.map((item) => ({
            ...item,
            prices: (item.prices || []).map((p) =>
              p.id === priceId ? updatedPrice : p
            ),
          })),
        }))
      )
      return updatedPrice
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const togglePriceSelected = async (priceId: number, selected: boolean) => {
    return updatePrice(priceId, { selected })
  }

  const deletePrice = async (priceId: number) => {
    try {
      const response = await fetch(`${API_URL}/wishlist-item-prices/${priceId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir preço")
      setWishlists(
        wishlists.map((w) => ({
          ...w,
          items: w.items.map((item) => ({
            ...item,
            prices: (item.prices || []).filter((p) => p.id !== priceId),
          })),
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  return {
    wishlists,
    loading,
    error,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    addItem,
    updateItem,
    toggleItemCheck,
    toggleItemSelected,
    deleteItem,
    addPrice,
    updatePrice,
    togglePriceSelected,
    deletePrice,
    reorderWishlists,
    refresh: fetchWishlists,
  }
}
