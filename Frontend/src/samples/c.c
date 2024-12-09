#include <stdio.h>

void printEvenNumbers(int start, int end) {
    printf("Even numbers between %d and %d:\n", start, end);
    for (int i = start; i <= end; i++) {
        if (i % 2 == 0) {
            printf("%d ", i);
        }
    }
    printf("\n");
}

int factorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

int main() {
    int start = 1, end = 20;
    printEvenNumbers(start, end);
    
    int num = 5;
    printf("Factorial of %d is %d\n", num, factorial(num));
    
    int number1, number2;
    printf("Enter two numbers to add: ");
    scanf("%d %d", &number1, &number2);
    printf("Sum: %d\n", number1 + number2);

    int choice;
    printf("Enter a number (1-5) to see your choice: ");
    scanf("%d", &choice);
    switch(choice) {
        case 1:
            printf("You selected choice 1\n");
            break;
        case 2:
            printf("You selected choice 2\n");
            break;
        case 3:
            printf("You selected choice 3\n");
            break;
        case 4:
            printf("You selected choice 4\n");
            break;
        case 5:
            printf("You selected choice 5\n");
            break;
        default:
            printf("Invalid choice\n");
    }

    return 0;
}
