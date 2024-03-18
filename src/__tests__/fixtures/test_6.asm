// A[0]=5
// A[1]=4
// A[2]=3
// A[3]=2
// A[4]=1
// A[5]=0
// for (i=0; i<=5; i++) {
//   if A[i] == 0 then
//     A[i] = 5;
// }

// ---- APPROACH
// I had the insight that both the array value assignment and the if block could both be implemented using the same FOR LOOP.
// This leads to much more code but I thought it was a good exercise.
//
// To initialize the array, we will basically do:
//   for (i=0; i<=5; i++) {
//     A[i] = 5 - i;
//   }
// Then, we will use the same FOR LOOP to implement the if block:
//   for (i=0; i<=5; i++) {
//    if A[i] == 0 then
//     A[i] = 5;
//   }
//
// So we first need to declare a reusable FOR LOOP.
// To do so, the FOR LOOP will have a start label (FOR_START) that should be called by their consumers to trigger the loop.
// Inside the FOR LOOP, we will have two jumps that will go to intructions stored inside variables set by the consumers:
//  - forBody: the address of the consumer's set of instructions that should be executed in the FOR LOOP body
//  - forExit: the point into which to jump to when the FOR LOOP condition is not met
//
// So the consumer will set the forStart and the forExit, and then jump to the FOR_START label to start the loop.
//  1. The FOR LOOP will initialize i as 0;
//  2. It will check if i <= 5, if not, it will jump to the forExit instruction set by the consumer
//  3. If i <= 5, it jump to the forBody instruction set by the consumer
//  4. Now inside the forBody instructions from the consumer, the constumer instructions will be executed
//     -> Important to note here that "i" will be available to the consumer
//  5. By the end of the consumer forBody, the consumer performs a jump to FOR_AFTER_BODY,
//     a label right after the jump to the forBody inside the FOR LOOP implementation
//  6. Now once again inside the FOR LOOP implementation, the i is incremented and the loop goes back to step 2
// ----------

// Setting the start of the array A to mem location 100
@100
D=A
@A_address
M=D

@SCRIPT_BODY
0;JMP // jump to the start of the script body

// Script methods declaration

// FOR LOOP definition
//
// for (i=0; i<=5; i++) {
//   (forBody)
// }
//
(FOR_START)
@0
D=A // load 0 into D
@i
M=D // store 0 into i

(FOR_LOOP_START)
@i
D=M // load i into D
@5
D=A-D // load 5 - i into D
@forExit
A=M // load forExit address into A
D;JLT // if i > 5 then jump to forExit

@forBody
A=M
0;JMP // jump to forBody
(FOR_AFTER_BODY)
@i
M=M+1 // increment i

@FOR_LOOP_START
0;JMP // jump to FOR_LOOP_START
// ----------------

(SCRIPT_BODY)

// -- For loop body to initialize the array
//
// for (i=0; i<=5; i++) {
//  A[i] = 5 - i;
// }
//
// Setup to use the FOR LOOP subscript
@INITIALIZE_ARRAY_FOR_LOOP_BODY
D=A
@forBody
M=D // set the forBody address
@INITIALIZE_ARRAY_FOR_LOOP_END
D=A
@forExit
M=D // set the forExit address
@FOR_START
0;JMP // jump to the start of the FOR LOOP

// A[i] = 5 - i
(INITIALIZE_ARRAY_FOR_LOOP_BODY)
@i
D=M // load i into D
@5
D=A-D // load 5 - i into D
@currentItemValue
M=D // store 5 - i into currentItemValue

@i
D=M // load i into D
@A_address
A=M
D=D+A // load A[i] address into D
@currentItemAddress
M=D // store A[i] address into currentItemAddress

@currentItemValue
D=M // load 5 - i into D
@currentItemAddress
A=M
M=D // store 5 - i into A[i]

@FOR_AFTER_BODY
0;JMP // jump to the end of the FOR LOOP
(INITIALIZE_ARRAY_FOR_LOOP_END)
// -- End of FOR LOOP body to initialize the array

// -- For loop body to implement the if block
//
// for (i=0; i<=5; i++) {
//   if A[i] == 0 then
//     A[i] = 5;
// }
//
// Setup to use the FOR LOOP subscript
@LOGIC_FOR_LOOP_BODY
D=A
@forBody // set the forBody address
M=D
@LOGIC_FOR_LOOP_END
D=A
@forExit // set the forExit address
M=D
@FOR_START
0;JMP // jump to the start of the FOR LOOP

// if A[i] == 0 then
//   A[i] = 5;
(LOGIC_FOR_LOOP_BODY)
@i
D=M // load i into D
@A_address
A=M
D=D+A // load A[i] address into D
@currentItemAddress
M=D // store A[i] address into currentItemAddress

A=D
D=M // load A[i] value into D

// if A[i] != 0 then skip if block
@GO_TO_FOR_AFTER_BODY
D;JNE

// - if body
@5
D=A // load 5 into D
@currentItemAddress
A=M
M=D // A[i] = 5
// - end of if body

(GO_TO_FOR_AFTER_BODY)
@FOR_AFTER_BODY
0;JMP // jump to the end of the FOR LOOP
(LOGIC_FOR_LOOP_END)
