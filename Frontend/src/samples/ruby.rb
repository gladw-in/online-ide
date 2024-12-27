# Initialize an array to store numbers
numbers = []

# Generate 20 random numbers between 1 and 100
20.times { numbers << rand(1..100) } # Add 20 random numbers to the array

# Calculate the sum of the numbers
sum = numbers.sum # Calculate the sum of all numbers in the array

# Calculate the average of the numbers
average = sum.to_f / numbers.length # Calculate the average

# Print the numbers, sum, and average
puts "Numbers: #{numbers.join(', ')}" # Print the numbers separated by commas
puts "Sum: #{sum}" # Print the sum
puts "Average: #{average}" # Print the average

