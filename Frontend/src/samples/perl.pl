use strict; # enforce strict mode
use warnings; # enable warnings

print "Enter the first number: ";
my $num1 = <STDIN>; # read first number from user input
chomp $num1; # remove newline character

print "Enter the operator (+, -, *, /): ";
my $operator = <STDIN>; # read operator from user input
chomp $operator; # remove newline character

print "Enter the second number: ";
my $num2 = <STDIN>; # read second number from user input
chomp $num2; # remove newline character

my $result; # variable to store the result

if ($operator eq '+') { # check if operator is '+'
    $result = $num1 + $num2; # add numbers
} elsif ($operator eq '-') { # check if operator is '-'
    $result = $num1 - $num2; # subtract numbers
} elsif ($operator eq '*') { # check if operator is '*'
    $result = $num1 * $num2; # multiply numbers
} elsif ($operator eq '/') { # check if operator is '/'
    if ($num2 == 0) { # handle division by zero
        print "Error: Division by zero!\n";
        exit; # exit the program
    }
    $result = $num1 / $num2; # divide numbers
} else { # handle invalid operator
    print "Error: Invalid operator!\n";
    exit; # exit the program
}

print "Result: $result\n"; # print the result
