import { pool } from "./config/db.js";

async function test() {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    console.log("✅ Conectou no MySQL:", rows);
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro conectando no MySQL:", err);
    process.exit(1);
  }
}

test();
