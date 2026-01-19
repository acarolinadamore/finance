import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  useFonts,
  DancingScript_700Bold,
} from "@expo-google-fonts/dancing-script"
import {
  Wallet,
  Target,
  Heart,
  ShoppingCart,
  UtensilsCrossed,
  Calendar,
  FileText,
  TrendingDown,
  BookOpen,
  ListTodo,
  Repeat,
  BookMarked,
  GraduationCap,
  Activity,
  Shield,
  Settings,
  LogOut,
} from "lucide-react-native"

const { width, height } = Dimensions.get("window")

// Responsivo baseado no tamanho da tela
const isSmallDevice = width < 375
const isTablet = width >= 768

// Configurações de espaçamento
const CARD_PADDING = isSmallDevice ? 12 : isTablet ? 32 : 20
const CARD_GAP = isSmallDevice ? 8 : isTablet ? 16 : 12
const COLUMNS = isTablet ? 4 : 2

// Cálculo correto da largura do card
const AVAILABLE_WIDTH = width - CARD_PADDING * 2
const TOTAL_GAP_WIDTH = CARD_GAP * (COLUMNS - 1)
const CARD_WIDTH = (AVAILABLE_WIDTH - TOTAL_GAP_WIDTH) / COLUMNS

// Tamanhos de fonte responsivos - EXATOS do Web
const FONT_SIZES = {
  logo: isSmallDevice ? 50 : 60,
  headerLogo: isSmallDevice ? 40 : 48,
  welcome: isSmallDevice ? 14 : 16,
  moduleTitle: 20, // text-xl = 20px (FIXO como no web)
  moduleDescription: 14, // text-sm = 14px (FIXO como no web)
  buttonText: 14, // text-sm = 14px (FIXO como no web)
  iconSize: 28, // h-7 w-7 = 28px (FIXO como no web)
  iconContainer: 56, // w-14 h-14 = 56px (FIXO como no web)
}

interface Module {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  path: string
  color: string
}

const modules: Module[] = [
  {
    id: "finance",
    title: "Financeiro",
    description: "Suas finanças organizadas e sob controle",
    icon: Wallet,
    path: "/finance",
    color: "#0ea5e9", // Sky
  },
  {
    id: "metas",
    title: "Sonhos & Metas",
    description: "Seus objetivos acompanhados de perto",
    icon: Target,
    path: "/metas",
    color: "#8b5cf6", // Violet
  },
  {
    id: "wishlist",
    title: "Wishlist",
    description: "Seus desejos planejados com inteligência",
    icon: Heart,
    path: "/wishlist",
    color: "#ec4899", // Pink
  },
  {
    id: "lista-mercado",
    title: "Lista Mercado",
    description: "Suas compras planejadas e econômicas",
    icon: ShoppingCart,
    path: "/lista-mercado",
    color: "#14b8a6", // Teal
  },
  {
    id: "todo-list",
    title: "Lista de Tarefas",
    description: "Organize suas tarefas e atividades diárias",
    icon: ListTodo,
    path: "/todo-list",
    color: "#f97316", // Orange
  },
  {
    id: "refeicoes",
    title: "Refeições",
    description: "Acompanhe o que você come e como se sente",
    icon: UtensilsCrossed,
    path: "/meals",
    color: "#ef4444", // Red
  },
  {
    id: "rotina",
    title: "Rotina",
    description: "Organize sua rotina e controle seus hábitos",
    icon: Repeat,
    path: "/rotina",
    color: "#10b981", // Emerald
  },
  {
    id: "calendario",
    title: "Calendário",
    description: "Seus compromissos e eventos organizados",
    icon: Calendar,
    path: "/calendario",
    color: "#3b82f6", // Blue
  },
  {
    id: "documentos",
    title: "Documentos",
    description: "Documentos importantes sempre à mão",
    icon: FileText,
    path: "/documentos",
    color: "#6366f1", // Indigo
  },
  {
    id: "peso",
    title: "Registro de Peso",
    description: "Acompanhe sua evolução de peso e saúde",
    icon: TrendingDown,
    path: "/peso",
    color: "#84cc16", // Lime
  },
  {
    id: "diario",
    title: "Diário",
    description: "Registre seus pensamentos e sentimentos",
    icon: BookOpen,
    path: "/diario",
    color: "#a855f7", // Purple
  },
  {
    id: "leituras",
    title: "Leituras",
    description: "Acompanhe seus livros e progresso de leitura",
    icon: BookMarked,
    path: "/leituras",
    color: "#f59e0b", // Amber
  },
  {
    id: "estudos",
    title: "Estudos",
    description: "Organize seus cursos e materiais de estudo",
    icon: GraduationCap,
    path: "/estudos",
    color: "#06b6d4", // Cyan
  },
  {
    id: "ciclo-feminino",
    title: "Ciclo Feminino",
    description: "Acompanhe seu ciclo menstrual e bem-estar",
    icon: Activity,
    path: "/ciclo-feminino",
    color: "#db2777", // Rose
  },
]

export default function HomeScreen() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const userData = await AsyncStorage.getItem("user")

      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token")
          await AsyncStorage.removeItem("user")
          setUser(null)
        },
      },
    ])
  }

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={[styles.logo, { fontFamily: "DancingScript_700Bold" }]}>
          Ordena
        </Text>
      </View>
    )
  }

  // Tela não autenticada
  if (!user) {
    return (
      <View style={styles.unauthContainer}>
        <Text style={[styles.logo, { fontFamily: "DancingScript_700Bold" }]}>
          Ordena
        </Text>
        <Text style={styles.subtitle}>Sua vida organizada em um só lugar</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={() => router.push("/register")}
          >
            <Text style={[styles.buttonText, styles.buttonTextOutline]}>
              Criar Conta
            </Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="dark" />
      </View>
    )
  }

  // Tela autenticada - mesmo estilo do web
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header com Logo e Subtitle - Igual ao Web */}
      <View style={styles.header}>
        <Text
          style={[styles.headerLogo, { fontFamily: "DancingScript_700Bold" }]}
        >
          Ordena
        </Text>
        <Text style={styles.subtitle}>Sua vida organizada em um só lugar.</Text>
      </View>

      {/* Grid de módulos com background gradiente */}
      <LinearGradient colors={["#faf7f2", "#f0f0f0"]} style={styles.scrollView}>
        <ScrollView
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          {modules.map((module) => {
            const IconComponent = module.icon
            return (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                activeOpacity={0.8}
                onPress={() => router.push(module.path)}
              >
                <View style={styles.cardContent}>
                  {/* Ícone colorido com gradiente */}
                  <LinearGradient
                    colors={[module.color, module.color + "dd"]}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <IconComponent color="#fff" size={28} strokeWidth={2} />
                  </LinearGradient>

                  {/* Título */}
                  <Text style={styles.moduleTitle}>{module.title}</Text>

                  {/* Descrição */}
                  <Text style={styles.moduleDescription} numberOfLines={2}>
                    {module.description}
                  </Text>

                  {/* Botão Acessar com gradiente */}
                  <LinearGradient
                    colors={[module.color, module.color + "cc"]}
                    style={styles.accessButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.accessButtonText}>Acessar</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </LinearGradient>

      {/* Botões de ação no topo */}
      <View style={styles.actionButtons}>
        {user.role === "admin" && (
          <TouchableOpacity style={styles.actionButton}>
            <Shield color="#64748b" size={20} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton}>
          <Settings color="#64748b" size={20} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <LogOut color="#64748b" size={20} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf7f2",
  },
  unauthContainer: {
    flex: 1,
    backgroundColor: "#faf7f2",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    fontSize: FONT_SIZES.logo,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZES.welcome,
    color: "#64748b",
    marginBottom: 60,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 12,
  },
  button: {
    backgroundColor: "#4f9cf9",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#4f9cf9",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextOutline: {
    color: "#4f9cf9",
  },
  // Estilos autenticado - Header igual ao Web
  header: {
    paddingTop: isSmallDevice ? 50 : 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#faf7f2",
  },
  headerLogo: {
    fontSize: isSmallDevice ? 56 : 72, // text-6xl do web
    fontWeight: "bold",
    // Gradiente azul como no web (from-sky-400 to-blue-500)
    color: "#38bdf8",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: FONT_SIZES.welcome,
    color: "#64748b",
    fontWeight: "400",
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingTop: 16,
    paddingHorizontal: CARD_PADDING,
    paddingBottom: 100,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: CARD_GAP,
    rowGap: CARD_GAP,
  },
  moduleCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12, // rounded-xl = 12px
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, // shadow-lg
    shadowRadius: 15,
    elevation: 5,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    paddingTop: 20, // py-5 = 20px
    paddingBottom: 12, // pb-3 = 12px (header)
    paddingHorizontal: 20, // px-5 = 20px
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: FONT_SIZES.iconContainer, // 56px
    height: FONT_SIZES.iconContainer, // 56px
    borderRadius: 12, // rounded-xl
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, // shadow-md
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12, // mb-3 = 12px
  },
  iconText: {
    fontSize: 28,
  },
  moduleTitle: {
    fontSize: FONT_SIZES.moduleTitle, // 20px (text-xl)
    fontWeight: "600", // font-semibold
    color: "#1f2937", // text-gray-800
    textAlign: "center",
    marginBottom: 4, // mb-1 = 4px
  },
  moduleDescription: {
    fontSize: FONT_SIZES.moduleDescription, // 14px (text-sm)
    color: "#4b5563", // text-gray-600 (ajustado do web)
    textAlign: "center",
    lineHeight: 21, // 1.5x do text-sm
    flex: 1,
  },
  accessButton: {
    width: "100%",
    height: 40, // h-10 = 40px (FIXO como no web)
    borderRadius: 8, // rounded-lg
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // shadow-sm
    shadowRadius: 2,
    elevation: 1,
    marginTop: 8, // pt-2 = 8px de separação do conteúdo
  },
  accessButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.buttonText, // 14px (text-sm)
    fontWeight: "600",
  },
  actionButtons: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "row",
    gap: 8,
    zIndex: 100,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    // Remove estilos web indesejados
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  actionButtonText: {
    fontSize: 20,
  },
})
