const express = require('express');
const serverless = require('serverless-http');
const pg = require('pg');

const pgConfig = {
    max: 1,
    host: 'db',
    user: 'postgres',
    port: 5432,
    password: 'postgres',
    database: 'api',
    ssl: false,
};

//const Pool = require('pg').Pool
//const pool = new Pool({
//  user: 'postgres',
//  host: 'db',
//  database: 'api',
//  password: 'postgres',
//  port: 5432,
//})
let pgPool;

const app = express();

const createConn = () => {
    console.log('Creating PG connection.');
    pgPool = new pg.Pool(pgConfig);
};

const performQuery = async () => {
    const client = await pgPool.connect();
    const result = await client.query('SELECT now()');
    client.release();
    return result;
};

app.get('/users', async function (req, res) {
    if (!pgPool) {
        // Cold start. Get Heroku Postgres creds and create pool.
        createConn();
    } else {
        console.log('Using existing PG connection.');
    }

    try {
        const result = await getUsers(req, res);
        let results = JSON.stringify(result);

        res.json({
            result: results,
        });
        return;
    } catch (e) {
        res.json({
            error: e.message,
        });
        return;
    }
});

app.get('/user', async function (req, res) {
    if (!pgPool) {
        // Cold start. Get Heroku Postgres creds and create pool.
        createConn();
    } else {
        console.log('Using existing PG connection.');
    }

    try {
        const result = await createUser(req, res);
        let results = JSON.stringify(result);

        res.json({
            result: results,
        });
        return;
    } catch (e) {
        res.json({
            error: e.message,
        });
        return;
    }
});

app.get('/time', async function (req, res) {
    if (!pgPool) {
        // Cold start. Get Heroku Postgres creds and create pool.
        createConn();
    } else {
        console.log('Using existing PG connection.');
    }

    try {
        const result = await performQuery();

        res.json({
            result: `According to Heroku Postgres, the time is: ${result.rows[0].now}`,
        });
        return;
    } catch (e) {
        res.json({
            error: e.message,
        });
        return;
    }
});

const getUsers = async () => {
    const client = await pgPool.connect();
    const result = await client.query('SELECT * FROM users ORDER BY id ASC');
    client.release();
    return result;
}

const createUser = (request, response) => {
  const { name, email } = request.body

  pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`User added with ID: ${result.insertId}`)
  })
}

module.exports = {
  users: serverless(app),
  user: serverless(app),
  time: serverless(app)
//  getUserById,
//  createUser,
//  updateUser,
//  deleteUser,
}
