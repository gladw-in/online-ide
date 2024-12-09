<?php
// Function to generate Fibonacci series iteratively (without recursion)
function fibonacci($n) {
    // Handle base case for n <= 0
    if ($n <= 0) {
        return [];
    }
    
    // Initialize the Fibonacci sequence with the first two numbers
    $fib = [0, 1];

    // Add Fibonacci numbers iteratively up to the desired count
    for ($i = 2; $i < $n; $i++) {
        $fib[] = $fib[$i - 1] + $fib[$i - 2];
    }

    return $fib;
}

// Generate a random number for the number of Fibonacci numbers (e.g., between 5 and 20)
$n = rand(5, 20); // You can adjust the range as needed

// Get the Fibonacci series
$fibonacci_series = fibonacci($n);

// Print the Fibonacci series
echo "Fibonacci series up to $n terms: \n";
foreach ($fibonacci_series as $number) {
    echo $number . " ";
}
?>
