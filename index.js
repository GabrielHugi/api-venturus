import express from 'express';
import QRCode from 'qrcode';
import { Animal, Doacao, Questionario, PedidoAdocao, Usuario } from './models/Modelos.js';
import encryptjs from "encryptjs";

/*
done:
1 - no
2 - no
3 - no
4 - no
5 - no
6 - no
7 - no
8 - no
9 - no
10 - no
11 - yes
12 - yes

*/

/*
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
*/


const app = express();
const PORT = 3000;
const PIX = "00020126580014BR.GOV.BCB.PIX0136chavepix-ficticia@exemplo.com5204000053039865405100.005802BR5920Nome Exemplo Fictício6009Sao Paulo62070503***6304ABCD";
var PIXQR = '';
(async () => {
  PIXQR = await QRCode.toDataURL(PIX);
})()
const encrypt = encryptjs.encrypt;
const decrypt = encryptjs.decrypt;

const secretKey = "ultra-mega-secret-key-because-of-course-why-hashing-right-just-encrypt-it-i-guess";



app.use(express.json());

(async () => {
  try {
    // encrypt the password
    const encryptedSenha = encrypt("daora", secretKey, 256)

    // create the user with all required fields
    const usuario = await Usuario.create({
      nome_completo: "Joana Silva",
      email: "<jono@email.com>",
      senha: encryptedSenha,
      cidade: "São Paulo",
      estado: "SP",
      idade: 25,
      telefone: "11999999999",
      administrador: false
    });

    console.log("Usuário criado:", usuario.toJSON());
  } catch (err) {
    console.error("Erro criando usuário:", err);
  }
})();

/*
 ___      ___   ________                   _____      _____   ________  
|   |    |   |     |        /\            |          |           |
|__ |    |   |     |       /  \   -----   |  ___     |_____      |
|  \     |   |     |      /----\          |     |    |           |
|   \    |___|     |     /      \         |_____|    |_____      |
obs: o giovanni is stupid
*/ 



app.post('/autenticacao', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await Usuario.findOne({ where: { email: email } });

    const decryptedPassword = decrypt(user.senha, secretKey, 256);

    if (senha !== decryptedPassword) {
      return res.status(401).json({ erro: "Email ou senha inválidos." });
    }

    return res.status(200).json({ message: "Login bem-sucedido!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno ao tentar fazer o login." });
  }
});


app.post('/doacoes', async (req, res) => {
  try {
    const {nome, email, valor, mensagem} = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({"erro": "Valor da doação é obrigatório e deve ser um número positivo"});
    }

    const teste = await Doacao.create({
      nome: nome,
      email: email,
      valor: valor,
      mensagem: mensagem,
      linkPix: PIX,
    });

    
    return res.status(201).json({
      "doacao_id": teste.doacao_id,
      "nome": teste.nome,
      "valor": teste.valor,
      "mensagem": teste.mensagem,
      "linkPix": teste.linkPix,
      "qrcode": PIXQR,
    })

  } catch (err) {
    console.log(err);
    return res.status(500).json({"erro": "Erro ao processar a doação"});
  }
})


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
