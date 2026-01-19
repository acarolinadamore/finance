import { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  Plus,
  Check,
  Circle,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useTodoLists, TodoList, TodoListItem } from '../../hooks/useTodoLists';

export default function TodoListScreen() {
  const router = useRouter();
  const {
    lists,
    loading,
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    toggleItemCheck,
    deleteItem,
    reorderItems,
  } = useTodoLists();

  // Bottom Sheet refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['35%'], []);

  // Sheet state
  const [sheetType, setSheetType] = useState<'createList' | 'editList' | 'addItem' | 'editItem' | null>(null);
  const [isListMenuOpen, setIsListMenuOpen] = useState<number | null>(null);

  // Form states
  const [newListName, setNewListName] = useState('');
  const [editListName, setEditListName] = useState('');
  const [editingList, setEditingList] = useState<TodoList | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editingItem, setEditingItem] = useState<TodoListItem | null>(null);
  const [collapsedLists, setCollapsedLists] = useState<number[]>([]);

  const openSheet = (type: typeof sheetType) => {
    setSheetType(type);
    bottomSheetRef.current?.expand();
  };

  const closeSheet = () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
    setSheetType(null);
  };

  const toggleCollapse = (listId: number) => {
    setCollapsedLists((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      await createList(newListName);
      setNewListName('');
      closeSheet();
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel criar a lista');
    }
  };

  const handleOpenEditList = (list: TodoList) => {
    setEditingList(list);
    setEditListName(list.name);
    setIsListMenuOpen(null);
    openSheet('editList');
  };

  const handleUpdateList = async () => {
    if (!editingList || !editListName.trim()) return;
    try {
      await updateList(editingList.id, editListName);
      closeSheet();
      setEditingList(null);
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel atualizar a lista');
    }
  };

  const handleDeleteList = (list: TodoList) => {
    setIsListMenuOpen(null);
    Alert.alert('Excluir Lista', `Deseja excluir "${list.name}" e todos seus itens?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteList(list.id);
          } catch (error) {
            Alert.alert('Erro', 'Nao foi possivel excluir a lista');
          }
        },
      },
    ]);
  };

  const handleOpenAddItem = (listId: number) => {
    setSelectedListId(listId);
    setNewItemName('');
    openSheet('addItem');
  };

  const handleAddItem = async () => {
    if (!selectedListId || !newItemName.trim()) return;
    try {
      await addItem(selectedListId, { name: newItemName });
      setNewItemName('');
      closeSheet();
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel adicionar o item');
    }
  };

  const handleOpenEditItem = (item: TodoListItem) => {
    setEditingItem(item);
    setEditItemName(item.name);
    openSheet('editItem');
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !editItemName.trim()) return;
    try {
      await updateItem(editingItem.id, { name: editItemName });
      closeSheet();
      setEditingItem(null);
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel atualizar o item');
    }
  };

  const handleDeleteItem = (item: TodoListItem) => {
    Alert.alert('Excluir Item', `Deseja excluir "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem(item.id);
          } catch (error) {
            Alert.alert('Erro', 'Nao foi possivel excluir o item');
          }
        },
      },
    ]);
  };

  const handleToggleItem = async (item: TodoListItem) => {
    try {
      await toggleItemCheck(item.id, !item.checked);
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel atualizar o item');
    }
  };

  const handleReorderItems = useCallback(
    (listId: number, newOrder: TodoListItem[]) => {
      reorderItems(listId, newOrder);
    },
    [reorderItems]
  );

  const renderItem = useCallback(
    (listId: number) =>
      ({ item, drag, isActive }: any) => (
        
          <View style={[styles.itemRow]}>
            <TouchableOpacity  style={styles.dragHandle}>
              <GripVertical color="#9ca3af" size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.itemCheckContainer}
              onPress={() => handleToggleItem(item)}
            >
              {item.checked ? (
                <View style={styles.checkedCircle}>
                  <Check color="#fff" size={14} />
                </View>
              ) : (
                <Circle color="#9ca3af" size={22} />
              )}
            </TouchableOpacity>
            <Text
              style={[styles.itemText, item.checked && styles.itemTextChecked]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.itemActionButton}
                onPress={() => handleOpenEditItem(item)}
              >
                <Pencil color="#3b82f6" size={16} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.itemActionButton}
                onPress={() => handleDeleteItem(item)}
              >
                <Trash2 color="#ef4444" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        
      ),
    [handleToggleItem, handleOpenEditItem, handleDeleteItem]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const getSheetContent = () => {
    switch (sheetType) {
      case 'createList':
        return {
          title: 'Nova Lista',
          value: newListName,
          onChange: setNewListName,
          onSubmit: handleCreateList,
          submitText: 'Criar Lista',
          placeholder: 'Nome da lista...',
        };
      case 'editList':
        return {
          title: 'Editar Lista',
          value: editListName,
          onChange: setEditListName,
          onSubmit: handleUpdateList,
          submitText: 'Salvar',
          placeholder: 'Nome da lista...',
        };
      case 'addItem':
        return {
          title: 'Adicionar Item',
          value: newItemName,
          onChange: setNewItemName,
          onSubmit: handleAddItem,
          submitText: 'Adicionar',
          placeholder: 'Nome do item...',
        };
      case 'editItem':
        return {
          title: 'Editar Item',
          value: editItemName,
          onChange: setEditItemName,
          onSubmit: handleUpdateItem,
          submitText: 'Salvar',
          placeholder: 'Nome do item...',
        };
      default:
        return null;
    }
  };

  const sheetContent = getSheetContent();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lista de Tarefas</Text>
        <TouchableOpacity
          style={styles.addListButton}
          onPress={() => {
            setNewListName('');
            openSheet('createList');
          }}
        >
          <Plus color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {lists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma lista criada</Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => {
                setNewListName('');
                openSheet('createList');
              }}
            >
              <Plus color="#fff" size={18} />
              <Text style={styles.createFirstText}>Criar Primeira Lista</Text>
            </TouchableOpacity>
          </View>
        ) : (
          lists.map((list) => (
            <View key={list.id} style={styles.listCard}>
              <View style={styles.listHeader}>
                <TouchableOpacity
                  style={styles.collapseButton}
                  onPress={() => toggleCollapse(list.id)}
                >
                  {collapsedLists.includes(list.id) ? (
                    <ChevronDown color="#6b7280" size={20} />
                  ) : (
                    <ChevronUp color="#6b7280" size={20} />
                  )}
                </TouchableOpacity>
                <View style={styles.listTitleContainer}>
                  <Text style={styles.listTitle}>{list.name}</Text>
                  <Text style={styles.listCount}>
                    {list.items.length} {list.items.length === 1 ? 'item' : 'itens'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setIsListMenuOpen(isListMenuOpen === list.id ? null : list.id)}
                >
                  <MoreVertical color="#6b7280" size={20} />
                </TouchableOpacity>

                {isListMenuOpen === list.id && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleOpenEditList(list)}
                    >
                      <Pencil color="#3b82f6" size={16} />
                      <Text style={styles.dropdownText}>Editar Nome</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.dropdownItem, styles.dropdownItemDanger]}
                      onPress={() => handleDeleteList(list)}
                    >
                      <Trash2 color="#ef4444" size={16} />
                      <Text style={[styles.dropdownText, styles.dropdownTextDanger]}>
                        Excluir Lista
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {!collapsedLists.includes(list.id) && (
                <View style={styles.listItems}>
                  {list.items.length === 0 ? (
                    <Text style={styles.noItemsText}>Nenhum item adicionado</Text>
                  ) : (
                    <View
                      data={list.items}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={renderItem(list.id)}
                      onDragEnd={({ data }) => handleReorderItems(list.id, data)}
                      scrollEnabled={false}
                    />
                  )}

                  <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={() => handleOpenAddItem(list.id)}
                  >
                    <Plus color="#f97316" size={18} />
                    <Text style={styles.addItemText}>Adicionar Item</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
        onClose={() => setSheetType(null)}
      >
        {sheetContent && (
          <BottomSheetView style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{sheetContent.title}</Text>
              <TouchableOpacity onPress={closeSheet}>
                <X color="#6b7280" size={24} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.sheetInput}
              placeholder={sheetContent.placeholder}
              value={sheetContent.value}
              onChangeText={sheetContent.onChange}
              autoFocus
              onSubmitEditing={sheetContent.onSubmit}
            />
            <TouchableOpacity style={styles.sheetButton} onPress={sheetContent.onSubmit}>
              <Text style={styles.sheetButtonText}>{sheetContent.submitText}</Text>
            </TouchableOpacity>
          </BottomSheetView>
        )}
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f2',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  addListButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f97316',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 20,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createFirstText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'visible',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    position: 'relative',
  },
  collapseButton: {
    marginRight: 8,
  },
  listTitleContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  listCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
    minWidth: 160,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  dropdownItemDanger: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dropdownText: {
    fontSize: 14,
    color: '#374151',
  },
  dropdownTextDanger: {
    color: '#ef4444',
  },
  listItems: {
    padding: 12,
  },
  noItemsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  itemRowDragging: {
    backgroundColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 8,
  },
  dragHandle: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  itemCheckContainer: {
    marginRight: 12,
  },
  checkedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 4,
  },
  itemActionButton: {
    padding: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#f97316',
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 8,
  },
  addItemText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '500',
  },
  // Bottom Sheet styles
  sheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetIndicator: {
    backgroundColor: '#d1d5db',
    width: 40,
  },
  sheetContent: {
    flex: 1,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  sheetButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sheetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
