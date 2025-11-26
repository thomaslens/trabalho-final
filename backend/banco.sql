-- cria banco se não existir
CREATE DATABASE IF NOT EXISTS task_manager;
USE task_manager;

-- tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,     -- id autoincremento no MySQL
  nome VARCHAR(100) NOT NULL,            -- nome obrigatório
  email VARCHAR(150) NOT NULL UNIQUE,    -- email único
  senha_hash TEXT NOT NULL,              -- senha criptografada (hash)
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- data automática
);

-- tabela de tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,               -- liga tarefa ao usuário
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'A fazer',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP, -- atualiza sozinho no update

  -- chave estrangeira
  CONSTRAINT fk_tarefas_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- índice para acelerar consultas por usuário
CREATE INDEX idx_tarefas_usuario ON tarefas(usuario_id);
