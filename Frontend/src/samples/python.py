class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        print(f"Hello, my name is {self.name} and I'm {self.age} years old.")


"""
The Person class represents an individual with a name and age.
It includes an initializer to set these attributes and a greet method
that prints a greeting message with the person's name and age.
"""


def fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n - 1) + fibonacci(n - 2)


# Lambda function to calculate the square of a number
square = lambda x: x * x

# Main program
if __name__ == "__main__":
    print("Welcome to the Online IDE!")

    person = Person("Glad", 20)
    person.greet()

    num_terms = 10

    try:
        if num_terms <= 0:
            raise ValueError("Number of terms must be positive.")

        print("Fibonacci sequence:")
        for i in range(num_terms):
            fib_value = fibonacci(i)
            print(f"Term {i}: {fib_value}")
    except ValueError as e:
        print(f"Error: {e}")

    # Using the square lambda function
    number = 5
    print(f"The square of {number} is {square(number)}")
