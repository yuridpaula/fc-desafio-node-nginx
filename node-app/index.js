const express = require('express');
const mysql = require('mysql');
require('dotenv').config();
console.log('Start configuring the application');

const port = process.env.PORT;
const defaultName = process.env.DEFAUL_USER;

const config = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const app = express();

const executeMigration = (connection) => {
  const dataTable = `CREATE TABLE IF NOT EXISTS people(id int not null auto_increment, name varchar(255), primary key(id))`;
  connection.query(dataTable, (error) => {

    if (error) {
      console.error(error);
      throw error;
    }
    console.log('Table people successfully created!');
  });
}

const executeSeeder = (connection) => {
  const seederStatement = `INSERT INTO people(name) values('${defaultName}')`;

  connection.query(seederStatement, (error) => {
    if (error) {
      console.error(error);
      throw error;
    }

    console.log('Data successfully inserted!');
  });
}

const setupDatabase = () => {
  const connection = mysql.createConnection(config);
  
  executeMigration(connection);
  executeSeeder(connection);

  connection.end();
}

const handleData = (data) => {
  if (data == null || data == undefined) {
    return null;
  }

  const mapped =  data.map(rec => {
    return `<li>id: ${rec.id} - name: ${rec.name}</li>`;
  });

  return `<ul>${mapped}</ul>`;
}

app.get('/', async (req, res) => {

  const connection = mysql.createConnection(config);

  const findStatement = `select * from people`;

  connection.query(findStatement, (error, result) => {
    if (error) {
      res.send("Failed to get names").status(500);
    } else {
      
      const data = handleData(result);
      
      const response = `
        <body>
          <h1>Full Cycle Rocks!</h1>
          ${data}
        <body>
      `;
      
      res.send(response);

    }
  });
});

app.listen(port, () => {
  setupDatabase();
  console.log(`Server is running on port ${port}`);
});

