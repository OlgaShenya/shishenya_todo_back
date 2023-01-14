const express = require('express');
const jsonParser = express.json();
const db = require('./db');
const app = express();
const MD5 = require("crypto-js/md5");

/************************************************************************************* */
app.get('/', (_, response) => {
    response.sendFile('C:\\IT\\Dunice\\shishenya_todo_back\\front\\index.html');
})

app.get('/:file', (request, response) => {
    response.sendFile('C:\\IT\\Dunice\\shishenya_todo_back\\front\\' + request.params.file);
})
/**************************************************************************************/
const sendError = (err, response) => { response.status(500).json({ error: err.message }) }
/**************************************************************************************/
app.get('/api/auth', (_, response) => {
    response.sendFile('C:\\IT\\Dunice\\shishenya_todo_back\\front\\auth.html');
})

// РОУТЕР
app.post('/api/auth', jsonParser, async (request, response) => {
    const { login, password } = request.body;

    // select id,login from users where login='' and password=''
    let [user] = await db.User.findAll({
        attributes: ['id', 'login'],
        where: {
            login: login || "nologin",
            password: password || "nopassword"
        }
    });

    if (user) {
        let token = MD5(JSON.stringify(user) + Date.now().toString()).toString();
        db.User.update({ token: token }, { where: { id: user.id } });
        response.json({ token: token });
        return;
    }
    response.json({ error: 'Incorrect login or password' });
})
/**************************************************************************************/
app.get('/api/todos', (request, response) => {
    const { page, size, active, token } = request.query;

    db.Todo.findAndCountAll({
        order: [['id', 'ASC']],
        limit: size || 5,
        offset: (page || 0) * (size || 5),
        include: [{
            model: db.User,
            where: {
                token: token
            }
        }],
        where: (active !== undefined) ? {
            ischecked: active
        } : {}
    }).then(todos => {
        response.json(todos);
    }).catch(error => sendError(error, response));
});

app.get('/api/todos/count', (request, response) => {
    const { token } = request.query;

    db.User.count({
        group: ['user.id', 'todo.ischecked'],
        where: {
            token: token
        },
        include: [{
            model: db.Todo
        }],
    })
        .then(counts => {
            if (counts.length == 0) {
                response.status(401).json({ error: 'Bad token' });
                return;
            }
            let res = {
                active: 0,
                completed: 0,
            };
            counts.forEach(item => {
                if (item.ischecked === null) return;
                if (item.ischecked) {
                    res.completed = item.count;
                } else {
                    res.active = item.count;
                }
            });
            response.json(res);
        })
        .catch(error => sendError(error, response));
});

app.post('/api/todos', jsonParser, async (request, response) => {

    try {
        const { text, isChecked, token } = request.body;
        const { id } = await db.User.findOne({
            where: {
                token: token
            }
        });
        await db.Todo.create({
            text: text,
            ischecked: isChecked,
            userId: id
        });
        response.json({});
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
}

)

app.put('/api/todos', async (request, response) => {
    try {
        const { isChecked, token } = request.query;
        const { id } = await db.User.findOne({
            where: {
                token: token
            }
        });
        await db.Todo.update(
            { ischecked: isChecked },
            { where: { userId: id } }
        );
        response.json({});
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
})

app.put('/api/todos/:id', jsonParser, async (request, response) => {
    try {
        const user = await db.User.findOne({
            where: {
                token: request.body.token
            }
        });

        const obj = {}
        if (request.body.isChecked !== undefined) obj.ischecked = request.body.isChecked;
        if (request.body.text !== undefined) obj.text = request.body.text;

        await db.Todo.update(obj, {
            where: {
                id: request.params.id,
                userId: user.id
            }
        })
        response.json({});
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
})





app.delete('/api/todos', async (request, response) => {
    try {
        const user = await db.User.findOne({
            where: {
                token: request.query.token
            }
        });
        const obj = {
            userId: user.id
        };
        if (request.query.id !== undefined) obj.id = request.query.id;
        if (request.query.isChecked !== undefined) obj.ischecked = request.query.isChecked;
        if (Object.keys(obj).length > 1) {
            const result = await db.Todo.destroy({
                where: obj
            })
            response.json({ deleted: result });
        } else {
            throw new Error('Bad request')
        }
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
})

app.listen(3000);