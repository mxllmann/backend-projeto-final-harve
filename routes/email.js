import express from "express";
import { enviarResumoPorEmail } from "../utils/emailService.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { userId, html } = req.body;
    await enviarResumoPorEmail(userId, html);
    res.status(200).json({ feedback: "E-mail enviado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ feedback: "Erro ao enviar e-mail", error });
  }
});

export default router;
