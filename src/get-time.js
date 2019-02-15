'use strict';

const express = require('express');
const serverless = require('serverless-http');
const pg = require('pg');

const pgConfig = {
    max: 1,
    host: 'db',
    user: 'postgres',
    port: 5432,
    password: 'postgres',
//    database: 'attendance',
    database: 'api',
    ssl: false,
};

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

app.get('/dbtime', async function (req, res) {
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

module.exports = {
    app,
    dbtime: serverless(app),
};
