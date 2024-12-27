-- Drop the emp table if it already exists to avoid errors during creation
DROP TABLE IF EXISTS emp;

-- Create the emp table to store employee data
CREATE TABLE emp (
  empno decimal(4,0) NOT NULL,      -- Employee number, primary key, cannot be NULL
  ename varchar(10) default NULL,   -- Employee name, can be NULL by default
  job varchar(9) default NULL,      -- Job title, can be NULL by default
  mgr decimal(4,0) default NULL,    -- Manager's employee number, can be NULL by default
  hiredate date default NULL,       -- Date of hiring, can be NULL by default
  sal decimal(7,2) default NULL,    -- Salary, can be NULL by default
  comm decimal(7,2) default NULL,   -- Commission, can be NULL by default
  deptno decimal(2,0) default NULL  -- Department number, can be NULL by default
);

-- Drop the dept table if it already exists to avoid errors during creation
DROP TABLE IF EXISTS dept;

-- Create the dept table to store department data
CREATE TABLE dept (
  deptno decimal(2,0) default NULL, -- Department number, primary key, can be NULL by default
  dname varchar(14) default NULL,   -- Department name, can be NULL by default
  loc varchar(13) default NULL      -- Location, can be NULL by default
);

-- Insert records into the emp table (employee data)
INSERT INTO emp VALUES ('7369','SMITH','CLERK','7902','1980-12-17','800.00',NULL,'20');
INSERT INTO emp VALUES ('7499','ALLEN','SALESMAN','7698','1981-02-20','1600.00','300.00','30');
INSERT INTO emp VALUES ('7521','WARD','SALESMAN','7698','1981-02-22','1250.00','500.00','30');
INSERT INTO emp VALUES ('7566','JONES','MANAGER','7839','1981-04-02','2975.00',NULL,'20');
INSERT INTO emp VALUES ('7654','MARTIN','SALESMAN','7698','1981-09-28','1250.00','1400.00','30');
INSERT INTO emp VALUES ('7698','BLAKE','MANAGER','7839','1981-05-01','2850.00',NULL,'30');
INSERT INTO emp VALUES ('7782','CLARK','MANAGER','7839','1981-06-09','2450.00',NULL,'10');
INSERT INTO emp VALUES ('7788','SCOTT','ANALYST','7566','1982-12-09','3000.00',NULL,'20');
INSERT INTO emp VALUES ('7839','KING','PRESIDENT',NULL,'1981-11-17','5000.00',NULL,'10');
INSERT INTO emp VALUES ('7844','TURNER','SALESMAN','7698','1981-09-08','1500.00','0.00','30');
INSERT INTO emp VALUES ('7876','ADAMS','CLERK','7788','1983-01-12','1100.00',NULL,'20');
INSERT INTO emp VALUES ('7900','JAMES','CLERK','7698','1981-12-03','950.00',NULL,'30');
INSERT INTO emp VALUES ('7902','FORD','ANALYST','7566','1981-12-03','3000.00',NULL,'20');
INSERT INTO emp VALUES ('7934','MILLER','CLERK','7782','1982-01-23','1300.00',NULL,'10');

-- Insert records into the dept table (department data)
INSERT INTO dept VALUES ('10','ACCOUNTING','NEW YORK');
INSERT INTO dept VALUES ('20','RESEARCH','DALLAS');
INSERT INTO dept VALUES ('30','SALES','CHICAGO');
INSERT INTO dept VALUES ('40','OPERATIONS','BOSTON');

-- Select all records from the dept table
SELECT * FROM dept;

-- Select all employees who are SALESMAN from the emp table
SELECT * FROM emp WHERE job = 'SALESMAN';
