const Sequelize = require("sequelize");
const sequelize = new Sequelize("todo_list", "postgres", "111", {
    dialect: "postgres",
    host: "localhost",
    define: {
        timestamps: false
    }
});

module.exports.Todo = sequelize.define("todo", {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    text: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ischecked: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});

sequelize.sync()
    .then(result => {
        console.log(result);
    })
    .catch(err => console.log('sync():', err.message));

