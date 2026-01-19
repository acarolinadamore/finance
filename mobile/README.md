# 📱 Finance Mobile App

App mobile do Finance usando Expo e React Native.

## 🚀 Como Rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o app

```bash
npm start
```

### 3. Escolher plataforma

No terminal que abrir, pressione:

- `w` - Abrir no navegador web (mais fácil para testar)
- `a` - Abrir no Android emulator
- `i` - Abrir no iOS simulator (só Mac)
- `r` - Recarregar app

## 📂 Estrutura

```
mobile/
├── app/                  # Rotas (Expo Router)
│   ├── _layout.tsx       # Layout raiz
│   ├── index.tsx         # Home inicial
│   ├── login.tsx         # Tela de login
│   └── register.tsx      # Tela de registro
├── components/           # Componentes reutilizáveis
├── services/             # API calls
├── hooks/                # Custom hooks
└── package.json
```

## 🔗 Backend

O app se conecta com o backend em:

- **Local:** `http://localhost:3032`

⚠️ **IMPORTANTE:** Se testar no celular real, troque para o IP da sua máquina:

```typescript
const API_URL = "http://192.168.X.X:3032"
```

## ✅ Funcionalidades Implementadas

- [x] Tela inicial (Home)
- [x] Tela de Login
- [x] Tela de Registro
- [x] Integração com backend (login/register)
- [ ] AsyncStorage (salvar token)
- [ ] AuthContext
- [ ] Home autenticada
- [ ] Rotina
- [ ] Calendário

## 🎨 Design System

**Cores principais:**

- Sky 400: `#38bdf8`
- Sky 50: `#f0f9ff`
- Slate 800: `#1e293b`
- Slate 500: `#64748b`

**Fonte logo:**

- Cursive (Dancing Script no web)

## 📱 Testando

### Navegador (recomendado)

```bash
npm start
# Pressione 'w'
```

### Android Emulator

1. Abra Android Studio
2. Inicie o emulador
3. `npm start` e pressione 'a'

### Celular Real

1. Instale Expo Go
2. Escaneie o QR Code
3. Certifique-se de estar na mesma rede Wi-Fi

## 🐛 Troubleshooting

### Erro "Network error"

- Certifique-se que o backend está rodando: `cd ../server && node index.js`
- Verifique se está acessando `http://localhost:3032`

### Expo não abre

```bash
rm -rf node_modules
npm install
npm start
```

### Código não atualiza

- Pressione `r` no terminal do Expo
- Ou sacuda o celular e clique "Reload"

## 📚 Docs

- [Expo Docs](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev)
