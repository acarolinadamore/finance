import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Plus, Heart, Check, ExternalLink } from 'lucide-react-native';
import { api } from '../../services/api';
import { WishlistItem } from '../../types';

export default function WishlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.get<WishlistItem[]>('/wishlist');
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePurchased = async (item: WishlistItem) => {
    try {
      await api.patch(`/wishlist/${item.id}/toggle`);
      setItems(items.map(i =>
        i.id === item.id ? { ...i, purchased: !i.purchased } : i
      ));
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const pendingItems = items.filter(i => !i.purchased);
  const purchasedItems = items.filter(i => i.purchased);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Lista de desejos */}
      <ScrollView style={styles.content}>
        {pendingItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Desejos ({pendingItems.length})</Text>
            {pendingItems.map(item => (
              <TouchableOpacity key={item.id} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.itemDescription} numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                    {item.price && (
                      <Text style={styles.itemPrice}>
                        R$ {item.price.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => togglePurchased(item)}
                  >
                    <Heart color="#ec4899" size={24} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {purchasedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comprados ({purchasedItems.length})</Text>
            {purchasedItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, styles.purchasedCard]}
                onPress={() => togglePurchased(item)}
              >
                <View style={styles.itemContent}>
                  <Check color="#10b981" size={24} />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, styles.purchasedText]}>{item.name}</Text>
                    {item.price && (
                      <Text style={[styles.itemPrice, styles.purchasedText]}>
                        R$ {item.price.toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {items.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Heart color="#9ca3af" size={48} />
            <Text style={styles.emptyText}>Nenhum desejo cadastrado</Text>
            <Text style={styles.emptySubtext}>Toque no + para adicionar um item</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ec4899',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  purchasedCard: {
    opacity: 0.7,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 4,
  },
  checkButton: {
    padding: 8,
  },
  purchasedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});
