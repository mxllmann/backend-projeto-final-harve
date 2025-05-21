import express from 'express'
import dotenv from "dotenv";
import mysql from "mysql2";
import userRoutes from './routes/user.js'
import quizRoutes from './routes/quiz.js'
import questionRoutes from './routes/question.js'
import testRoutes from './routes/test.js'
import emailRoutes from './routes/email.js'
import cors from "cors";

dotenv.config();

export const app = express();
const port = process.env.PORT;

export const connection = await mysql
  .createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DATABASE_PASSWORD,
    database: "bootcamp_harve_projeto_final",
  })
  .promise();

  console.log("Conectado ao banco de dados")

app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());

app.use('/user', userRoutes); 
app.use('/quiz', quizRoutes);
app.use('/question', questionRoutes)
app.use('/test', testRoutes)
app.use('/email', emailRoutes)

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
