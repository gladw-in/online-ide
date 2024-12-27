struct Node
    data::Int
    prev::Union{Node,Nothing}
    next::Union{Node,Nothing}
end

function create_list(arr) # create a doubly linked list from an array
    head = nothing
    tail = nothing
    for x in arr
        new_node = Node(x, tail, nothing)
        if tail != nothing
            tail.next = new_node
        end
        tail = new_node
        if head == nothing
            head = new_node
        end
    end
    return head
end

function print_list(head) # print the list
    curr = head
    while curr != nothing
        print(curr.data, " ")
        curr = curr.next
    end
    println()
end


head = create_list([1, 2, 3, 4, 5]) # create a sample list
print_list(head) # print the list

