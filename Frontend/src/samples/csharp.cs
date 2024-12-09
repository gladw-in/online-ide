using System;

namespace SampleApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to the Simple Calculator!");

            // Get the first number
            Console.Write("Enter the first number: ");
            double num1 = Convert.ToDouble(Console.ReadLine());

            // Get the second number
            Console.Write("Enter the second number: ");
            double num2 = Convert.ToDouble(Console.ReadLine());

            // Choose an operation
            Console.WriteLine("Choose an operation (+, -, *, /): ");
            string operation = Console.ReadLine();

            double result = 0;
            bool validOperation = true;

            // Perform the operation
            switch (operation)
            {
                case "+":
                    result = Add(num1, num2);
                    break;
                case "-":
                    result = Subtract(num1, num2);
                    break;
                case "*":
                    result = Multiply(num1, num2);
                    break;
                case "/":
                    if (num2 != 0)
                        result = Divide(num1, num2);
                    else
                    {
                        Console.WriteLine("Error: Division by zero!");
                        validOperation = false;
                    }
                    break;
                default:
                    Console.WriteLine("Invalid operation!");
                    validOperation = false;
                    break;
            }

            // Display the result
            if (validOperation)
            {
                Console.WriteLine("The result is: " + result);
            }
        }

        static double Add(double a, double b) => a + b;
        static double Subtract(double a, double b) => a - b;
        static double Multiply(double a, double b) => a * b;
        static double Divide(double a, double b) => a / b;
    }
}
