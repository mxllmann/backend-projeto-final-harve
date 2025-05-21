// Importações necessárias
import express from "express";
import { connection } from "../index.js"; // conexão com banco
import { hash } from "../utils/cryptoUtils.js"; // função de hash para senha
import { encrypt, decrypt } from "../utils/cryptoUtils.js"; // AES genérico
import jwt from "jsonwebtoken"; // para gerar token JWT

const router = express.Router();

/**
 * ROTA: POST /
 * Finalidade: Cadastrar novo usuário com criptografia AES para e-mail e username, e hash para senha
 */
router.post("/", async (req, res) => {
  try {
    const { user, email, password } = req.body;

    const encryptedUsername = encrypt(user);
    const encryptedEmail = encrypt(email);
    const hashedPassword = hash(password);

    // Verifica se já existe usuário com mesmo username OU email
    const [existing] = await connection.query(
      `SELECT * FROM tb_users WHERE user_name = ? OR email = ?`,
      [encryptedUsername, encryptedEmail]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ feedback: "Usuário ou email já cadastrado." });
    }

    // Insere novo usuário no banco
    const [result] = await connection.query(
      `INSERT INTO tb_users (user_name, email, password) VALUES (?, ?, ?)`,
      [encryptedUsername, encryptedEmail, hashedPassword]
    );

    res
      .status(201)
      .json({ feedback: "Usuário cadastrado com sucesso", resultado: result });
  } catch (error) {
    res
      .status(500)
      .json({ feedback: "Erro ao cadastrar o usuário", resultado: error });
  }
});

/**
 * ROTA: POST /login
 * Finalidade: Autenticar o usuário via username ou email + senha
 * Retorna: JWT token se autenticado com sucesso
 */
router.post("/login", async (req, res) => {
  try {
    const { user, email, password } = req.body;

    const hashedPassword = hash(password);
    const encryptedEmail = email ? encrypt(email) : null;
    const encryptedUsername = user ? encrypt(user) : null;

    const [result] = await connection.query(
      `SELECT * FROM tb_users WHERE (user_name = ? AND password = ?) OR (email = ? AND password = ?)`,
      [encryptedUsername, hashedPassword, encryptedEmail, hashedPassword]
    );

    if (result.length > 0) {
      const token = jwt.sign(
        { id: result[0].id },
        process.env.JWT_SECRET || "segredo_super_secreto",
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        feedback: "Autenticação bem-sucedida!",
        token,
        id: result[0].id,
      });
    }

    res
      .status(401)
      .json({ feedback: "Usuário não encontrado ou senha incorreta." });
  } catch (error) {
    res
      .status(500)
      .json({ feedback: "Erro interno ao autenticar", resultado: error });
  }
});

/**
 * ROTA: GET /email/:id
 * Finalidade: Buscar o e-mail descriptografado do usuário
 */
router.get("/email/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await connection.query(
      "SELECT email FROM tb_users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ feedback: "Usuário não encontrado" });
    }

    const decryptedEmail = decrypt(rows[0].email);
    res.status(200).json({ email: decryptedEmail });
  } catch (error) {
    res.status(500).json({ feedback: "Erro ao buscar e-mail", error });
  }
});

router.get("/:id/username", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await connection.query(
      "SELECT user_name FROM tb_users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ feedback: "Usuário não encontrado" });
    }

    const decryptedUsername = decrypt(rows[0].user_name);
    res.status(200).json({ username: decryptedUsername });
  } catch (error) {
    res.status(500).json({ feedback: "Erro ao buscar username", error });
  }
});

export default router;
