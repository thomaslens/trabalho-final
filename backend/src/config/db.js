// Importa mysql2 com suporte a promises
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config(); // carrega variáveis do .env

// Cria um pool de conexões (recomendado para performance)
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),

  // quantas conexões podem existir simultaneamente
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});