-- Tabela: animais
CREATE TABLE animais (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    especie TEXT NOT NULL,
    porte TEXT NOT NULL,
    castrado BOOLEAN NOT NULL DEFAULT 0,
    vacinado BOOLEAN NOT NULL DEFAULT 0,
    adotado BOOLEAN NOT NULL DEFAULT 0,
    descricao TEXT NOT NULL,
    foto BLOB,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: doacoes
CREATE TABLE doacoes (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    valor REAL NOT NULL,
    linkPix TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Usuario (também chamado de Tutor em algumas partes do seu código)
CREATE TABLE Usuario (
    id TEXT PRIMARY KEY NOT NULL,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    idade INTEGER NOT NULL,
    telefone TEXT NOT NULL,
    celular TEXT,
    cpf TEXT UNIQUE,
    endereco TEXT,
    bairro TEXT,
    cep INTEGER,
    instagram TEXT,
    facebook TEXT,
    administrador BOOLEAN NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: questionarios
CREATE TABLE questionarios (
    id TEXT PRIMARY KEY NOT NULL,
    empregado BOOLEAN,
    quantos_animais_possui INTEGER NOT NULL,
    motivos_para_adotar TEXT NOT NULL,
    quem_vai_sustentar_o_animal TEXT NOT NULL,
    numero_adultos_na_casa INTEGER NOT NULL,
    numero_criancas_na_casa INTEGER NOT NULL,
    idades_criancas TEXT,
    residencia_tipo TEXT NOT NULL,
    proprietario_permite_animais BOOLEAN NOT NULL,
    todos_de_acordo_com_adocao BOOLEAN NOT NULL,
    responsavel_pelo_animal TEXT NOT NULL,
    responsavel_concorda_com_adocao BOOLEAN NOT NULL,
    ha_alergico_ou_pessoas_que_nao_gostam BOOLEAN NOT NULL,
    gasto_mensal_estimado INTEGER NOT NULL,
    valor_disponivel_no_orcamento BOOLEAN NOT NULL,
    tipo_alimentacao TEXT NOT NULL,
    local_que_o_animal_vai_ficar TEXT NOT NULL,
    forma_de_permanencia TEXT NOT NULL,
    forma_de_confinamento TEXT NOT NULL,
    tera_brinquedos BOOLEAN NOT NULL,
    tera_abrigo BOOLEAN NOT NULL,
    tera_passeios_acompanhado BOOLEAN NOT NULL,
    tera_passeios_sozinho BOOLEAN NOT NULL,
    companhia_outro_animal BOOLEAN NOT NULL,
    companhia_humana_24h BOOLEAN NOT NULL,
    companhia_humana_parcial BOOLEAN NOT NULL,
    sem_companhia_humana BOOLEAN NOT NULL,
    sem_companhia_animal BOOLEAN NOT NULL,
    o_que_faz_em_viagem TEXT NOT NULL,
    o_que_faz_se_fugir TEXT NOT NULL,
    o_que_faz_se_nao_puder_criar TEXT NOT NULL,
    animais_que_ja_criou TEXT NOT NULL,
    destino_animais_anteriores TEXT NOT NULL,
    costuma_esterilizar BOOLEAN NOT NULL,
    costuma_vacinar BOOLEAN NOT NULL,
    costuma_vermifugar BOOLEAN NOT NULL,
    veterinario_usual TEXT NOT NULL,
    forma_de_educar TEXT NOT NULL,
    envia_fotos_e_videos_do_local BOOLEAN NOT NULL,
    aceita_visitas_e_fotos_do_animal BOOLEAN NOT NULL,
    topa_entrar_grupo_adotantes BOOLEAN NOT NULL,
    concorda_com_taxa_adocao BOOLEAN NOT NULL,
    data_disponivel_para_buscar_animal TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: pedidos_adocao
CREATE TABLE pedidos_adocao (
    id TEXT PRIMARY KEY NOT NULL,
    status TEXT NOT NULL DEFAULT 'em_analise',
    posicao_fila INTEGER,
    tutorId TEXT NOT NULL,
    animalId TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutorId) REFERENCES Usuario(id),
    FOREIGN KEY (animalId) REFERENCES animais(id)
);
