const pg = require('pg');
const express = require('express');
const app = express();

const config = {
    host: 'localhost',
    user: 'postgres',
    password: '111',
    database: 'todo_list',
    port: 5432,
    ssl: false
};

function queryUpdate(frontid, text, checked) {
    return `UPDATE todos SET text="${text}" checked=${checked} WHERE frontid=${frontid};`;
}


function queryInsert(frontid, text, checked) {
    return `INSERT INTO todos (frontid, text, checked) VALUES (${frontid}, ${text}, ${checked})`;
}

function queryRead() {
    return 'SELECT * FROM todos';
}

function queryDelete(frontid) {
    return `DELETE FROM todos WHERE frontid = ${frontid}`;
}

const client = new pg.Client(config);
client.connect(err => {
    if (err) throw err;
    else {
        // queryDatabase(query);
    }
});

function queryDatabase(query, response) {
    client
        .query(query)
        .then((res) => {
            response.send(res.rows);
        })
        .catch(err => console.log(err));
}

/************************************************************************************* */
const fs = require('fs');
cookieParser = require('cookie-parser');
app.use(function (request, response, next) {
    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let data = `${hour}:${minutes}:${seconds} ${request.method} ${request.url} ${request.get("user-agent")}`;
    console.log(data);
    next();
});

app.use(cookieParser('secret key'));

app.use('/todos', function (request, response, next) {
    if (request.cookies.token != 'code') response.redirect('http://localhost:3000/auth');
    else next();
});

app.get('/todos', (request, response) => {
    queryDatabase(queryRead(), response);
})

app.get('/about', (request, response) => {
    response.send('<h1>This is about</h1>')
})

app.get('/auth', (request, response) => {
    response.sendFile('C:\\IT\\Dunice\\shishenya_todo_back\\index.html');
})

const urlencodedParser = express.urlencoded({ extended: false });
app.post('/auth', urlencodedParser, (request, response) => {
    if (!request.body) response.status(402).send('Fail');
    else {
        response.cookie('token', 'code');
        response.send(`${request.body.userName} - ${request.body.userAge}<br>
        ${JSON.stringify(request.body)}<br>
        <a href="http://localhost:3000/todos">go to</a>`);
    }
})

app.listen(3000);