import { Sequelize } from 'sequelize';
import AnimalModel from './Animal.js';
import UsuarioModel from './Usuario.js';
import QuestionarioModel from './Questionario.js';
import PedidoAdocaoModel from './PedidoAdocao.js';
import DoacaoModel from './Doacao.js';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
});

export const Animal = AnimalModel(sequelize);
export const Usuario = UsuarioModel(sequelize);
export const Questionario = QuestionarioModel(sequelize);
export const PedidoAdocao = PedidoAdocaoModel(sequelize);
export const Doacao = DoacaoModel(sequelize);

// Associações
// Explicação das associações:
// - Um Usuario tem um Questionario.
// - Um Usuario pode ter vários Pedidos de Adoção.
// - Um Animal pode ter vários Pedidos de Adoção.
// A tabela PedidosAdocao serve como uma tabela de junção entre Usuarioes e Animais.

Usuario.hasOne(Questionario, { foreignKey: "usuarioId", as: "questionario" });
Questionario.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

Usuario.hasMany(PedidoAdocao, { foreignKey: "tutorId", as: "pedidos" });
PedidoAdocao.belongsTo(Usuario, { foreignKey: "tutorId", as: "tutor" });

Animal.hasMany(PedidoAdocao, { foreignKey: 'animalId', as: 'pedidos' });
PedidoAdocao.belongsTo(Animal, { foreignKey: 'animalId', as: 'animal' });


await sequelize.sync();

export default { sequelize, Animal, Usuario, Questionario, PedidoAdocao, Doacao };
