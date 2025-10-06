import express from 'express';
import QRCode from 'qrcode';
import sequelize from './src/connections/db/index.js';
import { config } from 'dotenv';
import { Animal, Doacao, Questionario, PedidoAdocao, Usuario } from './models/Modelos.js';
import {getUserByEmail} from './src/functions/helpers.js';
import encryptjs from "encryptjs";
import adocoes from "./src/routes/adocoes/index.js"
import doacoes from "./src/routes/doacoes/index.js"
import animais from "./src/routes/animais/index.js"
import autenticacao from "./src/routes/autenticacao/index.js"
import usuarios from "./src/routes/usuarios/index.js"

config();
const app = express();
const PORT = 5000;
const PIX = "00020126580014BR.GOV.BCB.PIX0136chavepix-ficticia@exemplo.com5204000053039865405100.005802BR5920Nome Exemplo Fictício6009Sao Paulo62070503***6304ABCD";
var PIXQR = '';
const encrypt = encryptjs.encrypt;
const decrypt = encryptjs.decrypt;

const secretKey = process.env.SECRET_KEY;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rotas
app.use(adocoes);
app.use(doacoes);
app.use(animais);
app.use(autenticacao);
app.use(usuarios);

/* FUNÇÃO PRINCIPAL DO CÓDIGO
*  definida embaixo
*/
init();


async function init() {
  const sequelize = (Usuario && Usuario.sequelize) || (Animal && Animal.sequelize) || (PedidoAdocao && PedidoAdocao.sequelize) || null;

  if (sequelize) {
    try {
      await sequelize.sync();
      console.log("Database synced (sequelize.sync())");
    } catch (err) {
      console.error("Erro ao sincronizar o banco de dados:", err);
    }
  } else {
    console.warn("Nenhum sequelize disponível nos modelos importados. Seeds podem falhar.");
  }

  // seed
  if (await getUserByEmail("<hugi@gmail.com>") == null) try {
    const encryptedSenha = encrypt("sigma", secretKey, 256)
    await Usuario.create({
      nome_completo: "Hugi",
      email: "<hugi@gmail.com>",
      senha: encryptedSenha,
      cidade: "Terra dos sigmas",
      estado: "SigmaLandia",
      idade: 25,
      telefone: "11999999999",
      administrador: true
    });
  } catch (err) {
    console.error("Seed fail", err);
  }

  try {
    PIXQR = await QRCode.toDataURL(PIX);
  } catch (err) {
    console.error("Erro gerando PIX QRCode:", err);
    PIXQR = '';
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}