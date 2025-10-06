import { isValidUUID, getUserByEmail, safeDecrypt, requireAdmin } from '../../functions/helpers.js';
import { Animal, PedidoAdocao } from '../../../models/Modelos.js';
import encryptjs from "encryptjs";
const encrypt = encryptjs.encrypt;
const decrypt = encryptjs.decrypt;
import express from 'express';
const router = express.Router();


router.post("/animais", async(req,res) => {
  try {
    const {
      nome,
      especie,
      porte,
      castrado,
      vacinado,
      descricao,
      foto // deve ser uma string base64
    } = req.body;

    //campos obrigatórios
    if (
      !nome ||
      !especie ||
      !porte ||
      !castrado ||
      !vacinado ||
      !descricao 
    ) {
      return res.status(400).json({ erro: "Todos os campos obrigatórios devem ser preenchidos corretamente." });
    }
    //transforma de base 64 em buffer (bytes, no caso um arquivo de imagem). Se não for base 64 não consegue transformar e manda um erro, assim verificando se é ou não 
    let fotoBuffer = null;
    if (foto) {
      try {
        fotoBuffer = Buffer.from(foto, 'base64');
      } catch (err) {
        err.push("Campo 'foto' não é um base64 válido.");
      }
    }

    const novoAnimal = await Animal.create({
      nome,
      especie,
      porte,
      castrado, //assumindo que a entrada vai ser com base entre escolher uma opção true ou false (boolean) para a variavel castrado
      vacinado,//assumindo que a entrada vai ser com base entre escolher uma opção true ou false (boolean) para a variavel vacinado
      descricao,
      foto: fotoBuffer
    });

    if (foto != null) {
      res.status(201).json({
        mensagem: 'Animal cadastrado com sucesso!',
        animal: { ...novoAnimal, foto: `Buffer com ${fotoBuffer.length} bytes` }
      });
    }
    else {
      res.status(201).json({
        mensagem: 'Animal cadastrado com sucesso!',
        animal: { ...novoAnimal}
      });
    }
  } catch (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro interno ao cadastrar o animal." });
  }
});

router.get("/animais", async (req, res) => {
  try {
    const { especie, porte, castrado, vacinado } = req.query;

    const filtros = {};
    filtros.adotado = false;
    if (especie) filtros.especie = especie;
    if (porte) filtros.porte = porte;
    if (castrado !== undefined) filtros.castrado = castrado === "true";
    if (vacinado !== undefined) filtros.vacinado = vacinado === "true";

    const animais = await Animal.findAll({
      where: filtros,
      attributes: [
        "id",
        "nome",
        "especie",
        "porte",
        "castrado",
        "vacinado",
        "descricao",
        "foto",
        "createdAt",
      ],
      order: [["createdAt", "ASC"]], // mais antigo → mais recente
    });

    return res.status(201).json({
      data: animais.map((a) => ({
        id: a.id,
        nome: a.nome,
        especie: a.especie,
        porte: a.porte,
        castrado: a.castrado,
        vacinado: a.vacinado,
        descricao: a.descricao,
        imagem: a.foto ? (Buffer.isBuffer(a.foto) ? a.foto.toString("base64") : a.foto) : null,
        created_at: a.createdAt ? a.createdAt.toISOString() : null,
      })),
      total: animais.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar animais" });
  }
});

router.get("/admin/animais", async (req, res) => {
  try {
    const { email, senha } = req.query;
    if (!email || !senha) {
      return res.status(400).json({ erro: "Inclua email e senha na query da request" });
    }

    const auth = await requireAdmin(email, senha);
    if (!auth.ok) return res.status(auth.code).json({ erro: auth.erro });

    const animais = await Animal.findAll({
      include: [
        {
          model: PedidoAdocao,
          as: "pedidos",
          attributes: ["id", "status", "posicao_fila", "tutorId", "createdAt"],
        },
      ],
      attributes: [
        "id",
        "nome",
        "especie",
        "porte",
        "castrado",
        "vacinado",
        "adotado",
        "descricao",
        "foto",
        "createdAt",
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      data: animais.map((a) => ({
        id: a.id,
        nome: a.nome,
        especie: a.especie,
        porte: a.porte,
        castrado: a.castrado,
        vacinado: a.vacinado,
        adotado: a.adotado,
        descricao: a.descricao,
        imagem: a.foto ? (Buffer.isBuffer(a.foto) ? a.foto.toString('base64') : a.foto) : null,
        created_at: a.createdAt ? a.createdAt.toISOString() : null,
        pedidos: a.pedidos || [],
      })),
      total: animais.length,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar animais" });
  }
});

router.get("/animais/:id", async (req, res) => {
  try {
    const {email, senha} = req.query; const {id} = req.params;
    if (!id) return res.status(400).send({erro: "Inclua o ID do animal na rota"});
    if (!isValidUUID(id)) return res.status(400).json({ erro: "ID do animal inválido. Deve ser um UUID" });
    if (!email || !senha) return res.status(400).json({erro: "Inclua email e senha na query da request"});

    const auth = await requireAdmin(email, senha);
    if (!auth.ok) return res.status(auth.code).json({ erro: auth.erro });

    const animal = await Animal.findOne({
      where: { id },
      include: [
        {
          model: PedidoAdocao,
          as: "pedidos",
          attributes: ["id", "createdAt"],
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
      order: [[{ model: PedidoAdocao, as: "pedidos" }, "createdAt", "ASC"]],
    });
    if (!animal) return res.status(404).json({erro: "Animal não encontrado"});
    return res.status(200).json(animal);
  } catch (err) {
    console.error(err);
    return res.status(500).json({erro: "Erro ao achar animal"})
  }
});

router.patch("/admin/animais/:id", async (req, res) => {
  try {
    const { email, senha, ...dados } = req.body;
    const { id } = req.params;

    if (!id) return res.status(400).json({ erro: "Inclua o ID do animal na rota" });
    if (!isValidUUID(id)) return res.status(400).json({ erro: "ID do animal inválido. Deve ser um UUID" });

    if (!email || !senha) {
      return res.status(400).json({ erro: "Inclua email e senha no body da request" });
    }

    const usuario = await getUserByEmail(email);
    if (!usuario) return res.status(401).json({ erro: "Usuário não encontrado" });

    const auth = await requireAdmin(email, senha);
    if (!auth.ok) return res.status(auth.code).json({ erro: auth.erro });

    const animal = await Animal.findOne({ where: { id } });
    if (!animal) {
      return res.status(404).json({ erro: "Animal não encontrado" });
    }

    const camposPermitidos = ["nome", "castrado", "vacinado", "adotado", "descricao"];
    const camposParaAtualizar = {};
    for (const campo of camposPermitidos) {
      if (campo in dados) {
        camposParaAtualizar[campo] = dados[campo];
      }
    }
    if (Object.keys(camposParaAtualizar).length === 0) {
      return res.status(400).json({ erro: "Nenhum campo foi fornecido para atualização" });
    }
    await animal.update(camposParaAtualizar);
    return res.status(200).json({
      id: animal.id,
      nome: animal.nome,
      castrado: animal.castrado,
      vacinado: animal.vacinado,
      adotado: animal.adotado,
      descricao: animal.descricao,
      updated_at: animal.updatedAt ? animal.updatedAt.toISOString() : null
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao atualizar o animal" });
  }
});

router.delete("/admin/animais/:id", async (req, res) => {
  try {
    const {email, senha} = req.body; const {id} = req.params;

    if (!id) return res.status(400).send({erro: "Inclua o ID do animal na rota"});
    if (!isValidUUID(id)) return res.status(400).json({ erro: "ID do animal inválido. Deve ser um UUID" });

    if (!email || !senha) return res.status(400).json({erro: "Inclua email e senha no body da request"});

    const animal = await Animal.findOne({where:{id: id}});
    if (!animal) return res.status(404).json({erro: "Animal não encontrado"});

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ erro: "Usuário não encontrado" });
    const decryptedPassword = safeDecrypt(user);

    const auth = await requireAdmin(email, senha);
    if (!auth.ok) return res.status(auth.code).json({ erro: auth.erro });

    await animal.destroy();
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({erro: "Erro ao remover animal"});
  }
});

export default router;