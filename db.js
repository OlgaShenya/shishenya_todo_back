const Sequelize = require("sequelize");
const sequelize = new Sequelize("todo_list", "postgres", "111", {
    dialect: "postgres",
    host: "localhost",
    define: {
        timestamps: false
    }
});

module.exports.Todo = sequelize.define("todo", {
    text: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ischecked: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});

module.exports.User = sequelize.define('user', {
    login: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    token: {
        type: Sequelize.STRING,
    }
});

this.User.hasOne(this.Todo);
this.Todo.belongsTo(this.User, {
    onDelete: 'cascade',
    foreignKey: {
        field: 'userId',
        allowNull: false,
    }
});

module.exports.CreateTodo = (user, todo) => {
    return this.Todo.create({
        text: todo.text,
        isChecked: todo.isChecked,
        userId: user.id
    });
};

module.exports.sql = (sql) => {
    return sequelize.query(sql);
}

sequelize.sync()
    .then(result => {
        console.log(result);
    })
    .catch(err => console.log('sync():', err.message));

