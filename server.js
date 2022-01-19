const connection = require('./connection');
const inquirer = require('inquirer');
const cTable = require('console.table');

const options = () => {
    inquirer
    .prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "action",
            choices: [
              "View All Employees",
              "Add Employee",
              "Update Employee Role",
              "View All Roles",
              "Add a Role",
              "View All Departments",
              "Add a Department",
              "Exit",
            ],
          },
    ])
    .then(response => {
        if (response.action === 'View All Employees') {
            console.log('Vide All Employees');
        }
    });
};