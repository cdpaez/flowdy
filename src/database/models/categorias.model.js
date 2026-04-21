//el patron utilizado aqui se basa en inyeccion de dependencias
module.exports = (sequelize, DataTypes) => {
    //construimos la funcion que va a ser exportada
    const Categoria = sequelize.define('Categoria', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'categorias',
        timestamps: false
    });

    return Categoria;
}