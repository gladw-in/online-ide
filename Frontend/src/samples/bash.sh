#!/bin/bash

# Simulate a "Person" class in Bash

# Define the Person "class"
Person() {
    # Attributes
    local name
    local age

    # Constructor to initialize a Person object
    init() {
        name="$1"
        age="$2"
    }

    # Method to print details about the person
    display_info() {
        echo "Name: $name"
        echo "Age: $age"
    }

    # Method to check if the person is an adult
    is_adult() {
        if [ "$age" -ge 18 ]; then
            echo "$name is an adult."
        else
            echo "$name is a minor."
        fi
    }
}

# Create two "Person" objects
person1=()
person2=()

# Initialize the objects
Person person1
person1[init] "Alice" 30
Person person2
person2[init] "Bob" 16

# Use methods on the objects
echo "Person 1 Info:"
person1[display_info]
person1[is_adult]

echo "Person 2 Info:"
person2[display_info]
person2[is_adult]

# Simulate a "greet" method
greet() {
    local person_name="$1"
    echo "Hello, $person_name!"
}

# Call greet
greet "${person1[name]}"
greet "${person2[name]}"

# Exit
echo "Exiting the script."
exit 0
