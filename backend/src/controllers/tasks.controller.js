import { pool } from "../config/db.js";

// status válidos
const VALID_STATUS = ["A fazer", "Em andamento", "Concluída"];

// GET /tasks -> lista tarefas do usuário logado
export async function getTasks(req, res) {
  const userId = req.user.id; // vem do JWT

  try {
    const [rows] = await pool.query(
      "SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY criado_em DESC",
      [userId]
    );

    return res.json(rows);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao listar tarefas." });
  }
}

// POST /tasks -> cria tarefa
export async function createTask(req, res) {
  const userId = req.user.id;
  // além de título/descrição/status, agora também recebemos data/hora
const { titulo, descricao, status, data_compromisso, hora_compromisso } = req.body;


  if (!titulo) {
    return res.status(400).json({ message: "Título é obrigatório." });
  }

  // status padrão
  const finalStatus =
    status && VALID_STATUS.includes(status) ? status : "A fazer";

  try {
    // INSERT agora inclui data e hora do compromisso
const [result] = await pool.query(
  `INSERT INTO tarefas
   (usuario_id, titulo, descricao, status, data_compromisso, hora_compromisso)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [
    userId,
    titulo,
    descricao || null,
    finalStatus,
    data_compromisso || null, // se não veio, salva null
    hora_compromisso || null
  ]
);


    // buscar tarefa criada
    const [rows] = await pool.query(
      "SELECT * FROM tarefas WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      message: "Tarefa criada com sucesso!",
      task: rows[0]
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao criar tarefa." });
  }
}

// PUT /tasks/:id -> atualiza tarefa
export async function updateTask(req, res) {
  const userId = req.user.id;
  const taskId = Number(req.params.id);
  const { titulo, descricao, status, data_compromisso, hora_compromisso } = req.body;


  if (status && !VALID_STATUS.includes(status)) {
    return res.status(400).json({ message: "Status inválido." });
  }

  try {
    // 1) garantir que a tarefa existe e é do usuário
    const [existing] = await pool.query(
      "SELECT * FROM tarefas WHERE id = ? AND usuario_id = ?",
      [taskId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }

    const current = existing[0];

    // 2) atualizar (manter antigos se não vier novo)
    // UPDATE agora também permite mudar data e hora
await pool.query(
  `UPDATE tarefas
   SET titulo = ?,
       descricao = ?,
       status = ?,
       data_compromisso = ?,
       hora_compromisso = ?
   WHERE id = ? AND usuario_id = ?`,
  [
    titulo ?? current.titulo,
    descricao ?? current.descricao,
    status ?? current.status,
    data_compromisso ?? current.data_compromisso,
    hora_compromisso ?? current.hora_compromisso,
    taskId,
    userId
  ]
);


    // 3) devolver tarefa atualizada
    const [updated] = await pool.query(
      "SELECT * FROM tarefas WHERE id = ?",
      [taskId]
    );

    return res.json({
      message: "Tarefa atualizada com sucesso!",
      task: updated[0]
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao atualizar tarefa." });
  }
}

// DELETE /tasks/:id -> apaga tarefa
export async function deleteTask(req, res) {
  const userId = req.user.id;
  const taskId = Number(req.params.id);

  try {
    const [result] = await pool.query(
      "DELETE FROM tarefas WHERE id = ? AND usuario_id = ?",
      [taskId, userId]
    );

    // result.affectedRows = quantas linhas foram apagadas
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }

    return res.json({ message: "Tarefa removida com sucesso!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao remover tarefa." });
  }
}