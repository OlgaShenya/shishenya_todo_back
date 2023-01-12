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

app.post('/api/todos', jsonParser, (request, response) => {
    if (!request.body)
        response.status(400).json({ error: "Undefined body" });
    else {
        db.CreateTodo(user, {
            text: request.body.text,
            ischecked: request.body.isChecked,
        })
            .then(res => {
                response.json(res);
            })
            .catch(error => sendError(error, response));
    }

})

app.put('/api/todos', (request, response) => {
    db.Todo.update({ ischecked: request.query.isChecked }, { where: {} })
        .then(todos => {
            response.json(todos);
        })
        .catch(error => sendError(error, response));
})

app.put('/api/todos/:id', jsonParser, (request, response) => {
    const obj = {}

    if (request.body.isChecked !== undefined) obj.ischecked = request.body.isChecked;
    if (request.body.text !== undefined) obj.text = request.body.text;

    db.Todo.update(obj, { where: { id: request.params.id } })
        .then(count => {
            response.json({ count: count[0] });
        })
        .catch(error => sendError(error, response));
})

app.delete('/api/todos', (request, response) => {
    const obj = {};
    if (request.query.id !== undefined) obj.id = request.query.id;
    if (request.query.isChecked !== undefined) obj.ischecked = request.query.isChecked;

    db.Todo.destroy({
        where: obj
    })
        .then((res) => {
            response.json({ deleted: res });
        })
        .catch(error => sendError(error, response));
})

app.listen(3000);