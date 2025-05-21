import nodemailer from "nodemailer";
import { decrypt } from "./cryptoUtils.js";
import { connection } from "../index.js";
import dotenv from "dotenv";
dotenv.config();

export async function enviarResumoPorEmail(userId, htmlConteudo) {
  const [rows] = await connection.query(
    "SELECT email, user_name FROM tb_users WHERE id = ?",
    [userId]
  );

  if (!rows.length) throw new Error("Usuário não encontrado");

  const email = decrypt(rows[0].email);
  const username = decrypt(rows[0].user_name);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlFinal = `
    <div style="font-family: Arial, sans-serif;">
      <p>Olá, <strong>${username}</strong>! 👋</p>
      ${htmlConteudo}
    </div>
  `;

  await transporter.sendMail({
    from: `"QuizAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Seu resultado do Quiz",
    html: htmlFinal,
  });
}
