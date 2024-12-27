function bubbleSort(arr: number[]): number[] { // function to perform bubble sort
    const len = arr.length;
    for (let i = 0; i < len; i++) { // iterate through the array
      for (let j = 0; j < len - i - 1; j++) { // iterate through the unsorted portion
        if (arr[j] > arr[j + 1]) { // compare adjacent elements
          // swap elements if they are in the wrong order
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr; // return the sorted array
  }
  
  const unsortedArray = [64, 34, 25, 12, 22, 11, 90];
  const sortedArray = bubbleSort(unsortedArray);
  console.log("Sorted array:", sortedArray); // print the sorted array
  