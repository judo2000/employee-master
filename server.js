const connection = require('./connection');
const inquirer = require('inquirer');
const cTable = require('console.table');

const welcome = () => {
    console.log(`
     ___________________________________________________________________
    |                        Welcome to                                 |
    |                           The                                     |
    |            ____  _   _   __       ___       ____  ____            |
    |           |____ | \\ / | |__| |   |   | \\ / |____ |____            |
    |           |____ |     | |    |__ |___|  |  |____ |____            |
    |               _   _    _          _    __   __   __               |
    |              | \\ / |  /_\\  |\\ |  /_\\  | _  |_   |__|              |
    |              |     | /   \\ | \\| /   \\ |__| |__  |  \\              |
    |___________________________________________________________________|`)
console.log('\n')
}
welcome();

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
              "Quit",
            ],
          },
    ])
    .then(response => {
        if (response.action === 'View All Employees') {
            viewAllEmployees();
        } else if (response.action === 'Add Employee') {
            addEmployee();
        } else if (response.action === 'Update Employee Role') {
            updateEmpRole();
        } else if (response.action === 'View All Roles') {
            viewAllRoles();
        } else if (response.action === 'Add a Role') {
            addRole();
        } else if (response.action === 'View All Departments') {
            viewAllDepartments();
        } else if (response.action === 'Add a Department') {
            addDepartment();
        } else if (response.action === 'Quit') {
            connection.end()
        }
    });
};

const viewAllEmployees = async () => {
    try {
        const empSQL = "SELECT employee.id, employee.firstName AS 'First Name', employee.lastName AS 'Last Name', role.title AS Title, role.salary AS Salary, department.name AS Department FROM employee INNER JOIN role ON employee.role_id = role.id JOIN department on role.department_id = department.id;";
        const [ employees ] = await connection.query(empSQL);
        console.log('\n-----View All Employees-----\n')
        console.table(employees);
        options();
    } catch (error) {
        console.log(error);
    }
};

const addEmployee = () => {
    // prompt user for new employee first and last name
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'firstName',
            message: `Please enter employee's first name:`,
        },
        {
            type: 'input',
            name: 'lastName',
            message: `Please enter employee's last name:`,
        },
    ])
    .then(answers => {
        (async () => {
            try {
                // save the responses to an array
                const newEmpFields = [answers.firstName, answers.lastName];
                // get list of roles to aloow the user to select
                // a role for this employee
                const roleList = 'SELECT id, title FROM role;';
                const [ result ] = await connection.query(roleList);
                const role = result.map(({ title, id}) => ({ name: title, value: id }));

                // prompt user to select a role for the new employee
                inquirer 
                .prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: 'Select a role for this employee:',
                        choices: role,
                    },
                ])
                .then(roleChoice => {
                    try {
                        // get selected role
                        const role = roleChoice.role;
                        // push role to new employee fields array
                        newEmpFields.push(role);
                        // insert new employee into employee table
                        const addEmpSQL = 'INSERT INTO employee(firstName, lastName, role_id) VALUES(?, ?, ?);';
                        connection.query(addEmpSQL, newEmpFields);
                        console.log(`\n${answers.firstName} ${answers.lastName} has been sucessfully added.\n`);
                        // call view all employees function to see that the new role has been added
                        viewAllEmployees();
                    } catch (error) {
                        console.error(error);
                    }
                })
            } catch (error) {
                console.error(error);
            }
        })();
    });
};

const updateEmpRole = async () => {
    try {
        // git list of employees
        const empSQL = "SELECT employee.id, employee.firstName, employee.lastName, role.title FROM employee INNER JOIN role ON employee.role_id = role.id;";
        const [ result ] = await connection.query(empSQL);
        const employees = result.map(({ firstName, lastName, title, id }) => ({ name: `${firstName} ${lastName} ${title}`, value: id }));
        
        inquirer 
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: `Which employee's role would you like to update?`,
                choices: employees,
            },
        ])
        .then(empChoice => {
            (async () => {
                // save respone to new employee array
                const newEmpFields = [empChoice.employee];
                const roleList = 'SELECT id, title FROM role;';
                const [ result ] = await connection.query(roleList);
                const role = result.map(({ title, id}) => ({ name: title, value: id }));

                // prompt user to select a new role for the new employee
                inquirer 
                .prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: 'Select a role for this employee:',
                        choices: role,
                    },
                ])
                .then(roleChoice => {
                    try {
                        // get selected role
                        const role = roleChoice.role;
                        // push role to new employee fields array
                        newEmpFields.unshift(role);
                        console.log(newEmpFields);
                        // update selected employee with new role
                        const updateEmpSQL = 'UPDATE employee SET role_id = ? WHERE id = ?;';
                        connection.query(updateEmpSQL, newEmpFields);
                        console.log(`\nEmployee's role has been sucessfully updated.\n`);
                        // call view all employees function to see that the new role has been added
                        viewAllEmployees();
                    } catch (error) {
                        console.error(error);
                    }
                })
            })();
        });
    } catch (error) {
        
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

const addRole = () => {
    // prompt the user for new role name and salary
    inquirer 
        .prompt([
        {
            type: 'input',
            name: 'newRoleName',
            message: 'What is the name of the new role?',
        },
        {
            type: 'input',
            name: 'newSalary',
            message: 'What is the salary for this role?',
        },
    ])
    .then(answer => {
        (async () => {
            try {
                // save the responses for the new role to an array 
                const roleFields = [answer.newRoleName, Number(answer.newSalary)];
                // get list of departments to aloow the user to select
                // a department for this role
                const deptList = "SELECT id, name FROM department;";
                const [ result ] = await connection.query(deptList);
                const dept = result.map(({ name, id }) => ({ name: name, value: id }));
                
                // prompt user to select department for new role
                inquirer 
                .prompt([
                    {
                        type: 'list',
                        name: 'dept',
                        message: 'What department does this role belong to?',
                        choices: dept,
                    },
                ])
                .then(deptChoice => {
                    try {
                        // get selected department
                        const dept = deptChoice.dept;
                        // push department to role fields array
                        roleFields.push(dept);
                        // insert new role into role table
                        const addRoleSQL = `INSERT INTO role(title, salary, department_id) VALUES(?, ?, ?);`;
                        connection.query(addRoleSQL, roleFields);
                        console.log(`\n${answer.newDept} has been sucessfully added.\n`);
                        // call view all roles function to see that the new role has been added
                        viewAllRoles();
                    } catch (error) {
                        console.error(error);
                    }
                });
            } catch (error) {
                console.error(error);
            } 
        })();
    });
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
// call the options function to show the menu to the user
options();