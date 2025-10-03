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

    // Criar questionário, se enviado e válido

    if (questionario) {
      const {
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
      } = questionario;


      if (
        typeof empregado !== 'boolean' ||
        !quantos_animais_possui ||
        !motivos_para_adotar ||
        !quem_vai_sustentar_o_animal ||
        !numero_adultos_na_casa ||
        !numero_criancas_na_casa ||
        !(Array.isArray(idades_criancas) && idades_criancas.length > 0) ||
        !residencia_tipo ||
        typeof proprietario_permite_animais !== 'boolean' ||
        typeof todos_de_acordo_com_adocao !== 'boolean' ||
        !responsavel_pelo_animal ||
        typeof responsavel_concorda_com_adocao !== 'boolean' ||
        typeof ha_alergico_ou_pessoas_que_nao_gostam !== 'boolean' ||
        !gasto_mensal_estimado ||
        typeof valor_disponivel_no_orcamento !== 'boolean' ||
        !tipo_alimentacao ||
        !local_que_o_animal_vai_ficar ||
        !forma_de_permanencia ||
        !forma_de_confinamento ||
        typeof tera_brinquedos !== 'boolean' ||
        typeof tera_abrigo !== 'boolean' ||
        typeof tera_passeios_acompanhado !== 'boolean' ||
        typeof tera_passeios_sozinho !== 'boolean' ||
        typeof companhia_outro_animal !== 'boolean' ||
        typeof companhia_humana_24h !== 'boolean' ||
        typeof companhia_humana_parcial !== 'boolean' ||
        typeof sem_companhia_humana !== 'boolean' ||
        typeof sem_companhia_animal !== 'boolean' ||
        !o_que_faz_em_viagem ||
        !o_que_faz_se_fugir ||
        !o_que_faz_se_nao_puder_criar ||
        !animais_que_ja_criou ||
        !destino_animais_anteriores ||
        typeof costuma_esterilizar !== 'boolean' ||
        typeof costuma_vacinar !== 'boolean' ||
        typeof costuma_vermifugar !== 'boolean' ||
        !veterinario_usual ||
        !forma_de_educar ||
        typeof envia_fotos_e_videos_do_local !== 'boolean' ||
        typeof aceita_visitas_e_fotos_do_animal !== 'boolean' ||
        typeof topa_entrar_grupo_adotantes !== 'boolean' ||
        typeof concorda_com_taxa_adocao !== 'boolean' ||
        !data_disponivel_para_buscar_animal
      ) {
        return res.status(400).json({ erro: "Todos os campos obrigatórios do questionário devem ser preenchidos corretamente." });
      }
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
  console.log(req.body);
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

    if (
      !usuarioId ||
      typeof empregado !== 'boolean' ||
      !quantos_animais_possui ||
      !motivos_para_adotar ||
      !quem_vai_sustentar_o_animal ||
      !numero_adultos_na_casa ||
      numero_criancas_na_casa == null ||
      // mudar depois as verificações de numeros de ! para == null
      !(Array.isArray(idades_criancas)) ||
      !residencia_tipo ||
      typeof proprietario_permite_animais !== 'boolean' ||
      typeof todos_de_acordo_com_adocao !== 'boolean' ||
      !responsavel_pelo_animal ||
      typeof responsavel_concorda_com_adocao !== 'boolean' ||
      typeof ha_alergico_ou_pessoas_que_nao_gostam !== 'boolean' ||
      !gasto_mensal_estimado ||
      typeof valor_disponivel_no_orcamento !== 'boolean' ||
      !tipo_alimentacao ||
      !local_que_o_animal_vai_ficar ||
      !forma_de_permanencia ||
      !forma_de_confinamento ||
      typeof tera_brinquedos !== 'boolean' ||
      typeof tera_abrigo !== 'boolean' ||
      typeof tera_passeios_acompanhado !== 'boolean' ||
      typeof tera_passeios_sozinho !== 'boolean' ||
      typeof companhia_outro_animal !== 'boolean' ||
      typeof companhia_humana_24h !== 'boolean' ||
      typeof companhia_humana_parcial !== 'boolean' ||
      typeof sem_companhia_humana !== 'boolean' ||
      typeof sem_companhia_animal !== 'boolean' ||
      !o_que_faz_em_viagem ||
      !o_que_faz_se_fugir ||
      !o_que_faz_se_nao_puder_criar ||
      !animais_que_ja_criou ||
      !destino_animais_anteriores ||
      typeof costuma_esterilizar !== 'boolean' ||
      typeof costuma_vacinar !== 'boolean' ||
      typeof costuma_vermifugar !== 'boolean' ||
      !veterinario_usual ||
      !forma_de_educar ||
      typeof envia_fotos_e_videos_do_local !== 'boolean' ||
      typeof aceita_visitas_e_fotos_do_animal !== 'boolean' ||
      typeof topa_entrar_grupo_adotantes !== 'boolean' ||
      typeof concorda_com_taxa_adocao !== 'boolean' ||
      !data_disponivel_para_buscar_animal
    ) {
      return res.status(400).json({ erro: "Todos os campos obrigatórios devem ser preenchidos corretamente." });
    }
    

    
    // Verifica se o usuário existe e se ele tem um questioanrio já
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(400).json({ erro: "Usuário não encontrado." });
    }
    const questionarioExistente = await Questionario.findOne({ where: { usuarioId } });
    if (questionarioExistente) {
      return res.status(400).json({ erro: "Este usuário já possui um questionário cadastrado." });
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