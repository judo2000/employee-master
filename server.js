// import database connection
const connection = require('./connection');
// import inquirer to prompt users
const inquirer = require('inquirer');
// input console.table for better table display
const cTable = require('console.table');
const { listenerCount } = require('./connection');

// function to display welcome message
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
// call welcome function to display banner
welcome();

// function to prompt user to select a task
const options = () => {
    inquirer
    .prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "task",
            choices: [
              "View All Employees",
              "Add Employee",
              "Update Employee Role",
              "Update Employee's Manager",
              "View Employees by Manager",
              "View All Roles",
              "Add a Role",
              "View All Departments",
              "Add a Department",
              "View Employees by Department",
              "Delete an Employee",
              "Delete a Department",
              "Delete a Role",
              "Show Budget by Department",
              "Quit",
            ],
          },
    ])
    .then(answer => {
        // get user response and call appropriate function
        if (answer.task === 'View All Employees') {
            viewAllEmployees();
        } else if (answer.task === 'Add Employee') {
            addEmployee();
        } else if (answer.task === 'Update Employee Role') {
            updateEmpRole();
        } else if (answer.task === 'Update Employee\'s Manager') {
            updateEmpManager();
        } else if (answer.task === "View Employees by Manager") {
            viewEmpByManager();
        } else if (answer.task === 'View All Roles') {
            viewAllRoles();
        } else if (answer.task === 'Add a Role') {
            addRole();
        } else if (answer.task === 'View All Departments') {
            viewAllDepartments();
        } else if (answer.task === 'Add a Department') {
            addDepartment();
        } else if (answer.task === 'View Employees by Department') {
            employeeByDept();
        } else if (answer.task === 'Delete an Employee') {
            deleteEmployee();
        } else if (answer.task === 'Delete a Department') {
            deleteDepartment();
        } else if (answer.task === 'Delete a Role') {
            deleteRole();
        } else if (answer.task === 'Show Budget by Department') {
            budgetByDept();
        } else if (answer.task === 'Quit') {
            connection.end()
        }
    });
};

// function to view all employees
const viewAllEmployees = async () => {
    try {
        const empSQL = `SELECT employee.id, 
                            employee.firstName AS 'First Name', 
                            employee.lastName AS 'Last Name', 
                            role.id AS 'Role Id',
                            role.title AS Title, 
                            role.salary AS Salary, 
                            department.name AS Department,
                            CONCAT (manager.firstName, " ", manager.lastName) AS Manager
                        FROM employee 
                            LEFT JOIN role ON employee.role_id = role.id 
                            LEFT JOIN department on role.department_id = department.id
                            LEFT JOIN employee manager ON employee.manager_id = manager.id;`;
        const [ employees ] = await connection.query(empSQL);
        console.log('\n-----View All Employees-----\n')
        console.table(employees);
        options();
    } catch (error) {
        console.log(error);
    }
};

// function to add a new employee
const addEmployee = () => {
    console.log('\n-----Add an Employee-----\n')
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

// function to update an employee's role
const updateEmpRole = async () => {
    try {
        console.log(`\n-----Add an Employee's Role-----\n`)
        // git list of employees
        const empSQL = "SELECT employee.id, employee.firstName, employee.lastName, role.title FROM employee LEFT JOIN role ON employee.role_id = role.id;";
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
        console.error(error)
    }
};

// function to update an employee's amanager
const updateEmpManager = async () => {
    try {
        console.log(`\n-----Add an Employee's Manager-----\n`)
         // get list of employees
         const empSQL = "SELECT employee.id, employee.firstName, employee.lastName, role.title FROM employee INNER JOIN role ON employee.role_id = role.id;";
         const [ result ] = await connection.query(empSQL);
         // create an array with employee information
         // include first and last name in value so wc can 
         // access them in the final concole.log
         const employees = result.map(({ firstName, lastName, title, id }) => ({ name: `${firstName} ${lastName} ${title}`, value: `${id}, ${firstName}, ${lastName}` }));
         
         // prompt user to select employee to update
         inquirer 
         .prompt([
             {
                 type: 'list',
                 name: 'employee',
                 message: `Which employee's manager would you like to update?`,
                 choices: employees,
             },
         ])
         .then(empChoice => {
             (async () => {
                const empFields = empChoice.employee.split(', ');
                console.log(empFields);
                const managerSQL = `SELECT employee.id, 
                                        employee.firstName, 
                                        employee.lastName, 
                                        role.title 
                                    FROM employee 
                                    LEFT JOIN role ON employee.role_id = role.id
                                    WHERE employee.id <> ?;`;
                const [ result ] = await connection.query(managerSQL, empFields[0]);
                const managers = result.map(({ firstName, lastName, title, id }) => ({ name: `${firstName} ${lastName} ${title}`, value: id }));

                // prompt user to select a manager
                inquirer 
                .prompt([
                    {
                        type: 'list',
                        name: 'manager',
                        message: 'Select a manager for this employee:',
                        choices: managers,
                    },
                ])
                .then(managerChoice => {
                    empFields.unshift(managerChoice.manager);
                    // update selected employee with new manager
                    const updateEmpSQL = 'UPDATE employee SET manager_id = ? WHERE id = ?;';
                    connection.query(updateEmpSQL, empFields);
                    console.log(`\n${empFields[2]} ${empFields[3]}'s manager has been updated`);
                    viewAllEmployees();
                })
             })();
         });    
    } catch (error) {
        console.error(error);
    }
};

// function to view roles
const viewAllRoles = async () => {
    try {
        const rolesSQL = `SELECT role.title AS 'Title', 
                            role.salary AS 'Salary', 
                            department.name AS 'Department' 
                          FROM role 
                          LEFT JOIN department on role.department_id = department.id;`;
        const [ roles ] = await connection.query(rolesSQL);
        console.log('\n-----View All Roles-----\n');
        console.table(roles);
        options();
    } catch (error) {
        console.error(error);
    } 
};

// function to add a role
const addRole = () => {
    console.log(`\n-----Add an New Role-----\n`)
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
                        console.log(`\n${answer.newRoleName} has been sucessfully added.\n`);
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

// function to view all departments
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

// function to add a department
const addDepartment = () => {
    console.log(`\n-----Add a Department-----\n`)
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

// function to view employees by department
const employeeByDept = async () => {
    console.log(`\n View Employees by Manager\n`)
    try {
        const deptSQL = "SELECT id AS 'Id', name AS 'Name' FROM department;";
        const [ result ] = await connection.query(deptSQL);
        const depts = result.map(({ Name, Id }) => ({ name: Name, value: `${Id}, ${Name}` }));
        depts.push('Back to Main Menu');
        inquirer 
        .prompt([
            {
                type: 'list',
                name: 'department',
                message: `Which deparement's employees would you like to see?`,
                choices: depts,
            },
        ])
        .then(deptChoice => {
            if (deptChoice.department === 'Back to Main Menu') {
                return options();
            }
            const deptFields = deptChoice.department.split(', ');
            (async () => {
                try {
                    const empSQL = `SELECT employee.firstName AS 'First Name',
                                        employee.lastName AS 'Last Name',
                                        role.title AS Title,
                                        department.name AS Department
                                    FROM employee
                                        INNER JOIN role ON employee.role_id = role.id
                                        INNER JOIN department ON role.department_id = department.id
                                    WHERE department.id = ?`;
                                
                    const [ empByDept ] = await connection.query(empSQL, Number(deptFields[0]));
                    console.log(`\n Employees in the ${deptFields[1]} department\n`);
                    console.table(empByDept);
                    employeeByDept();
                } catch (error) {
                    console.error(error);
                }
            })()
            
        })
    } catch (error) {
        console.error(error);
    }
};

// function to delete employee
const deleteEmployee = async () => {
    console.log(`\n-----Delete an Employee-----\n`)
    try {
        // get list of employees
        const empSQL = "SELECT employee.id, employee.firstName, employee.lastName, role.title FROM employee INNER JOIN role ON employee.role_id = role.id;";
        const [ result ] = await connection.query(empSQL);
        const employees = result.map(({ firstName, lastName, id }) => ({ name: `${firstName} ${lastName}`, value: `${id}, ${firstName}, ${lastName}` }));
        
        // prompt user to select employee to delete
        inquirer 
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: `Which employee would you like to delete?`,
                choices: employees,
            },
        ])
        .then(empChoice => {
            // get selected employee
            const empFields = empChoice.employee.split(', ');
            (async () => {
                const delEmpSQL = 'DELETE FROM employee WHERE id = ?;';
                await connection.query(delEmpSQL, Number(empFields[0]));
                
                console.log(`\n${empFields[1]} ${empFields[2]} has been removed.\n`)
                viewAllEmployees();
            })();
        })
    } catch (error) {
        console.error (error);
    }
}

// function to delete a department
const deleteDepartment = async () => {
    console.log(`\n-----Delete a Department-----\n`)
    try {
        const deptSQL = 'SELECT * FROM department;';
        const [ result ] = await connection.query(deptSQL);
        const departments = result.map(({ name, id }) => ({ name: name, value: `${id}, ${name}` }));
        
        inquirer 
        .prompt([
            {
                type: 'list',
                name: 'dept',
                message: 'Which department would you like to delete?',
                choices: departments,
            },
        ])
        .then(deptChoice => {
            const deptFields = deptChoice.dept.split(', ');
            (async () => {
                const delDeptSQL = 'DELETE FROM department WHERE id = ?;';
                const delDept = await connection.query(delDeptSQL, Number(deptFields[0]));
                console.log(`\nThe department, ${deptFields[1]}, has been deleted.\n`)
                viewAllDepartments();
            })();
        })
    } catch (error) {
        console.error(error);
    }
}

// function to delete a role
const deleteRole = async () => {
    console.log(`\n-----Delete a Role-----\n`)
    try {
        const roleSQL = 'SELECT * FROM role;';
        const [ result ] = await connection.query(roleSQL);
        const roles = result.map(({ title, id }) => ({ name: title, value: `${id}, ${title}` }));
        
        inquirer 
        .prompt([
            {
                type: 'list',
                name: 'roles',
                message: 'Which role would you like to delete?',
                choices: roles,
            },
        ])
        .then(roleChoice => {
            const roleFields = roleChoice.roles.split(', ');
            (async () => {
                const delRoleSQL = 'DELETE FROM role WHERE id = ?;';
                const delRole = await connection.query(delRoleSQL, Number(roleFields[0]));
                console.log(`\nThe role, ${roleFields[1]}, has been deleted.\n`)
                viewAllRoles();
            })();
        })
    } catch (error) {
        console.error(error);
    }
}

const budgetByDept = async () => {
    try {
        console.log(`\n-----Display Budget by Department-----\n`)
        budgetSQL = `SELECT department_id AS Id,
                        department.name AS Department,
                        SUM(salary) AS Budget
                      FROM role
                        JOIN department ON role.department_id = department.id
                        GROUP BY  department_id;`;
        const [ budget ] = await connection.query(budgetSQL);
        console.table(budget);
        options();

    } catch (error) {
        console.error(error);
    }
};


const viewEmpByManager = async () => {
    console.log(`\n View Employees by Manager\n`)
    try {
        const empByManagerSQL = `SELECT DISTINCT m.firstName, m.lastName, m.id, CONCAT(m.firstName, ' ', m.lastName) AS Manager FROM employee e INNER JOIN employee m ON e.manager_id = m.id;`; 
        const [ result ] = await connection.query(empByManagerSQL);
        const managers = result.map(({ firstName, lastName, id }) => ({ name: `${firstName} ${lastName}`, value: `${id}, ${firstName}, ${lastName}` }));
        managers.push('Back to Main Menu');
        inquirer 
        .prompt([
            {
                type: 'list',
                name: 'manager',
                message: `Which manager's employees would you like to see?`,
                choices: managers
            },
        ])
        .then(managerChoice => {
            if (managerChoice.manager === 'Back to Main Menu') {
                return options();
            }
            const managerFields = managerChoice.manager.split(', ');
            console.log(managerFields[0]);
            (async () => {
                try {
                    const empSQL = `SELECT employee.firstName AS 'First Name',
                                        employee.lastName AS 'Last Name',
                                        role.title AS Title,
                                        department.name AS Department
                                    FROM employee
                                        LEFT JOIN role ON employee.role_id = role.id
                                        LEFT JOIN department ON role.department_id = department.id
                                    WHERE manager_id = ?`;
                                
                    const [ empByManager ] = await connection.query(empSQL, Number(managerFields[0]));
                    console.log(`\n Employees managed by ${managerFields[1]} ${managerFields[2]}\n`);
                    console.table(empByManager);
                    viewEmpByManager();
                } catch (error) {
                    console.error(error);
                }
            })()
            
        })
    } catch (error) {
        console.error(error);
    }
};
// call the options function to show the menu to the user
options();