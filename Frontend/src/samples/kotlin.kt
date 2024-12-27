data class Node(var data: Int, var next: Node?)

fun main() {
    // Create a sample linked list
    val head = Node(1, Node(2, Node(3, Node(4, null))))

    // Print the linked list
    printLinkedList(head) //Prints the list to console
}

fun printLinkedList(head: Node?) {
    var current = head //Initialize a current node
    while (current != null) {
        print("${current.data} ") //Prints current node's data
        current = current.next //Moves to the next node
    }
    println() //Adds a newline at the end
}
