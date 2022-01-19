const connection = require('./connection');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { connect } = require('./connection');

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
            viewAllDepartments();
        } else if (response.action === 'Add a Department') {
            addDepartment();
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
};

const viewAllDepartments = async () => {
    try {
        const deptSQL = "SELECT id AS 'ID', name AS 'Name' FROM department;";
        const [ departments ] = await connection.query(deptSQL);
        console.log('\n-----View All Departments-----\n');
        console.table(departments);
        options();
    } catch (error) {
        console.error(error);
    }
};

const addDepartment = () => {
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'newDept',
            message: "What is the name of the new department?",
        }
    ])
    .then(answer => {
        try {
            const insertDeptQuery = 'INSERT INTO department(name) VALUES(?);';
            connection.query(insertDeptQuery, [answer.newDept]);
            console.log(`\n${answer.newDept} has been sucessfully added.\n`);
            viewAllDepartments();
        } catch (error) {
            console.error(error);
        }
    });
};
options();