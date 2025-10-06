import QRCode from 'qrcode';
import { config } from 'dotenv';
import { isValidUUID, getUserByEmail, safeDecrypt, requireAdmin } from '../../functions/helpers.js';
import { Questionario, Usuario } from '../../../models/Modelos.js';
import encryptjs from "encryptjs";
const encrypt = encryptjs.encrypt;
import express from 'express';
const router = express.Router();

config();
const secretKey = process.env.SECRET_KEY;


function validateQuestionario(data) {
    const errors = [];
    if (!data) {
        return { isValid: false, errors: ["O objeto 'questionario' não foi fornecido."] };
    }

    // integer não nulo
    const integerFields = ['quantos_animais_possui', 'numero_adultos_na_casa', 'numero_criancas_na_casa', 'gasto_mensal_estimado'];
    for (const field of integerFields) {
        if (data[field] == null || typeof data[field] !== 'number' || !Number.isInteger(data[field])) {
            errors.push(`O campo '${field}' é obrigatório e deve ser um número inteiro.`);
        }
    }

    // string não nulo
    const stringFields = [
        'motivos_para_adotar', 'quem_vai_sustentar_o_animal', 'residencia_tipo', 'responsavel_pelo_animal', 
        'tipo_alimentacao', 'local_que_o_animal_vai_ficar', 'forma_de_permanencia', 'forma_de_confinamento', 
        'o_que_faz_em_viagem', 'o_que_faz_se_fugir', 'o_que_faz_se_nao_puder_criar', 'animais_que_ja_criou', 
        'destino_animais_anteriores', 'veterinario_usual', 'forma_de_educar', 'data_disponivel_para_buscar_animal'
    ];
    for (const field of stringFields) {
        if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
            errors.push(`O campo '${field}' é obrigatório e não pode estar vazio.`);
        }
    }
    
    // booleans não nulos
    const booleanFields = [
        'proprietario_permite_animais', 'todos_de_acordo_com_adocao', 'responsavel_concorda_com_adocao', 
        'ha_alergico_ou_pessoas_que_nao_gostam', 'valor_disponivel_no_orcamento', 'tera_brinquedos', 
        'tera_abrigo', 'tera_passeios_acompanhado', 'tera_passeios_sozinho', 'companhia_outro_animal', 
        'companhia_humana_24h', 'companhia_humana_parcial', 'sem_companhia_humana', 'sem_companhia_animal', 
        'costuma_esterilizar', 'costuma_vacinar', 'costuma_vermifugar', 'envia_fotos_e_videos_do_local', 
        'aceita_visitas_e_fotos_do_animal', 'topa_entrar_grupo_adotantes', 'concorda_com_taxa_adocao'
    ];
    for (const field of booleanFields) {
        if (typeof data[field] !== 'boolean') {
            errors.push(`O campo '${field}' é obrigatório e deve ser um valor booleano (true/false).`);
        }
    }

    // booleans nulos
    if (data.empregado != null && typeof data.empregado !== 'boolean') {
        errors.push(`O campo 'empregado' deve ser um valor booleano (true/false) ou nulo.`);
    }

    // idades_crianças
    if (typeof data.numero_criancas_na_casa === 'number' && data.numero_criancas_na_casa > 0) {
        if (!Array.isArray(data.idades_criancas) || data.idades_criancas.length === 0) {
            errors.push("O campo 'idades_criancas' é obrigatório e deve ser uma lista com pelo menos uma idade, pois 'numero_criancas_na_casa' é maior que zero.");
        }
    } else if (data.idades_criancas != null && !Array.isArray(data.idades_criancas)) {
        errors.push("O campo 'idades_criancas' deve ser uma lista (array).");
    }

    // data
    if (data.data_disponivel_para_buscar_animal && isNaN(Date.parse(data.data_disponivel_para_buscar_animal))) {
        errors.push("O campo 'data_disponivel_para_buscar_animal' deve ser uma data válida (ex: 'YYYY-MM-DD').");
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}


router.post("/usuario", async (req, res) => {
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
    const emailExistente = await getUserByEmail(email);
    if (emailExistente) {
      return res.status(400).json({ erro: "Email preenchido já está sendo utilizado." });
    }

    // se o questionario foi enviado, o verifica antes de criar o usuário
    if (questionario) {
      const validationResult = validateQuestionario(questionario);
      if (!validationResult.isValid) {
        return res.status(400).json({ erros: validationResult.errors });
      }
    }
    

    let newsenha = encrypt(senha, secretKey, 256);

    // Criar usuário
    const novoUsuario = await Usuario.create({
      nome_completo,
      senha : newsenha,
      email,
      cidade,
      estado,
      idade,
      telefone,
      instagram,
      facebook
    });

    // cria questionario
    if (questionario) {
      let usuario = await getUserByEmail(email)
      Questionario.usuarioId = usuario.id
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

router.post("/questionario", async (req, res) => {
  try {
    const { usuarioId, ...questionarioData } = req.body;

    if (!usuarioId || !isValidUUID(usuarioId)) {
        return res.status(400).json({ erro: "O campo 'usuarioId' é obrigatório e deve ser um UUID válido." });
    }

    const validationResult = validateQuestionario(questionarioData);
    if (!validationResult.isValid) {
        return res.status(400).json({ erros: validationResult.errors });
    }
    
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const questionarioExistente = await Questionario.findOne({ where: { usuarioId } });
    if (questionarioExistente) {
      return res.status(400).json({ erro: "Este usuário já possui um questionário cadastrado." });
    }

    const questionarioCriado = await Questionario.create({
      ...questionarioData,
      usuarioId
    });

    return res.status(201).json(questionarioCriado);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno ao cadastrar o questionário." });
  }
});

router.patch("/tutores/:id", async (req, res) => {
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
    
    const auth = await requireAdmin(authEmail, authSenha);
    if (usuario.id.toString() != id && !auth.ok) return res.status(auth.code).json({ erro: auth.erro });

    if (!dadosAtualizacao || Object.keys(dadosAtualizacao).length === 0) {
      return res.status(400).json({ erro: "Pelo menos um campo deve ser enviado para atualização" });
    }

    const tutor = await Usuario.findByPk(id, {
      include: [{ model: Questionario, as: "questionario" }]
    });
    if (!tutor) {
      return res.status(404).json({ erro: "Tutor não encontrado" });
    }

    if (dadosAtualizacao.senha) {
      const novaSenha = encrypt(dadosAtualizacao.senha, secretKey, 256);
      dadosAtualizacao.senha = novaSenha;
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

router.get("/tutores/:id", async (req, res) => {
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

export default router;