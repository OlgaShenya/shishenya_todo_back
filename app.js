const express = require('express');
const jsonParser = express.json();
const db = require('./db');
const app = express();

/************************************************************************************* */
app.get('/', (_, response) => {
    console.log(process.argv);
    response.sendFile('C:\\IT\\Dunice\\shishenya_todo_back\\front\\index.html');
})

app.get('/:file', (request, response) => {
    response.sendFile('C:\\IT\\Dunice\\shishenya_todo_back\\front\\' + request.params.file);
})
/**************************************************************************************/
const sendError = (err) => { response.status(500).json(err.message) }
/**************************************************************************************/
app.get('/api/todos', (request, response) => {
    const { page, size, active } = request.query;
    db.Todo.findAndCountAll({
        order: [['id', 'ASC']],
        limit: size,
        offset: page * size,
        where: (active !== undefined) ? {
            ischecked: active
        } : {}
    }).then(todos => {
        response.json(todos);
    }).catch(sendError);
});

app.get('/api/todos/count', (_, response) => {
    db.Todo.count({
        group: ['ischecked']
    })
        .then(counts => {
            let res = {
                active: 0,
                completed: 0,
            };
            counts.forEach(item => {
                if (item.ischecked) {
                    res.completed = item.count;
                } else {
                    res.active = item.count;
                }
            })
            response.json(res);
        })
        .catch(sendError);
});

app.post('/api/todos', jsonParser, (request, response) => {
    if (!request.body)
        response.status(400).json({ error: "Undefined body" });
    else {
        db.Todo.create({
            text: request.body.text,
            ischecked: request.body.isChecked,
        })
            .then(res => {
                response.json(res);
            })
            .catch(sendError);
    }

})

app.put('/api/todos', (request, response) => {
    db.Todo.update({ ischecked: request.query.isChecked }, { where: {} })
        .then(todos => {
            response.json(todos);
        })
        .catch(sendError);
})

app.put('/api/todos/:id', jsonParser, (request, response) => {
    const obj = {}

    if (request.body.isChecked !== undefined) obj.ischecked = request.body.isChecked;
    if (request.body.text !== undefined) obj.text = request.body.text;

    db.Todo.update(obj, { where: { id: request.params.id } })
        .then(count => {
            response.json({ count: count[0] });
        })
        .catch(sendError);
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
        .catch(sendError);
})

app.listen(3000);