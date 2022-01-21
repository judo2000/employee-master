INSERT INTO department(id, name) 
VALUES(1, 'Sales and Marketing'),
      (2, 'Product Development'),
      (3, 'IT Services');

INSERT INTO role(id, title, salary, department_id)
    VALUES(1, 'Sales Person', 82000, 1),
          (2, 'Project Lead', 110000, 2),
          (3, 'Full Stack Enginner', 98000, 2),
          (4, 'Desktop Support', 76000, 3);
          
INSERT INTO employee(id, firstName, lastName, role_id, manager_id)
    VALUES(1, 'Heidi', 'Seibold', 2, NULL),
          (2, 'Stephen', 'Moore', 3, 1),
          (3, 'Jordan', 'Harris', 4, NULL),
          (4, 'James', 'Carmer', 4, 1),
          (5, 'Steve', 'Patton', 1, NULL),
          (6, 'Wil', 'Johnson', NULL, NULL)
          (7, 'Frankie', 'Parks', 2 NULL)
          (8, 'James', 'Moore', 4, 7);
