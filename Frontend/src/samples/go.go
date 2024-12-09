package main

import (
	"fmt"
)

func main() {
	// Declare and initialize variables
	var name string
	var age int

	// Ask for user input
	fmt.Print("Enter your name: ")
	fmt.Scanln(&name)

	fmt.Print("Enter your age: ")
	fmt.Scanln(&age)

	// Display a greeting message
	fmt.Printf("Hello, %s! You are %d years old.\n", name, age)

	// Call a function to calculate the year of birth
	yearOfBirth := calculateYearOfBirth(age)

	// Print the calculated year of birth
	fmt.Printf("You were born in the year %d.\n", yearOfBirth)
}

// Function to calculate the year of birth
func calculateYearOfBirth(age int) int {
	currentYear := 2024
	return currentYear - age
}
