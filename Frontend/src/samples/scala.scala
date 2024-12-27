import scala.collection.mutable.Queue

object QueueProgram extends App {
  val queue = new Queue[Int]() // Create a mutable queue of integers

  queue.enqueue(1) // Add elements to the queue
  queue.enqueue(2)
  queue.enqueue(3)

  println(s"Queue: $queue") // Print the queue

  println(s"Dequeue: ${queue.dequeue()}") // Dequeue and print the first element

  println(s"Queue after dequeue: $queue") // Print the queue after dequeueing

  println(s"Queue size: ${queue.size}") // Print the size of the queue

  if (queue.isEmpty) println("Queue is empty") else println("Queue is not empty") // Check if the queue is empty

}
