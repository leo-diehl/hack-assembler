// J=5
// for(i=1; i<5; i++) {
//   J--
// }

// Initializing J
// J=5
@5 // Puts the 5 address into the A register
D=A // Puts the value of 5 into the D register
@J // Puts the J address into the A register
M=D // Puts the value of D (5) into the J memory address

// Initializing i
// i=1
@1 // Puts the 1 address into the A register
D=A // Puts the value of 1 into the D register
@i // Puts the i address into the A register
M=D // Puts the value of D (1) into the i memory address

// Initializing five to use as a constant
// five=5
@5
D=A
@five
M=D

(FOR_START)
// -- if i < 5, break the loop
@i // Puts the i address into the A register
D=M // Puts the value of i into the D register
@five // Puts the five address into the A register
D=M-D // Puts i - 5 into the D register
@FOR_END // Puts the FOR_END address into the A register
D;JLE // If D (i - 5)  is less than or equal to 0, jump to the FOR_END address

// i++
@i // Puts the i address into the A register
M=M+1 // Puts the value of i + 1 into the A memory address
@J // Puts the J address into the A register
M=M-1 // Puts the value of J - 1 into the J memory address

// loop
@FOR_START // Puts the FOR_START address into the A register
0;JMP // Jumps to the FOR_START address

(FOR_END)