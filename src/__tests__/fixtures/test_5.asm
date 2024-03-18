// i = 0
// j = 0
// while(i==0) {
//   j++
//   if j = 5 then
//     i = j
// }

// Initializing i
// i=0
@0 // Puts the 0 address into the A register
D=A // Puts the value of 0 into the D register
@i // Puts the i address into the A register
M=D // Puts the value of D (0) into the i memory address

// Initializing j
// j=0
@j // Puts the j address into the A register
M=D // Puts the value of D (0) into the j memory address

// Initializing five to use as a constant
// five=5
@5
D=A
@five
M=D

(WHILE_START)
// -- if i == 0, break the loop
@i // Puts the i address into the A register
D=M // Puts the value of i into the D register
@END // Puts the WHILE_END address into the A register
D;JNE // If D (i) is not equal to 0, jump to the END instruction

// j++
@j // Puts the j address into the A register
M=M+1 // Puts the value of j + 1 into the j memory address

// -- if j == 5, i = j
@j // Puts the j address into the A register
D=M // Puts the value of j into the D register
@five // Puts the five address into the A register
D=M-D // Puts j - 5 into the D register
@WHILE_START // Puts the WHILE_START address into the A register
D;JNE // If D (j - 5) is NOT equal to 0, jump to the WHILE_START address

@j // Puts the j address into the A register
D=M // Puts the value of j into the D register
@i // Puts the i address into the A register
M=D // Puts the value of D (j) into the i memory address

// loop
@WHILE_START // Puts the WHILE_START address into the A register
0;JMP // Jumps to the WHILE_START address

(END)
