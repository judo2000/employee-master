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
            viewEmployees();
        }
    });
};

const viewEmployees = async () => {
    try {
        const empSQL = "SELECT employee.firstName AS 'First Name', employee.lastName AS 'Last Name', role.title AS Title, role.salary AS Salary, department.name AS Department FROM employee INNER JOIN role ON employee.role_id = role.id JOIN department on role.department_id = department.id;";
        const [ employees ] = await connection.query(empSQL);
        console.log('-----View All Employees-----\n')
        console.table(employees);
        options();
    } catch (error) {
        console.log(error);
    }
};
options();