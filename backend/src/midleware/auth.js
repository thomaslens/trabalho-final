import jwt from "jsonwebtoken";

// Middleware que roda antes das rotas privadas
export function authMiddleware(req, res, next) {
  // Header esperado: Authorization: Bearer TOKEN
  const authHeader = req.headers.authorization;

  // Se não veio header, bloqueia
  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  // Divide em ["Bearer", "TOKEN"]
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Token malformado." });
  }

  try {
    // Verifica token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Guarda dados do usuário no req para os controllers
    req.user = { id: payload.id, email: payload.email };

    // libera para próxima função
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}
