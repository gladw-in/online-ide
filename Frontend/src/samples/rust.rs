fn main() {
    let num1: f64 = 10.5;
    let num2: f64 = 2.0;

    let addition = num1 + num2;
    let subtraction = num1 - num2;
    let multiplication = num1 * num2;
    let division = num1 / num2;

    println!("{} + {} = {}", num1, num2, addition);
    println!("{} - {} = {}", num1, num2, subtraction);
    println!("{} * {} = {}", num1, num2, multiplication);
    println!("{} / {} = {}", num1, num2, division);
}