const express = require('express');
const jsonParser = express.json();
const db = require('./db');
const app = express();
const jwt = require('jsonwebtoken');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const signature = 'MySuP3R_z3kr3t';

// http://myserver.com/api/todos

/************************************************************************************* */
app.get('/', (_, response) => {
    response.sendFile(`${appDir}\\front\\index.html`);
})

app.use('/css', express.static(`${appDir}\\front\\css`));
app.use('/js', express.static(`${appDir}\\front\\js`));
/**************************************************************************************/
/**************************************************************************************/
app.post('/api/signup', jsonParser, async (request, response) => {

    const { login, password } = request.body;
    const user = await db.CreateUser(login, password);

    if (user.error) {
        response.status(400).json({ error: 'Cannot create user' });
        return;
    }
    response.json({});
})

app.post('/api/signin', jsonParser, async (request, response) => {
    const { login, password } = request.body;
    const user = await db.GetUser(login, password);

    if (user.error) {
        response.status(401).json({ error: 'Incorrect login or password' });
        return;
    }

    const token = jwt.sign(user, signature);
    response.json({ token: token });

})

app.use((request, response, next) => {
    if (!request.headers.authorization) {
        response.status(401).json({ error: "token is not provided" });
        return;
    }
    jwt.verify(
        request.headers.authorization,
        signature,
        (error, payload) => {
            if (error) {
                response.status(403).json({ error: error.message });
                return;
            }
            request.userId = payload.id;
        }
    )
    if (request.userId) next();
})

/**************************************************************************************/
app.get('/api/todos', async (request, response) => {
    const { pageNumber, pageSize, isChecked } = request.query;
    const result = await db.GetTodo(pageSize, pageNumber, request.userId, isChecked);
    if (result.error) response.status(400);
    response.json(result);
});

app.get('/api/todos/count', async (request, response) => {
    const result = await db.CountTodo(request.userId);
    if (result.error) response.status(400);
    response.json(result);
});

app.post('/api/todos', jsonParser, async (request, response) => {
    const { text, isChecked } = request.body;
    const result = await db.CreateTodo(request.userId, text, isChecked);
    if (result.error) response.status(400);
    response.json(result);
})

app.put('/api/todos', jsonParser, async (request, response) => {
    const { isChecked } = request.body;
    const result = await db.UpdateTodoIschecked(isChecked, request.userId);
    if (result.error) response.status(400);
    response.json(result);
})

app.put('/api/todos/:id', jsonParser, async (request, response) => {
    const { isChecked, text } = request.body;
    const result = await db.UpdateTodo(isChecked, text, request.params.id);
    if (result.error) response.status(400);
    response.json(result);
})

app.delete('/api/todos', async (request, response) => {
    const result = await db.DeleteTodo(request.query.id);
    if (result.error) response.status(400);
    response.json(result);
})

app.delete('/api/todos/completed', async (request, response) => {
    const result = await db.DeleteTodoChecked(request.userId);
    if (result.error) response.status(400);
    response.json(result);
})

app.listen(3000);