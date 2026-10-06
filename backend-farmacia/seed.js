// seed.js
const { sequelize, User, TipoMedic, Medicamento } = require('./models');
const bcrypt = require('bcryptjs');

const insertarDatos = async () => {
  try {
    // Sincroniza la BD sin borrar tablas existentes
    await sequelize.sync();

    // 1. Insertar Usuario Administrador inicial
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.findOrCreate({
      where: { email: 'admin@farmacia.com' },
      defaults: {
        nombre: 'Administrador',
        password: hashedPassword,
        rol: 'admin'
      }
    });

    // 1b. Insertar Usuario Moderador inicial
    const hashedMod = await bcrypt.hash('mod123', 10);
    await User.findOrCreate({
      where: { email: 'mod@farmacia.com' },
      defaults: {
        nombre: 'Moderador',
        password: hashedMod,
        rol: 'moderador'
      }
    });

    // 1c. Insertar Usuario Cliente inicial
    const hashedCli = await bcrypt.hash('cliente123', 10);
    await User.findOrCreate({
      where: { email: 'cliente@farmacia.com' },
      defaults: {
        nombre: 'Cliente Demo',
        password: hashedCli,
        rol: 'cliente'
      }
    });

    // 2. Insertar Tipos de Medicamento
    const analgesicos = await TipoMedic.findOrCreate({
      where: { nombre: 'Analgésicos' },
      defaults: { descripcion: 'Medicamentos para aliviar el dolor' }
    });

    const antibioticos = await TipoMedic.findOrCreate({
      where: { nombre: 'Antibióticos' },
      defaults: { descripcion: 'Medicamentos para combatir infecciones bacterianas' }
    });

    // 3. Insertar Medicamentos vinculados a su Tipo
    await Medicamento.findOrCreate({
      where: { nombre: 'Paracetamol 500mg' },
      defaults: {
        descripcion: 'Caja x 20 tabletas',
        precio: 5.50,
        stock: 100,
        tipoMedicId: analgesicos[0].id
      }
    });

    await Medicamento.findOrCreate({
      where: { nombre: 'Amoxicilina 500mg' },
      defaults: {
        descripcion: 'Caja x 12 cápsulas',
        precio: 12.80,
        stock: 50,
        tipoMedicId: antibioticos[0].id
      }
    });

    console.log('Registros iniciales insertados correctamente con Sequelize.');
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar registros:', error);
    process.exit(1);
  }
};

insertarDatos();
