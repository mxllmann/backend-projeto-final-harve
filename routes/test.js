import { connection } from "../index.js";
import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const score = req.body.score;
    const quiz_id = req.body.quiz_id;
    const user_id = req.body.user_id;

    const [insertTest] = await connection.query(
      `INSERT INTO tb_test (score, quiz_id, user_id) VALUES (?, ?, ?)`,
      [score, quiz_id, user_id]
    );

    res.status(201).json({
      feedback: "Teste realizado com sucesso",
      resultado: insertTest,
    });
  } catch (error) {
    res.status(500).json({
      feedback: "Erro ao efetuar o teste",
      resultado: error,
    });
  }
});

export default router;
