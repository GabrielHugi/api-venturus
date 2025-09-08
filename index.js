import express from 'express';
import QRCode from 'qrcode';
import { Animal, Doacao, Questionario, PedidoAdocao, Usuario } from './models/Modelos.js';
import encryptjs from "encryptjs";

/*
done:
1 - no
2 - yes
3 - yes
4 - yes
5 - yes
6 - yes
7 - yes
8 - yes
2 - yes
3 - yes
4 - yes
5 - yes
6 - yes
7 - yes
8 - yes
9 - yes
10 - yes
11 - yes
12 - yes
*/

const app = express();
const PORT = 3000;
const PIX = "00020126580014BR.GOV.BCB.PIX0136chavepix-ficticia@exemplo.com5204000053039865405100.005802BR5920Nome Exemplo Fictício6009Sao Paulo62070503***6304ABCD";
var PIXQR = '';
const encrypt = encryptjs.encrypt;
const decrypt = encryptjs.decrypt;

const secretKey = "very very secret secretive secretus";
const secretKey = "very very secret secretive secretus";

app.use(express.json());

// HELPERS
function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  const re = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return re.test(uuid);
}

async function getUserByEmail(email) {
  if (!email) return null;
  return await Usuario.findOne({ where: { email } });
}

function safeDecrypt(user) {
  if (!user || !user.senha) return null;
  try {
    return decrypt(user.senha, secretKey, 256);
  } catch (err) {
    console.error("safeDecrypt error:", err);
    return null;
  }
}

async function requireAdmin(email, senha) {
  const user = await getUserByEmail(email);
  if (!user) return { ok: false, code: 401, erro: "Usuário não encontrado" };
  const dec = safeDecrypt(user);
  if (!dec || dec !== senha || !user.administrador) {
    return { ok: false, code: 403, erro: "Acesso não autorizado" };
  }
  return { ok: true, user };
}

// 1 POST animais
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: {
        exclude: ["senha", "createdAt", "updatedAt"]
      },
      include: [
        {
          model: Questionario,
          as: "questionario",
          attributes: {
            exclude: ["createdAt", "updatedAt"]
          }
        }
      ]
    });

    return res.status(200).json({
      total: usuarios.length,
      data: usuarios
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar usuários" });
  }
});

// ROUTES


/*
 ___      ___   ________                   _____      _____   ________  
|   |    |   |     |        /\            |          |           |
|__ |    |   |     |       /  \   -----   |  ___     |_____      |
|  \     |   |     |      /----\          |     |    |           |
|   \    |___|     |     /      \         |_____|    |_____      |
*/ 

// 3
app.get("/animais", async (req, res) => {
  try {
    const { especie, porte, castrado, vacinado } = req.query;

    const filtros = {};
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

    return res.status(200).json({
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


// Assuming you have access to your Usuario model
async function getRandomUserByName() {
  try {
    const users = await Usuario.findAll({
      where: {
        nome_completo: "Teste User"
      }
    });
    if (users.length === 0) return null;

    // Pick a random user from the results
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
}


getRandomUserByName().then(user => {
  if (!user) {
    console.log("No users found with that name.");
  } else {
    console.log("Random user:", user.toJSON());
  }
});


// 2
// POST /usuarios
app.post("/usuarios", async (req, res) => {
  try {
    const {
      nome_completo,
      senha,
      email,
      cidade,
      estado,
      idade,
      telefone,
      instagram,
      facebook,
      questionario
    } = req.body;

    if (
      !nome_completo ||
      !senha ||
      !email ||
      !cidade ||
      !estado ||
      !idade  ||
      !telefone
    ) {
      return res.status(400).json({ erro: "Todos os campos obrigatórios devem ser preenchidos corretamente." });
    }

    // Verificar email único
    const emailExistente = await Usuario.findOne({ where: { email } });
    if (emailExistente) {
      return res.status(400).json({ erro: "Email preenchido já está sendo utilizado." });
    }

    // Criar usuário
    const novoUsuario = await Usuario.create({
      nome_completo,
      senha,
      email,
      cidade,
      estado,
      idade,
      telefone,
      instagram,
      facebook
    });

    // Criar questionário, se enviado e válido
    if (questionario) {
      await Questionario.create({
        ...questionario,
        usuarioId: novoUsuario.id
      });
    }

    return res.status(201).json({
      id: novoUsuario.id,
      nome_completo: novoUsuario.nome_completo,
      senha: novoUsuario.senha,
      email: novoUsuario.email,
      cidade: novoUsuario.cidade,
      estado: novoUsuario.estado,
      idade: novoUsuario.idade,
      telefone: novoUsuario.telefone,
      instagram: novoUsuario.instagram,
      facebook: novoUsuario.facebook
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno ao cadastrar o tutor." });
  }
});


// POST /questionario
app.post("/questionario", async (req, res) => {
  try {
    const {
      usuarioId, // id do tutor para associar
      empregado,
      quantos_animais_possui,
      motivos_para_adotar,
      quem_vai_sustentar_o_animal,
      numero_adultos_na_casa,
      numero_criancas_na_casa,
      idades_criancas,
      residencia_tipo,
      proprietario_permite_animais,
      todos_de_acordo_com_adocao,
      responsavel_pelo_animal,
      responsavel_concorda_com_adocao,
      ha_alergico_ou_pessoas_que_nao_gostam,
      gasto_mensal_estimado,
      valor_disponivel_no_orcamento,
      tipo_alimentacao,
      local_que_o_animal_vai_ficar,
      forma_de_permanencia,
      forma_de_confinamento,
      tera_brinquedos,
      tera_abrigo,
      tera_passeios_acompanhado,
      tera_passeios_sozinho,
      companhia_outro_animal,
      companhia_humana_24h,
      companhia_humana_parcial,
      sem_companhia_humana,
      sem_companhia_animal,
      o_que_faz_em_viagem,
      o_que_faz_se_fugir,
      o_que_faz_se_nao_puder_criar,
      animais_que_ja_criou,
      destino_animais_anteriores,
      costuma_esterilizar,
      costuma_vacinar,
      costuma_vermifugar,
      veterinario_usual,
      forma_de_educar,
      envia_fotos_e_videos_do_local,
      aceita_visitas_e_fotos_do_animal,
      topa_entrar_grupo_adotantes,
      concorda_com_taxa_adocao,
      data_disponivel_para_buscar_animal
    } = req.body;

    // Verifica se o usuário existe
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(400).json({ erro: "Usuário não encontrado." });
    }

    if (
      !usuarioId  ||
      !empregado  ||
      !quantos_animais_possui  ||
      !motivos_para_adotar  ||
      !quem_vai_sustentar_o_animal  ||
      !numero_adultos_na_casa  ||
      !numero_criancas_na_casa  ||
      !idades_criancas  ||
      !residencia_tipo  ||
      !proprietario_permite_animais  ||
      !todos_de_acordo_com_adocao  ||
      !responsavel_pelo_animal  ||
      !responsavel_concorda_com_adocao  ||
      !ha_alergico_ou_pessoas_que_nao_gostam  ||
      !gasto_mensal_estimado  ||
      !valor_disponivel_no_orcamento  ||
      !tipo_alimentacao  ||
      !local_que_o_animal_vai_ficar  ||
      !forma_de_permanencia  ||
      !forma_de_confinamento  ||
      !tera_brinquedos  ||
      !tera_abrigo  ||
      !tera_passeios_acompanhado  ||
      !tera_passeios_sozinho  ||
      !companhia_outro_animal  ||
      !companhia_humana_24h  ||
      !companhia_humana_parcial  ||
      !sem_companhia_humana  ||
      !sem_companhia_animal  ||
      !o_que_faz_em_viagem  ||
      !o_que_faz_se_fugir  ||
      !o_que_faz_se_nao_puder_criar  ||
      !animais_que_ja_criou  ||
      !destino_animais_anteriores  ||
      !costuma_esterilizar  ||
      !costuma_vacinar  ||
      !costuma_vermifugar  ||
      !veterinario_usual  ||
      !forma_de_educar  ||
      !envia_fotos_e_videos_do_local  ||
      !aceita_visitas_e_fotos_do_animal  ||
      !topa_entrar_grupo_adotantes  ||
      !concorda_com_taxa_adocao  ||
      !data_disponivel_para_buscar_animal
      
    ) {
      return res.status(400).json({ erro: "Todos os campos obrigatórios devem ser preenchidos corretamente." });
    }

    const questionarioCriado = await Questionario.create({
      empregado,
      quantos_animais_possui,
      motivos_para_adotar,
      quem_vai_sustentar_o_animal,
      numero_adultos_na_casa,
      numero_criancas_na_casa,
      idades_criancas,
      residencia_tipo,
      proprietario_permite_animais,
      todos_de_acordo_com_adocao,
      responsavel_pelo_animal,
      responsavel_concorda_com_adocao,
      ha_alergico_ou_pessoas_que_nao_gostam,
      gasto_mensal_estimado,
      valor_disponivel_no_orcamento,
      tipo_alimentacao,
      local_que_o_animal_vai_ficar,
      forma_de_permanencia,
      forma_de_confinamento,
      tera_brinquedos,
      tera_abrigo,
      tera_passeios_acompanhado,
      tera_passeios_sozinho,
      companhia_outro_animal,
      companhia_humana_24h,
      companhia_humana_parcial,
      sem_companhia_humana,
      sem_companhia_animal,
      o_que_faz_em_viagem,
      o_que_faz_se_fugir,
      o_que_faz_se_nao_puder_criar,
      animais_que_ja_criou,
      destino_animais_anteriores,
      costuma_esterilizar,
      costuma_vacinar,
      costuma_vermifugar,
      veterinario_usual,
      forma_de_educar,
      envia_fotos_e_videos_do_local,
      aceita_visitas_e_fotos_do_animal,
      topa_entrar_grupo_adotantes,
      concorda_com_taxa_adocao,
      data_disponivel_para_buscar_animal,
      usuarioId
    });

    return res.status(201).json(questionarioCriado);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno ao cadastrar o tutor." });
  }
});


/*
 ___      ___   ________                   _____      _____   ________  
|   |    |   |     |        /\            |          |           |
|__ |    |   |     |       /  \   -----   |  ___     |_____      |
|  \     |   |     |      /----\          |     |    |           |
|   \    |___|     |     /      \         |_____|    |_____      |
*/ 

// 3
app.get("/animais", async (req, res) => {
  try {
    const { especie, porte, castrado, vacinado } = req.query;

    const filtros = {};
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


// 4
app.post("/adocoes", async (req, res) => {
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

// 5
app.patch("/tutores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { authEmail, authSenha, ...dadosAtualizacao } = req.body;

    if (!id) return res.status(400).json({ erro: "Inclua o ID do tutor na rota" });
    if (!isValidUUID(id)) return res.status(400).json({ erro: "ID do tutor inválido. Deve ser um UUID" });

    if (!authEmail || !authSenha) {
      return res.status(400).json({ erro: "Inclua email e senha no body da request" });
    }

    const usuario = await getUserByEmail(authEmail);
    if (!usuario) return res.status(401).json({ erro: "Credenciais inválidas" });

    const decryptedPassword = safeDecrypt(usuario);
    if (!decryptedPassword || authSenha !== decryptedPassword) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    if (!usuario.administrador && usuario.id.toString() !== id) {
      return res.status(403).json({ erro: "Você não tem permissão para editar este tutor" });
    }

    if (!dadosAtualizacao || Object.keys(dadosAtualizacao).length === 0) {
      return res.status(400).json({ erro: "Pelo menos um campo deve ser enviado para atualização" });
    }

    const tutor = await Usuario.findByPk(id, {
      include: [{ model: Questionario, as: "questionario" }]
    });
    if (!tutor) {
      return res.status(404).json({ erro: "Tutor não encontrado" });
    }

    let questionarioAtualizado;
    if (dadosAtualizacao.questionario) {
      if (tutor.questionario) {
        await tutor.questionario.update(dadosAtualizacao.questionario);
        questionarioAtualizado = tutor.questionario;
      } else {
        questionarioAtualizado = await Questionario.create({
          ...dadosAtualizacao.questionario,
          usuarioId: tutor.id
        });
      }
    }

    const { questionario, id: _id, ...dadosTutor } = dadosAtualizacao;
    if (Object.keys(dadosTutor).length > 0) {
      await tutor.update(dadosTutor);
    }

    const tutorAtual = await Usuario.findByPk(tutor.id, {
      include: [{ model: Questionario, as: "questionario" }]
    });

    return res.status(200).json({
      id: tutorAtual.id,
      nome_completo: tutorAtual.nome_completo,
      email: tutorAtual.email,
      cidade: tutorAtual.cidade,
      estado: tutorAtual.estado,
      questionario: tutorAtual.questionario || null
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao atualizar os dados do tutor" });
  }
});

// 6
app.get("/admin/animais", async (req, res) => {
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

// 7
app.patch("/admin/animais/:id", async (req, res) => {
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

    const decryptedPassword = safeDecrypt(usuario);
    if (!decryptedPassword || senha !== decryptedPassword || !usuario.administrador) {
      return res.status(403).json({ erro: "Acesso não autorizado" });
    }

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

// 8
app.get("/tutores/:id", async (req, res) => {
  try {
    const {id} = req.params;
    if (!id) return res.status(400).send({"erro": "Inclua o ID do tutor na rota"});
    if (!isValidUUID(id)) return res.status(400).json({ erro: "ID do tutor inválido. Deve ser um UUID" });

    const user = await Usuario.findOne({
      where: { id:id },
      include: [
        {
          model: Questionario,
          as: "questionario",
          attributes: { exclude: ["updatedAt"] },
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt", "senha"] },
      order: [[{ model: Questionario, as: "questionario" }, "createdAt", "ASC"]],
    });
    if (!user) return res.status(404).json({"erro": "Tutor não encontrado"});
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({"erro": "Erro ao buscar dados do tutor"})
  }
});

// 9
app.delete("/admin/animais/:id", async (req, res) => {
  try {
    const {email, senha} = req.body; const {id} = req.params;

    if (!id) return res.status(400).send({"erro": "Inclua o ID do animal na rota"});
    if (!isValidUUID(id)) return res.status(400).json({ erro: "ID do animal inválido. Deve ser um UUID" });

    if (!email || !senha) return res.status(400).json({"erro": "Inclua email e senha no body da request"});

    const animal = await Animal.findOne({where:{id: id}});
    if (!animal) return res.status(404).json({"erro": "Animal não encontrado"});

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ erro: "Usuário não encontrado" });
    const decryptedPassword = safeDecrypt(user);
    if (!decryptedPassword || senha !== decryptedPassword || !user.administrador) return res.status(403).json({ erro: "Acesso não autorizado" });

    await animal.destroy();
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({"erro": "Erro ao remover animal"});
  }
})

// 10
app.get("/animais/:id", async (req, res) => {
  try {
    const {email, senha} = req.query; const {id} = req.params;
    if (!id) return res.status(400).send({"erro": "Inclua o ID do animal na rota"});
    if (!isValidUUID(id)) return res.status(400).json({ erro: "ID do animal inválido. Deve ser um UUID" });
    if (!email || !senha) return res.status(400).json({"erro": "Inclua email e senha na query da request"});

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
    if (!animal) return res.status(404).json({"erro": "Animal não encontrado"});
    return res.status(200).json(animal);
  } catch (err) {
    console.error(err);
    return res.status(500).json({"erro": "Erro ao achar animal"})
  }
});

// 11
app.post('/autenticacao', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email|| !senha) return res.status(400).json({"erro": "Missing email and or password in request body"});

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ erro: "Email ou senha inválidos." });
    const decryptedPassword = safeDecrypt(user);
    if (!decryptedPassword || senha !== decryptedPassword) return res.status(401).json({ erro: "Email ou senha inválidos." });

    return res.status(200).json({ message: "Login bem-sucedido!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno ao tentar fazer o login." });
  }
});

// 12
app.post('/doacoes', async (req, res) => {
  try {
    const {nome, email, valor, mensagem} = req.body;
    
    if (valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) <= 0) {
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
})

// init seeds sequelize
// it also has the test shit
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

  try {
    await Animal.create({
      nome: "Totó",
      especie: "Cachorro",
      porte: "Médio",
      castrado: true,
      vacinado: true,
      adotado: false,
      descricao: "Um cachorro muito amigável e brincalhão.",
    });
  } catch (err) {
    console.error("Erro na seed Animal.create:", err);
  }

  try {
    const encryptedSenha = encrypt("daora", secretKey, 256)

    await Usuario.create({
      nome_completo: "Hugi based",
      email: "<hugi@gmail.com>",
      senha: encryptedSenha,
      cidade: "São Paulo",
      estado: "SP",
      idade: 25,
      telefone: "11999999999",
      administrador: true
    });
  } catch (err) {
    console.error("Erro na seed Usuario.create (Hugi):", err);
  }

  try {
    const encryptedSenha = encrypt("daora", secretKey, 256)

    await Usuario.create({
      nome_completo: "Joana Silva",
      email: "<jono@email.com>",
      senha: encryptedSenha,
      cidade: "São Paulo",
      estado: "SP",
      idade: 25,
      telefone: "11999999999",
      administrador: false
    });
  } catch (err) {
    console.error("Erro na seed Usuario.create (Joana):", err);
  }

  try {
    const usuario = await Usuario.findOne({
      where: {
        email: '<jono@email.com>'
      }
    });

    if (!usuario) {
      console.error("Usuário não encontrado para vincular ao questionário.");
    } else {
      const questionario = await Questionario.create({
        usuarioId: usuario.id,
        empregado: true,
        quantos_animais_possui: 2,
        motivos_para_adotar: "Procurando um animal de estimação",
        quem_vai_sustentar_o_animal: "Eu",
        numero_adultos_na_casa: 2,
        numero_criancas_na_casa: 1,
        idades_criancas: [5],
        residencia_tipo: "Casa",
        proprietario_permite_animais: true,
        todos_de_acordo_com_adocao: true,
        responsavel_pelo_animal: "Joana Silva",
        responsavel_concorda_com_adocao: true,
        ha_alergico_ou_pessoas_que_nao_gostam: false,
        gasto_mensal_estimado: 500,
        valor_disponivel_no_orcamento: true,
        tipo_alimentacao: "Ração seca",
        local_que_o_animal_vai_ficar: "Quarto",
        forma_de_permanencia: "Livre",
        forma_de_confinamento: "Cercado",
        tera_brinquedos: true,
        tera_abrigo: true,
        tera_passeios_acompanhado: true,
        tera_passeios_sozinho: false,
        companhia_outro_animal: true,
        companhia_humana_24h: true,
        companhia_humana_parcial: false,
        sem_companhia_humana: false,
        sem_companhia_animal: false,
        o_que_faz_em_viagem: "Levar para um hotel de animais",
        o_que_faz_se_fugir: "Procurar e chamar",
        o_que_faz_se_nao_puder_criar: "Buscar um novo lar",
        animais_que_ja_criou: "Cachorros e gatos",
        destino_animais_anteriores: "Adotados com sucesso",
        costuma_esterilizar: true,
        costuma_vacinar: true,
        costuma_vermifugar: true,
        veterinario_usual: "Veterinário local",
        forma_de_educar: "Comando positivo",
        envia_fotos_e_videos_do_local: true,
        aceita_visitas_e_fotos_do_animal: true,
        topa_entrar_grupo_adotantes: true,
        concorda_com_taxa_adocao: true,
        data_disponivel_para_buscar_animal: "2025-09-01"
      });

      console.log("Questionário criado e vinculado ao usuário Joana Silva:", questionario.toJSON());
    }
  } catch (err) {
    console.error("Erro criando Questionario:", err);
  }

  try {
    await Doacao.create({
      nome: "Maria Oliveira",
      email: "<jono@email.com>",
      valor: 200.50,
      linkPix: "1234567890abcdef",
      mensagem: "Gostaria de ajudar na adoção de animais"
    });
  } catch (err) {
    console.error("Erro na seed Doacao.create:", err);
  }

  try {
    const teste = await Usuario.findOne({where: {nome_completo: "Teste User"}});
    if (teste) console.log("hey boy\n\n" + teste.id);
  } catch (err) {
    console.error("Erro buscando Totó:", err);
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

init();