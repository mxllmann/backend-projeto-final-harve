import { connection } from "../index.js";
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [quizes] = await connection.query(`SELECT * FROM tb_quiz`);

    res.json(quizes);
  } catch (error) {
    res
      .status(500)
      .json({ feedback: "Erro ao buscar os quizes", error: error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const quizId = req.params.id;

    // depois
    const [rows] = await connection.query(
      `SELECT * FROM tb_quiz WHERE id = ?`,
      [quizId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ feedback: "Quiz não encontrado." });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ feedback: "Erro ao buscar o quiz", resultado: error });
  }
});

router.get("/:id/:idPergunta", async (req, res) => {
  try {
    const quizId = req.params.id;
    const questionId = req.params.idPergunta;

    const [rows] = await connection.query(
      `SELECT 
        q.id AS questionId,
        q.question,
        i.id AS itemId,
        i.afirmation,
        i.is_correct
      FROM 
        tb_question q
      INNER JOIN 
        tb_question_item i ON q.id = i.question_id
      WHERE 
        q.quiz_id = ? AND i.question_id = ?`,
      [quizId, questionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ feedback: "Pergunta não encontrada" });
    }

    const questionData = {
      questionId: rows[0].questionId,
      question: rows[0].question,
      items: rows.map((row) => ({
        id: row.itemId,
        afirmation: row.afirmation,
        is_correct: row.is_correct,
      })),
    };

    res.status(200).json(questionData);
  } catch (error) {
    res.status(500).json({
      feedback: "Erro ao buscar questões",
      resultado: error,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description;

    const [insertQuiz] = await connection.query(
      `INSERT INTO tb_quiz (title, description) VALUES (?, ?)`,
      [title, description]
    );

    res
      .status(201)
      .json({ feedback: "Quiz cadastrado com sucesso", resultado: insertQuiz });
  } catch (error) {
    res
      .status(500)
      .json({ feedback: "Erro ao cadastrar o quiz.", resultado: error });
  }
});

router.post("/:id", async (req, res) => {
  try {
    const question = req.body.question;
    const quizId = req.params.id;

    const [insertQuestion] = await connection.query(
      `INSERT INTO tb_question (question, quiz_id) VALUES (?, ?)`,
      [question, quizId]
    );

    res
      .status(201)
      .json({
        feedback: "Questão cadastrada com sucesso",
        resultado: insertQuestion,
      });
  } catch (error) {
    res
      .status(500)
      .json({ feedback: "Erro ao inserir a questão", error: error });
  }
});

export default router;
