const mysql = require('mysql2');

const connection = mysql
    .createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees_db'
    })
    .promise();

module.exports = connection;
