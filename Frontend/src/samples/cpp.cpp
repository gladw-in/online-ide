#include <iostream>
#include <vector>
#include <algorithm>

void reverseArray(int arr[], int size) {
    int start = 0, end = size - 1;
    while (start < end) {
        std::swap(arr[start], arr[end]);
        start++;
        end--;
    }
}

void printArray(const int arr[], int size) {
    std::cout << "Array elements: ";
    for (int i = 0; i < size; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
}

int main() {
    int n;
    std::cout << "Enter the size of the array: ";
    std::cin >> n;

    std::vector<int> arr(n); 
    std::cout << "Enter " << n << " elements: ";
    for (int i = 0; i < n; i++) {
        std::cin >> arr[i];
    }

    std::cout << "Original ";
    printArray(arr.data(), n);

    reverseArray(arr.data(), n);

    std::cout << "Reversed ";
    printArray(arr.data(), n);

    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }

    std::cout << "Sum of elements: " << sum << std::endl;

    return 0;
}
