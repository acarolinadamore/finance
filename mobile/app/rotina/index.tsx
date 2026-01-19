import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ArrowLeft, Plus } from "lucide-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")

export default function RotinaScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"daily" | "habits" | "mood">(
    "daily"
  )
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoutines()
  }, [])

  const loadRoutines = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await fetch("http://localhost:3032/api/routines", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setRoutines(data)
    } catch (error) {
      console.error("Erro ao carregar rotinas:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rotina</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "daily" && styles.activeTab]}
          onPress={() => setActiveTab("daily")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "daily" && styles.activeTabText,
            ]}
          >
            Tarefas do Dia
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "habits" && styles.activeTab]}
          onPress={() => setActiveTab("habits")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "habits" && styles.activeTabText,
            ]}
          >
            Hábitos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "mood" && styles.activeTab]}
          onPress={() => setActiveTab("mood")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "mood" && styles.activeTabText,
            ]}
          >
            Humor
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === "daily" && (
          <View style={styles.dailyContainer}>
            <Text style={styles.sectionTitle}>☀️ Manhã</Text>
            <Text style={styles.emptyText}>Nenhuma rotina cadastrada</Text>

            <Text style={styles.sectionTitle}>🌤️ Tarde</Text>
            <Text style={styles.emptyText}>Nenhuma rotina cadastrada</Text>

            <Text style={styles.sectionTitle}>🌙 Noite</Text>
            <Text style={styles.emptyText}>Nenhuma rotina cadastrada</Text>
          </View>
        )}

        {activeTab === "habits" && (
          <View style={styles.habitsContainer}>
            <Text style={styles.emptyText}>
              Controle de hábitos em desenvolvimento
            </Text>
          </View>
        )}

        {activeTab === "mood" && (
          <View style={styles.moodContainer}>
            <Text style={styles.emptyText}>
              Registro de humor em desenvolvimento
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf7f2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#10b981",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#10b981",
  },
  tabText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#10b981",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  dailyContainer: {
    padding: 20,
  },
  habitsContainer: {
    padding: 20,
  },
  moodContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginVertical: 20,
  },
})
