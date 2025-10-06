import QRCode from 'qrcode';
import { Doacao } from '../../../models/Modelos.js';
import express from 'express';
const router = express.Router();

const PIX = "00020126580014BR.GOV.BCB.PIX0136chavepix-ficticia@exemplo.com5204000053039865405100.005802BR5920Nome Exemplo Fictício6009Sao Paulo62070503***6304ABCD";

router.post('/doacoes', async (req, res) => {
  try {
    const {nome, email, valor, mensagem} = req.body;
    
    if (valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) <= 0) {
      return res.status(400).json({"erro": "Valor da doação é obrigatório e deve ser um número positivo"});
    }

    let PIXQR = await QRCode.toDataURL(PIX);

    const teste = await Doacao.create({
      nome: nome,
      email: email,
      valor: valor,
      mensagem: mensagem,
      linkPix: PIX,
    });

    return res.status(201).json({
      "doacao_id": teste.id,
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
});

export default router;