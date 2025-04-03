// Sample data (replace with your actual employee collection)
db.employees.insertMany([
  { empId: 1, name: "John Doe", department: "Sales", salary: 60000 },
  { empId: 2, name: "Jane Smith", department: "Marketing", salary: 75000 },
  { empId: 3, name: "Peter Jones", department: "Sales", salary: 65000 },
  { empId: 4, name: "Mary Brown", department: "IT", salary: 80000 }
]);

// Find all employees in the Sales department
db.employees.find({ department: "Sales" }).forEach(printjson);

// Find the highest salary
db.employees.aggregate([
  { $group: { _id: null, maxSalary: { $max: "$salary" } } }
]).forEach(printjson);

// Find the average salary of all employees
db.employees.aggregate([
  { $group: { _id: null, avgSalary: { $avg: "$salary" } } }
]).forEach(printjson);

// Increase salary of all employees in IT by 10%
db.employees.updateMany(
  { department: "IT" },
  [
    { $set: { salary: { $multiply: ["$salary", 1.1] } } }
  ]
);

// Verify the salary increase
db.employees.find({ department: "IT" }).forEach(printjson);

