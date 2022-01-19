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
            viewAllEmployees();
        } else if (response.action === 'Add Employee') {
            console.log('Add Enployee')
        } else if (response.action === 'Update Employee Role') {
           console.log('Update Employee Role');
        } else if (response.action === 'View All Roles') {
            viewAllRoles();
        } else if (response.action === 'Add a Role') {
            console.log('Add a Role');
        } else if (response.action === 'View All Departments') {
            console.log('View All Departments')
        } else if (response.action === 'Add a Department') {
            console.log('Add a Department')
        } else if (response.action === 'Exit') {
            console.log('Exit')
        }
    });
};

const viewAllEmployees = async () => {
    try {
        const empSQL = "SELECT employee.firstName AS 'First Name', employee.lastName AS 'Last Name', role.title AS Title, role.salary AS Salary, department.name AS Department FROM employee INNER JOIN role ON employee.role_id = role.id JOIN department on role.department_id = department.id;";
        const [ employees ] = await connection.query(empSQL);
        console.log('\n-----View All Employees-----\n')
        console.table(employees);
        options();
    } catch (error) {
        console.log(error);
    }
};

const viewAllRoles = async () => {
    try {
        const rolesSQL = "SELECT role.title AS 'Title', role.salary AS 'Salary', department.name AS 'Department' FROM role JOIN department on role.department_id = department.id;";
        const [ roles ] = await connection.query(rolesSQL);
        console.log('\n-----View All Roles-----\n');
        console.table(roles);
        options();
    } catch (error) {
        console.error(error);
    } 
}
options();