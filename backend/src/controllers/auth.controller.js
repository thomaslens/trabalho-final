import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

// Cadastro do usuário (rota pública)
export async function register(req, res) {
  const { nome, email, senha } = req.body;

  // validação
  if (!nome || !email || !senha) {
    return res.status(400).json({
      message: "Nome, email e senha são obrigatórios."
    });
  }

  try {
    // 1) verifica se email já está no banco
    const [existing] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email já cadastrado." });
    }

    // 2) cria hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // 3) insere usuário
    const [result] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
      [nome, email, senha_hash]
    );

    // 4) devolve usuário criado
    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: { id: result.insertId, nome, email }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
}

// Login (rota pública)
export async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      message: "Email e senha são obrigatórios."
    });
  }

  try {
    // 1) buscar usuário pelo email
    const [rows] = await pool.query(
      "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }
    if (rows.length === 0) {
      // aqui é quando NÃO existe usuário com esse email
      return res.status(404).json({
        message: "Usuário não cadastrado. Verifique o email ou faça o cadastro."
      });
    }
    

    const user = rows[0];

    // 2) comparar senha digitada com hash do banco
    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // 3) criar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // 4) responder com token
    return res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao fazer login." });
  }
}