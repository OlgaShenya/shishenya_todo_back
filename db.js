const Sequelize = require("sequelize");
const sequelize = new Sequelize("todo_list", "postgres", "111", {
    dialect: "postgres",
    host: "localhost",
    define: {
        timestamps: false
    }
});

function cleanobj(obj) {
    return JSON.parse(JSON.stringify(obj))
}
//********************************** TODO *********************************************** */
TodoModel = sequelize.define("todo", {
    text: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ischecked: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});

module.exports.CreateTodo = async (userId, text, ischecked) => {
    const result = {};
    try {

        await TodoModel.create(
            {
                text: text,
                ischecked: ischecked,
                userId: userId
            }
        )
    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.GetTodo = async (pageSize, pageNumber, userId, ischecked) => {
    const result = {};
    try {
        await TodoModel.findAndCountAll({
            order: [['id', 'ASC']],
            limit: pageSize || 5,
            offset: (pageNumber || 0) * (pageSize || 5),
            where: ischecked === undefined ? { userId: userId } : {
                userId: userId,
                ischecked: ischecked
            }
        })
    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.UpdateTodo = async (ischecked, text, id) => {
    const result = {};
    try {
        await TodoModel.update(cleanobj({
            text: text,
            ischecked: ischecked
        }), {
            where: {
                id: id
            }
        })
    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.UpdateTodoIschecked = async (ischecked, userId) => {
    const result = {};
    try {
        await TodoModel.update({
            ischecked: ischecked
        }, {
            where: {
                userId: userId
            }
        });
    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.DeleteTodo = async (id) => {
    const result = {};
    try {
        await TodoModel.destroy({
            where: {
                id: id
            }
        })

    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.DeleteTodoChecked = async (userId) => {
    const result = {};
    try {
        await TodoModel.destroy({
            where: {
                userId: userId,
                ischecked: true,
            }
        })
    } catch (error) {
        result.error = error.message;
    }
    return result;
}

//************************************* USER ******************************************** */
UserModel = sequelize.define('user', {
    login: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports.CreateUser = async (login, password) => {
    const result = {};
    try {
        const user = await UserModel.create({
            login: login,
            password: password
        });

        result.id = user.id;
        result.login = user.login;

    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.GetUser = async (login, password) => {
    const result = {};
    try {
        result = await UserModel.findOne({
            attributes: ['id', 'login'],
            where: {
                login: login || "nologin",
                password: password || "nopassword"
            }
        })
    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.DeleteUser = async (id) => {
    const result = {};
    try {
        result.deleted = await UserModel.destroy({
            where: {
                id: id
            }
        });
    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.UpdateUser = async (user) => {
    const result = {};
    try {
        await UserModel.update({
            password: user.password
        }, {
            where: {
                id: user.id
            }
        });
    } catch (error) {
        result.error = error.message;
    }
    return result;
}
//********************************************************************************* */
this.Todo.belongsTo(UserModel, {
    onDelete: 'cascade',
    foreignKey: {
        field: 'userId',
        allowNull: false,
    }
});

sequelize.sync()
    .then(result => {
        console.log(result);
    })
    .catch(err => console.log('sync():', err.message));

