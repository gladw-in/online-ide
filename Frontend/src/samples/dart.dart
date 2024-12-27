import 'dart:io';

void main() {
  stdout.write('Enter the first number: '); // Prompt for first number
  double num1 = double.parse(stdin.readLineSync()!); // Read and parse first number

  stdout.write('Enter the operator (+, -, *, /): '); // Prompt for operator
  String operator = stdin.readLineSync()!; // Read operator

  stdout.write('Enter the second number: '); // Prompt for second number
  double num2 = double.parse(stdin.readLineSync()!); // Read and parse second number

  double result; // Variable to store the result

  switch (operator) { // Perform calculation based on operator
    case '+':
      result = num1 + num2;
      break;
    case '-':
      result = num1 - num2;
      break;
    case '*':
      result = num1 * num2;
      break;
    case '/':
      if (num2 == 0) {
        print('Error: Cannot divide by zero.'); // Handle division by zero
        return;
      }
      result = num1 / num2;
      break;
    default:
      print('Error: Invalid operator.'); // Handle invalid operator
      return;
  }

  print('Result: $result'); // Print the result
}
