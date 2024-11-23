// 1. Declare variables
let name = 'Alice';
let age = 30;

// 2. Create a function that greets a person
function greet(person) {
  console.log(`Hello, ${person}!`);
}

// 3. Call the greeting function
greet(name);

// 4. Use a conditional to check age
if (age >= 18) {
  console.log(`${name} is an adult.`);
} else {
  console.log(`${name} is a minor.`);
}

// 5. Loop through an array and log each item
let fruits = ['apple', 'banana', 'cherry'];
fruits.forEach(fruit => {
  console.log(fruit);
});