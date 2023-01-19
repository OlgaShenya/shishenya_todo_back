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
    isChecked: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});

module.exports.CreateTodo = async (userId, text, isChecked) => {
    const result = {};
    try {

        await TodoModel.create(
            {
                text: text,
                isChecked: isChecked,
                userId: userId
            }
        )
    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.GetTodo = async (pageSize, pageNumber, userId, isChecked) => {
    const result = {};
    try {
        const res = await TodoModel.findAndCountAll({
            order: [['id', 'ASC']],
            limit: pageSize || 5,
            offset: (pageNumber || 0) * (pageSize || 5),
            where: isChecked === undefined ? { userId: userId } : {
                userId: userId,
                isChecked: isChecked
            }
        })
        result.total = res.count;
        result.rows = res.rows;
    } catch (error) {
        result.error = error.message;
    }
    return result;
}

module.exports.CountTodo = async (userId) => {
    let res = {
        active: 0,
        completed: 0,
    };
    try {
        const counts = await TodoModel.count({
            group: ['isChecked'],
            where: {
                userId: userId
            }
        })
        //[{isChecked:true,count:3},{isChecked:false,count:3}]
        counts.forEach(item => {
            if (item.isChecked === null) return;
            if (item.isChecked) {
                res.completed = item.count;
            } else {
                res.active = item.count;
            }
        });
    } catch (error) {
        res.error = error.message;
    }
    return res;
}


module.exports.UpdateTodo = async (isChecked, text, id) => {
    const result = {};
    try {
        await TodoModel.update(cleanobj({
            text: text,
            isChecked: isChecked
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

module.exports.UpdateTodoIschecked = async (isChecked, userId) => {
    const result = {};
    try {
        await TodoModel.update({
            isChecked: isChecked
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
                isChecked: true,
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
        const user = await UserModel.findOne({
            attributes: ['id', 'login'],
            where: {
                login: login || "nologin",
                password: password || "nopassword"
            }
        })
        result.id = user.id;
        result.login = user.login;
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
TodoModel.belongsTo(UserModel, {
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

