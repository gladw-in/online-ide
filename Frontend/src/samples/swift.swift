class Node<T> {
    var value: T
    var next: Node?
    var prev: Node?
    init(value: T) { self.value = value }
}

class DoublyLinkedList<T> {
    var head: Node<T>?
    var tail: Node<T>?

    func append(value: T) { // Add a node to the end
        let newNode = Node(value: value)
        if let tail = tail {
            tail.next = newNode
            newNode.prev = tail
            self.tail = newNode
        } else {
            head = newNode
            tail = newNode
        }
    }

    func printList() { // Print the list values
        var currentNode = head
        while let node = currentNode {
            print(node.value, terminator: " ")
            currentNode = node.next
        }
        print()
    }
}

let list = DoublyLinkedList<Int>()
list.append(value: 1)
list.append(value: 2)
list.append(value: 3)
list.append(value: 4)
list.printList() // Output: 1 2 3 4

