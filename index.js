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
9 - yes
10 - yes
11 - yes
12 - yes

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


// SAMPLE CREATION
// SAMPLE CREATION
// SAMPLE CREATION
// SAMPLE CREATION

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
    //console.log("Animal criado:", teste.toJSON());
  } catch (err) {
    //console.error("Erro criando animal:", err);
  }
})();

//admin user
(async () => {
  try {
    const encryptedSenha = encrypt("daora", secretKey, 256)

    const usuario = await Usuario.create({
      nome_completo: "Hugi based",
      email: "<hugi@gmail.com>",
      senha: encryptedSenha,
      cidade: "São Paulo",
      estado: "SP",
      idade: 25,
      telefone: "11999999999",
      administrador: true
    });

    //console.log("Usuário criado:", usuario.toJSON());
  } catch (err) {
    //console.error("Erro criando usuário:", err);
  }
})();


(async () => {
  try {
    const encryptedSenha = encrypt("daora", secretKey, 256)

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

    //console.log("Usuário criado:", usuario.toJSON());
  } catch (err) {
    //console.error("Erro criando usuário:", err);
  }
})();

(async () => {
  try {
    const tutor = await Usuario.findOne({
      where: {
        email: '<jono@email.com>'
      }
    });

    const animal = await Animal.findOne({
      where: {
        nome: 'Totó'
      }
    });

    const pedidoAdocao = await PedidoAdocao.create({
      status: 'em_analise',
      posicao_fila: 1,
      tutorId: tutor.id,
      animalId: animal.id,
    });

    //console.log("PedidoAdocao criado:", pedidoAdocao.toJSON());
  } catch (err) {
    //console.error("Erro criando PedidoAdocao:", err);
  }
})();

(async () => {
  try {
    const questionario = await Questionario.create({
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

    //console.log("Questionario criado:", questionario.toJSON());
  } catch (err) {
    //console.error("Erro criando Questionario:", err);
  }
})();


(async () => {
  try {
    const doacao = await Doacao.create({
      nome: "Maria Oliveira",
      email: "<jono@email.com>",
      valor: 200.50,
      linkPix: "1234567890abcdef",
      mensagem: "Gostaria de ajudar na adoção de animais"
    });

    //console.log("Doacao criada:", doacao.toJSON());
  } catch (err) {
    //console.error("Erro criando Doacao:", err);
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

(async () => {
  const teste = await Animal.findOne({where: {nome: "Totó"}});
  console.log("hey boy\n" + teste.id);
})();

app.delete("/admin/animais/:id", async (req, res) => {
  try {
    const {email, senha} = req.body; const {id} = req.params;
    if (!email || !senha) return res.status(400).json({"error": "Inclua email e senha no body da request"});
    if (!id) return res.status(400).send({"error": "Inclua o ID do animal na rota"});
    const animal = await Animal.findOne({where:{id: id}});
    if (!animal) return res.status(401).json({"erro": "Animal não encontrado"});
    const user = await Usuario.findOne({ where: { email: email } });
    const decryptedPassword = decrypt(user.senha, secretKey, 256);
    if (senha !== decryptedPassword || !user.administrador) return res.status(403).json({ erro: "Acesso não autorizado" });
    animal.destroy();
    return res.status(204).end();
  } catch (err) {
    res.status(500).json({"erro": "Erro ao remover animal"});
  }
})

app.get("/animais/:id", async (req, res) => {
  try {
    const {email, senha} = req.query; const {id} = req.params;
    if (!id) return res.status(400).send({"error": "Inclua o ID do animal na rota"});
    if (!email || !senha) return res.status(400).json({"error": "Inclua email e senha no body da request"});

    const user = await Usuario.findOne({ where: { email: email } });
    const decryptedPassword = decrypt(user.senha, secretKey, 256);
    if (senha !== decryptedPassword || !user.administrador) return res.status(403).json({ erro: "Acesso não autorizado" });

    const animal = await Animal.findOne({
      where: { id },
      include: [
        {
          model: PedidoAdocao,
          as: "pedidos",
          attributes: ["id"], // only return the pedido ID
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] }, // hide these from the animal
      order: [[{ model: PedidoAdocao, as: "pedidos" }, "createdAt", "ASC"]], // order pedidos
    });
    if (!animal) return res.status(404).json({"erro": "Animal não encontrado"});
    return res.status(200).json(animal);
  } catch (err) {
    res.status(500).json({"erro": "Erro ao achar animal"})
  }
});


app.post('/autenticacao', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email|| !senha) res.status(400).json({"error": "Missing email and or password in request body"});

    const user = await Usuario.findOne({ where: { email: email } });

    const decryptedPassword = decrypt(user.senha, secretKey, 256);

    if (senha !== decryptedPassword) return res.status(401).json({ erro: "Email ou senha inválidos." });

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


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
