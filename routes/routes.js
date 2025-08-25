// server.js ou app.js
import express from 'express';
import animalRoutes from './routes/animalRoutes.js'; // ← importa as rotas

const app = express();
const PORT = 3000;

app.use(express.json()); // necessário pra ler JSON no body
app.use('/animais', animalRoutes); // prefixo das rotas

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
