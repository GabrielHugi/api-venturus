// server.js ou app.js
import express from 'express';
import models from './models/Modelos.js'

const app = express();
const PORT = 3000;

app.use(express.json()); // necessário pra ler JSON no body

/*
 ___      ___   ________                   _____      _____   ________  
|   |    |   |     |        /\            |          |           |
|__ |    |   |     |       /  \   -----   |  ___     |_____      |
|  \     |   |     |      /----\          |     |    |           |
|   \    |___|     |     /      \         |_____|    |_____      |
*/ 

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
