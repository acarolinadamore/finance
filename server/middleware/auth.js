const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('❌ [Auth] Token não fornecido');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  console.log('🔐 [Auth] Verificando token...');
  console.log('🔐 [Auth] JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ [Auth] Erro ao verificar token:', err.message);
      console.log('❌ [Auth] Token recebido (primeiros 50 chars):', token.substring(0, 50));
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }

    console.log('✅ [Auth] Token válido! User:', user);
    req.user = user; // { userId, email, name, role }
    next();
  });
};

// Middleware opcional - não retorna erro se não houver token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  JWT_SECRET
};
