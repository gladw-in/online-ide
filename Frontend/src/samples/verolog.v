module half_adder(input a, input b, output sum, output carry);

  // Define the logic for sum (XOR of inputs)
  assign sum = a ^ b;

  // Define the logic for carry (AND of inputs)
  assign carry = a & b;

endmodule

// Testbench to verify the half adder
module half_adder_tb;
  reg a, b;
  wire sum, carry;

  half_adder ha(
    .a(a),
    .b(b),
    .sum(sum),
    .carry(carry)
  );

  initial begin
    // Display header
    $display("a b | sum carry");
    $display("-----------");

    // Test cases
    a = 0; b = 0; #1; $display("%b %b | %b   %b", a, b, sum, carry);
    a = 0; b = 1; #1; $display("%b %b | %b   %b", a, b, sum, carry);
    a = 1; b = 0; #1; $display("%b %b | %b   %b", a, b, sum, carry);
    a = 1; b = 1; #1; $display("%b %b | %b   %b", a, b, sum, carry);

    // End simulation
    $finish;
  end

endmodule
