const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite'
});

//TABELA USUARIO 
const Usuarios = sequelize.define('Usuarios', {
    idUsuario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nomeUsuario: {
      type: DataTypes.STRING
    },
    cpf: {
      type: DataTypes.STRING,
      unique: true
    },
    emailUsuario: {
      type: DataTypes.STRING
    },
    senha: {
      type: DataTypes.STRING
    }
});

//TABELA CLIENTES
const Clientes = sequelize.define('Clientes', {
    idCliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomeCliente: {
      type: DataTypes.STRING
    },
    cpfCnpj: {
      type: DataTypes.STRING
    },
    endereco: {
      type: DataTypes.STRING
    },
    bairro: {
      type: DataTypes.STRING
    },
    municipio: {
      type: DataTypes.STRING
    },
    estado: {
      type: DataTypes.STRING
    },
    celular: {
      type: DataTypes.STRING
    },
    emailCliente: {
      type: DataTypes.STRING
    },
    tipoCliente: {
      type: DataTypes.STRING
    }
});
  
//TABELA SERVIÇO
const Servicos = sequelize.define('Servicos', {
    idServico: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    dataInicio: {
      type: DataTypes.DATE
    },
    dataFim: {
      type: DataTypes.DATE
    },
    valorTotal: {
      type: DataTypes.FLOAT
    }
});
  
//TABELA PAGAMENTOS
const Pagamentos = sequelize.define('Pagamentos', {
  idPagamento: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  situacaoPag: {
      type: DataTypes.STRING,
  },
  tipoPag: {
      type: DataTypes.STRING,
  },
  idServico: {
      type: DataTypes.INTEGER,
      references: {
          model: Servicos,
          key: 'idServico',
      },
      onDelete: 'CASCADE',
  },
  dataPagamento: {
      type: DataTypes.DATE,
  },
  valorPagamento: {
      type: DataTypes.FLOAT,
  },
  detalhesPagamento: {
      type: DataTypes.STRING,
  },
});
  
//TABELA FERRAMENTAS
const Ferramentas = sequelize.define('Ferramentas', {
    idFerramenta: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nomeFerramenta: {
      type: DataTypes.STRING
    },
    localizacao: {
      type: DataTypes.STRING
    },
    outrasInfo: {
      type: DataTypes.STRING
    }
});
  
Usuarios.hasMany(Clientes, { foreignKey: 'idUsuario' });
Clientes.belongsTo(Usuarios, { foreignKey: 'idUsuario' });

Clientes.hasMany(Servicos, { foreignKey: 'idCliente' });
Servicos.belongsTo(Clientes, { foreignKey: 'idCliente' });

Ferramentas.belongsTo(Usuarios, { foreignKey: 'idUsuario' });

Servicos.hasMany(Pagamentos, { foreignKey: 'idServico' });
Pagamentos.belongsTo(Servicos, { foreignKey: 'idServico' });

app.get('/', (req, res) => {
    res.send('Servidor rodando');
});

//CADASTRO DE USUÁRIO
app.post('/cadastro', async (req, res) => {
    try {
      console.log('Recebida uma requisição POST em /cadastro:', req.body);
      
      const { idUsuario, nomeUsuario, cpf, emailUsuario, senha } = req.body;
  
      const usuarioExistente = await Usuarios.findOne({ where: { cpf } });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }
  
      const novoUsuario = await Usuarios.create({ idUsuario, nomeUsuario, cpf, emailUsuario, senha });
      return res.status(201).json(novoUsuario);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return res.status(500).json({ error: 'Erro no cadastro de usuário' });
    }
});

// ATUALIZAR DADOS DO USUÁRIO
app.put('/usuarios/:idUsuario', async (req, res) => {
  try {
      const { idUsuario } = req.params;
      const { nomeUsuario, cpf, emailUsuario, senha } = req.body;

      const usuario = await Usuarios.findByPk(idUsuario);
      if (!usuario) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      usuario.nomeUsuario = nomeUsuario;
      usuario.cpf = cpf;
      usuario.emailUsuario = emailUsuario;
      usuario.senha = senha;

      await usuario.save();

      return res.status(200).json(usuario);
  } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

//VERIFICAÇÃO DE LOGIN
app.post('/login', async (req, res) => {
    try {
        const { cpf, senha } = req.body;
    
        const usuario = await Usuarios.findOne({ where: { cpf } });
 
        if (!usuario) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
    
        if (usuario.senha !== senha) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const idUsuario = usuario.idUsuario; 
        const nomeUsuario = usuario.nomeUsuario;
        const outrasInformacoes = {};
        return res.status(200).json({ idUsuario, nomeUsuario, outrasInformacoes });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ error: 'Erro no login' });
    }
});

//CONSULTA DADOS DO USUÁRIO POR ID
app.get('/usuarios/:idUsuario', async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const usuario = await Usuarios.findByPk(idUsuario);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});

//CADASTRO DE CLIENTE
app.post('/cadastro-cliente', async (req, res) => {
    try {
        console.log('Recebida uma requisição POST em /cadastro-cliente:', req.body);

        const {
            idCliente,
            nomeCliente,
            cpfCnpj,
            endereco,
            bairro,
            municipio,
            estado,
            celular,
            emailCliente,
            idUsuario,
        } = req.body;

        const clienteExistente = await Clientes.findOne({ where: { cpfCnpj } });
        if (clienteExistente) {
            return res.status(400).json({ error: 'Cliente já cadastrado' });
        }

        const tipoCliente = cpfCnpj.length === 11 ? 'Pessoa Física' : 'Pessoa Jurídica';

        const novoCliente = await Clientes.create({
            idCliente,
            nomeCliente,
            cpfCnpj,
            endereco,
            bairro,
            municipio,
            estado,
            celular,
            emailCliente,
            tipoCliente,
            idUsuario,
        });

        return res.status(201).json(novoCliente);
    } catch (error) {
        console.error('Erro no cadastro de cliente:', error);
        return res.status(500).json({ error: 'Erro no cadastro de cliente' });
    }
});

//ATUALIZAR CLIENTE
app.put('/cadastro-cliente/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nomeCliente,
      cpfCnpj,
      endereco,
      bairro,
      municipio,
      estado,
      celular,
      emailCliente,
      tipoCliente,
      idUsuario
    } = req.body;

    const cliente = await Clientes.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    cliente.nomeCliente = nomeCliente;
    cliente.cpfCnpj = cpfCnpj;
    cliente.endereco = endereco;
    cliente.bairro = bairro;
    cliente.municipio = municipio;
    cliente.estado = estado;
    cliente.celular = celular;
    cliente.emailCliente = emailCliente;
    cliente.tipoCliente = tipoCliente;
    cliente.idUsuario = idUsuario;

    await cliente.save();

    return res.status(200).json(cliente);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

//EXCLUIR CLIENTE
app.delete('/cadastro-cliente/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Clientes.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    await cliente.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

//CONSULTA TABELA CLIENTES
app.get('/cadastro-cliente', async (req, res) => {
    try {
        const clientes = await Clientes.findAll();
        return res.status(200).json(clientes);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});

// CADASTRO DE SERVIÇO/OBRA
app.post('/cadastro-servico', async (req, res) => {
  try {
    console.log('Recebida uma requisição POST em /cadastro-servico:', req.body);

    const {
        idServico,
        dataInicio,
        dataFim,
        valorTotal,
        idCliente,
    } = req.body;

    const novoServico = await Servicos.create({
        idServico,
        dataInicio,
        dataFim,
        valorTotal,
        idCliente,
    });

    return res.status(201).json(novoServico);
  } catch (error) {
    console.error('Erro no cadastro de serviço:', error);
    return res.status(500).json({ error: 'Erro no cadastro de serviço' });
  }
});

// CONSULTA TABELA SERVIÇOS COM DADOS DOS CLIENTES E PAGAMENTOS
app.get('/cadastro-servico', async (req, res) => {
  try {
    const servicos = await Servicos.findAll({
      include: [
        {
          model: Clientes,
          attributes: ['nomeCliente', 'endereco']
        },
        {
          model: Pagamentos
        }
      ]
    });
    return res.status(200).json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// CONSULTA SERVIÇOS ATUAIS E FUTUROS
app.get('/servicos-clientes', async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const servicoFuturo = await Servicos.findOne({
      where: { dataInicio: { [Sequelize.Op.gt]: currentDate } },
      include: [{
        model: Clientes,
        attributes: ['nomeCliente', 'endereco' ],
      }]
    });

    const servicoAtual = await Servicos.findOne({
      where: {
        dataInicio: { [Sequelize.Op.lte]: endOfDay },
        dataFim: { [Sequelize.Op.gte]: currentDate },
      },
      include: [{
        model: Clientes,
        attributes: ['nomeCliente', 'endereco' ],
      }]
    });

    return res.status(200).json({ servicoAtual, servicoFuturo });
  } catch (error) {
    console.error('Erro ao buscar serviços e clientes:', error);
    return res.status(500).json({ error: 'Erro ao buscar serviços e clientes' });
  }
});


//ATUALIZAR SERVIÇO/OBRA
app.put('/cadastro-servico/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataInicio, dataFim, valorTotal, idCliente } = req.body;

    const servico = await Servicos.findByPk(id);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    servico.dataInicio = dataInicio;
    servico.dataFim = dataFim;
    servico.valorTotal = valorTotal;
    servico.idCliente = idCliente;

    await servico.save();

    return res.status(200).json(servico);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

//EXCLUIR SERVIÇO/OBRA
app.delete('/cadastro-servico/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servicos.findByPk(id);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    await servico.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

//CADASTRO DE PAGAMENTO
app.post('/cadastro-pagamento', async (req, res) => {
  try {
    console.log('Recebida uma requisição POST em /cadastro-pagamento:', req.body);

    const {
      idPagamento,
      situacaoPag,
      tipoPag,
      idServico,
      dataPagamento,
      valorPagamento,
      detalhesPagamento
    } = req.body;

    const servicoExistente = await Servicos.findByPk(idServico);
    if (!servicoExistente) {
      return res.status(400).json({ error: 'Serviço não encontrado' });
    }

    const novoPagamento = await Pagamentos.create({
      idPagamento,
      situacaoPag,
      tipoPag,
      idServico,
      dataPagamento,
      valorPagamento,
      detalhesPagamento
    });

    return res.status(201).json(novoPagamento);
  } catch (error) {
    console.error('Erro no cadastro de pagamento:', error);
    return res.status(500).json({ error: 'Erro no cadastro de pagamento' });
  }
});

//ATUALIZAR PAGAMENTO
app.put('/atualizar-pagamento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      situacaoPag,
      tipoPag,
      idServico,
      dataPagamento,
      valorPagamento,
      detalhesPagamento
    } = req.body;

    const pagamento = await Pagamentos.findByPk(id);
    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    pagamento.situacaoPag = situacaoPag;
    pagamento.tipoPag = tipoPag;
    pagamento.idServico = idServico;
    pagamento.dataPagamento = dataPagamento;
    pagamento.valorPagamento = valorPagamento;
    pagamento.detalhesPagamento = detalhesPagamento;

    await pagamento.save();

    return res.status(200).json(pagamento);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    return res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
});

// EXCLUIR PAGAMENTO
app.delete('/excluir-pagamento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pagamento = await Pagamentos.findByPk(id);
    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    await pagamento.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error);
    return res.status(500).json({ error: 'Erro ao excluir pagamento' });
  }
});

// CONSULTAR PAGAMENTO
app.get('/pagamentos', async (req, res) => {
  try {
    const pagamentos = await Pagamentos.findAll({
      include: [{
        model: Servicos,
        include: [{
          model: Clientes,
          attributes: ['nomeCliente']
        }],
        attributes: ['valorTotal', 'dataInicio', 'idServico']
      }]
    });

    return res.status(200).json(pagamentos);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});


//CADASTRO DE FERRAMENTA
app.post('/cadastro-ferramenta', async (req, res) => {
  try {
    console.log('Recebida uma requisição POST em /cadastro-ferramenta:', req.body);
    
    const {
      idFerramenta,
      nomeFerramenta,
      localizacao,
      outrasInfo,
      idUsuario,
    } = req.body;

    const novaFerramenta = await Ferramentas.create({
      idFerramenta,
      nomeFerramenta,
      localizacao,
      outrasInfo,
      idUsuario,
    });

    return res.status(201).json(novaFerramenta);
  } catch (error) {
    console.error('Erro no cadastro de ferramenta:', error);
    return res.status(500).json({ error: 'Erro no cadastro de ferramenta' });
  }
});

//CONSULTAR TABELA FERRAMENTAS
app.get('/cadastro-ferramenta', async (req, res) => {
  try {
      const ferramentas = await Ferramentas.findAll();
      return res.status(200).json(ferramentas);
  } catch (error) {
      console.error('Erro ao buscar ferramentas:', error);
      return res.status(500).json({ error: 'Erro ao buscar ferramentas' });
  }
});

//ATUALIZAR FERRAMENTA
app.put('/cadastro-ferramenta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeFerramenta, localizacao, outrasInfo, idUsuario } = req.body;

    const ferramenta = await Ferramentas.findByPk(id);
    if (!ferramenta) {
      return res.status(404).json({ error: 'Ferramenta não encontrada' });
    }

    ferramenta.nomeFerramenta = nomeFerramenta;
    ferramenta.localizacao = localizacao;
    ferramenta.outrasInfo = outrasInfo;
    ferramenta.idUsuario = idUsuario;

    await ferramenta.save();

    return res.status(200).json(ferramenta);
  } catch (error) {
    console.error('Erro ao atualizar ferramenta:', error);
    return res.status(500).json({ error: 'Erro ao atualizar ferramenta' });
  }
});

//EXCLUIR FERRAMENTA
app.delete('/cadastro-ferramenta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ferramenta = await Ferramentas.findByPk(id);
    if (!ferramenta) {
      return res.status(404).json({ error: 'Ferramenta não encontrada' });
    }
    await ferramenta.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir ferramenta:', error);
    return res.status(500).json({ error: 'Erro ao excluir ferramenta' });
  }
});

sequelize.sync().then(() => {
  console.log('Tabelas criadas (se não existirem)!');
}).catch(error => {
  console.error('Erro ao sincronizar tabelas:', error);
});
   
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
