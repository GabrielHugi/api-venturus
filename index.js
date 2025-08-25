import express from 'express';
import { Animal } from './models/Modelos.js';

(async () => {
  try {
    const teste = await Animal.create({
      nome: "Totó",
      especie: "Cachorro",
      porte: "Médio",
      castrado: true,
      vacinado: true,
      adotado: false,
      descricao: "Um cachorro muito amigável e brincalhão.",
    });
    console.log("Animal criado:", teste.toJSON());
  } catch (err) {
    console.error("Erro criando animal:", err);
  }
})();

const app = express();
const PORT = 3000;

app.use(express.json());

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
