// index.js
import { Sequelize } from 'sequelize';

// Importa os modelos
import AnimalModel from './models/Animal.js';
import UsuarioModel from './models/Usuario.js';
import QuestionarioModel from './models/Questionario.js';
import PedidoAdocaoModel from './models/PedidoAdocao.js';
import DoacaoModel from './models/Doacao.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: true,
});

const Animal = AnimalModel(sequelize);
const Usuario = UsuarioModel(sequelize);
const Questionario = QuestionarioModel(sequelize);
const PedidoAdocao = PedidoAdocaoModel(sequelize);
const Doacao = DoacaoModel(sequelize);

// associações
Usuario.hasOne(Questionario, { foreignKey: 'usuarioId' });
Questionario.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(PedidoAdocao, { foreignKey: 'tutorId' });
PedidoAdocao.belongsTo(Usuario, { foreignKey: 'tutorId' });
Animal.hasMany(PedidoAdocao, { foreignKey: 'animalId' });
PedidoAdocao.belongsTo(Animal, { foreignKey: 'animalId' });

try {
  await sequelize.sync({ alter: true }); 
  console.log('Banco de dados sincronizado com sucesso!');
} catch (error) {
  console.error('Erro ao sincronizar o banco:', error);
}

// não sei
export { sequelize, Animal, Usuario, Questionario, PedidoAdocao, Doacao };
