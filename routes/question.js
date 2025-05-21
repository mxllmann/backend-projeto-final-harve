import { connection } from "../index.js";
import express from "express";

const router = express.Router();

router.post("/:id", async (req, res) => {
  try {
    const questionId = req.params.id;

    const afirmation = req.body.afirmation;
    const isCorrect = req.body.isCorrect;

    const [insertQuestionItem] = await connection.query(
      `INSERT INTO tb_question_item (afirmation, is_correct, question_id) VALUES (?, ?, ?)`,
      [afirmation, isCorrect, questionId]
    );

    res
      .status(201)
      .json({
        feedback: "Item da questão foi cadastrado com sucesso",
        resultado: insertQuestionItem,
      });
  } catch (error) {
    res
      .status(500)
      .json({ feedback: "Erro ao inserir o item da questão", error: error });
  }
});

router.get("/quiz/:idQuiz", async (req, res) => {
  try {
    const { idQuiz } = req.params;

    const [questions] = await connection.query(
      `SELECT id, question FROM tb_question WHERE quiz_id = ? ORDER BY id ASC`,
      [idQuiz]
    );

    const questionIds = questions.map((q) => q.id);
    if (questionIds.length === 0) {
      return res.status(200).json([]);
    }

    const [items] = await connection.query(
      `SELECT id, afirmation, is_correct, question_id FROM tb_question_item WHERE question_id IN (?)`,
      [questionIds]
    );

    const itemsGrouped = {};
    for (const item of items) {
      if (!itemsGrouped[item.question_id]) {
        itemsGrouped[item.question_id] = [];
      }
      itemsGrouped[item.question_id].push({
        id: item.id,
        afirmation: item.afirmation,
        is_correct: item.is_correct,
      });
    }

    const merged = questions.map((q) => ({
      id: q.id,
      question: q.question,
      items: itemsGrouped[q.id] || [],
    }));

    res.status(200).json(merged);
  } catch (error) {
    res.status(500).json({
      feedback: "Erro ao buscar perguntas e itens",
      resultado: error,
    });
  }
});

export default router;
