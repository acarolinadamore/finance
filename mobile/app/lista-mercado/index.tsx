import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Plus, ShoppingCart, Check, Circle } from 'lucide-react-native';
import { api } from '../../services/api';
import { ShoppingList, ShoppingItem } from '../../types';

export default function ListaMercadoScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.get<ShoppingItem[]>('/shopping-items');
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (item: ShoppingItem) => {
    try {
      await api.patch(`/shopping-items/${item.id}/toggle`);
      setItems(items.map(i =>
        i.id === item.id ? { ...i, checked: !i.checked } : i
      ));
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  const addItem = async () => {
    if (!newItemText.trim()) return;
    try {
      const newItem = await api.post<ShoppingItem>('/shopping-items', {
        name: newItemText,
        quantity: 1,
      });
      setItems([...items, newItem]);
      setNewItemText('');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const pendingItems = items.filter(i => !i.checked);
  const checkedItems = items.filter(i => i.checked);
  const total = items.reduce((sum, i) => sum + (i.estimatedPrice || 0) * (i.quantity || 1), 0);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lista de Mercado</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Total estimado */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Estimado</Text>
        <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
      </View>

      {/* Input para novo item */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Adicionar item..."
          value={newItemText}
          onChangeText={setNewItemText}
          onSubmitEditing={addItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Plus color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Lista de itens */}
      <ScrollView style={styles.content}>
        {pendingItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>A Comprar ({pendingItems.length})</Text>
            {pendingItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                onPress={() => toggleItem(item)}
              >
                <Circle color="#9ca3af" size={24} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity || 1} {item.unit || 'un'}
                  </Text>
                </View>
                {item.estimatedPrice && (
                  <Text style={styles.itemPrice}>
                    R$ {(item.estimatedPrice * (item.quantity || 1)).toFixed(2)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {checkedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>No Carrinho ({checkedItems.length})</Text>
            {checkedItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, styles.checkedCard]}
                onPress={() => toggleItem(item)}
              >
                <Check color="#14b8a6" size={24} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, styles.checkedText]}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {items.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <ShoppingCart color="#9ca3af" size={48} />
            <Text style={styles.emptyText}>Lista vazia</Text>
            <Text style={styles.emptySubtext}>Adicione itens para sua compra</Text>
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
  totalContainer: {
    backgroundColor: '#14b8a6',
    padding: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#14b8a6',
    borderRadius: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkedCard: {
    opacity: 0.7,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#1f2937',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6',
  },
  checkedText: {
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
