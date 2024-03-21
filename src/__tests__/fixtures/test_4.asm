// i=4
// if (i < 5) then
//   j = 3
// else
//   j = 2

// i=4
@4// Puts the constant 4 into the A register
D=A // Puts the value of A (4) into the D register
@i // Puts the i address into the A register
M=D // Puts the value of D (4) into the i memory address

// five=5
@5 // Puts the constant 5 into the A register
D=A // Puts the value of A (5) into the D register
@five // Puts the five address into the A register
M=D // Puts the value of D (5) into the five memory address

// -- if (i < 5) then j=3 else j=2

@i // Puts the i address into the A register
D=M // Puts the value of i into the D register
@five // Puts the five address into the A register
D=D-M // Puts i - 5 into the D register

// -- if (i < 5) then jump to LOAD_D_WITH_3
@LOAD_D_WITH_3 // Puts the LOAD_D_WITH_3 address into the A register
D;JLT // If D (i - 5)  is less than 0, jump to the LOAD_D_WITH_3 address

// -- else load the D register with 2
@2 // Puts the constant 2 into the A register
D=A // Puts the value of 2 into the D register
@ASSIGN_D_TO_J // Puts the ASSIGN_D_TO_J address into the A register
0;JMP // Jumps to the ASSIGN_D_TO_J address

// -- load the D register with 3
(LOAD_D_WITH_3) // Puts the LOAD_D_WITH_3 address into the A register
@3 // Puts the constant 3 into the A register
D=A // Puts the value of 3 into the D register

// -- j = D
(ASSIGN_D_TO_J) // Puts the ASSIGN_D_TO_J address into the A register
@j // Puts the j address into the A register
M=D // Puts the value of D (3 or 2) into the j memory address
