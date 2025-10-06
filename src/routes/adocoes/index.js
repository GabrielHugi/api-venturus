import { isValidUUID } from '../../functions/helpers.js';
import { Animal, Doacao, Questionario, PedidoAdocao, Usuario } from '../../../models/Modelos.js';
import encryptjs from "encryptjs";
import express from 'express';
const router = express.Router();

router.post("/adocoes", async (req, res) => {
  try {
    const { tutorEmail, animalId } = req.body;

    if (!tutorEmail || !animalId) {
      return res.status(400).json({ erro: "É necessário informar tutorEmail e animalId" });
    }

    if (!isValidUUID(animalId)) {
      return res.status(400).json({ erro: "animalId inválido. Deve ser um UUID" });
    }

    const tutor = await Usuario.findOne({ where: { email: tutorEmail }, include: [{ model: Questionario, as: "questionario" }] });
    if (!tutor) return res.status(404).json({ erro: "Tutor ou animal não encontrado" });

    if (!tutor.questionario) return res.status(400).json({ erro: "O tutor ainda não respondeu o questionário obrigatório" });

    const animal = await Animal.findByPk(animalId);
    if (!animal) return res.status(404).json({ erro: "Tutor ou animal não encontrado" });

    if (animal.adotado) return res.status(400).json({ erro: "Animal já está adotado" });

    let pedido;
    const sequelize = PedidoAdocao && (PedidoAdocao.sequelize ? PedidoAdocao.sequelize : null);
    if (sequelize) {
      const t = await sequelize.transaction();
      try {
        const totalPedidos = await PedidoAdocao.count({ where: { animalId, status: "em_analise" }, transaction: t });
        const posicaoFila = totalPedidos + 1;
        pedido = await PedidoAdocao.create({
          tutorId: tutor.id,
          animalId: animal.id,
          status: "em_analise",
          posicao_fila: posicaoFila
        }, { transaction: t });
        await t.commit();
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } else {
      const totalPedidos = await PedidoAdocao.count({ where: { animalId, status: "em_analise" } });
      const posicaoFila = totalPedidos + 1;
      pedido = await PedidoAdocao.create({
        tutorId: tutor.id,
        animalId: animal.id,
        status: "em_analise",
        posicao_fila: posicaoFila
      });
    }

    return res.status(201).json({
      id: pedido.id,
      tutor_id: pedido.tutorId,
      animal_id: pedido.animalId,
      status: pedido.status,
      posicao_fila: pedido.posicao_fila,
      criado_em: pedido.createdAt ? pedido.createdAt.toISOString() : new Date().toISOString()
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao registrar o pedido de adoção" });
  }
});

export default router;