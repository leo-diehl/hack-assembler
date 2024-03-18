import { readFileSync } from 'fs'
import { HackAssembler } from './hackAssembler'

import { expect, test } from 'vitest'

test('random program', () => {
  const assembler = new HackAssembler()

  assembler.loadAssemblyCode(`
  (MY_LABEL)

  @abau
  (MY_SECOND_LABEL)

  @MY_SECOND_LABEL
  0;JMP
  D=M
  `)

  expect(assembler.parse().compile()).toEqual([
    '0000000000010000',
    '0000000000000001',
    '1110101010000111',
    '1111110000010000',
  ])
})

test('assignment 6 program 1', () => {
  const assembler = new HackAssembler()

  assembler.loadAssemblyCode(`
  @2
  D=A
  @3
  D=D+A
  @0
  M=D
  `)

  expect(assembler.parse().compile()).toEqual([
    '0000000000000010',
    '1110110000010000',
    '0000000000000011',
    '1110000010010000',
    '0000000000000000',
    '1110001100001000',
  ])
})

test('assignment 6 program 2', () => {
  const assembler = new HackAssembler()

  assembler.loadAssemblyCode(`
  @0
  D=M
  @1
  D=D-M
  @10
  D;JGT
  @1
  D=M
  @12
  0;JMP
  @0
  D=M
  @2
  M=D
  @14
  0;JMP
  `)

  expect(assembler.parse().compile()).toEqual([
    '0000000000000000',
    '1111110000010000',
    '0000000000000001',
    '1111010011010000',
    '0000000000001010',
    '1110001100000001',
    '0000000000000001',
    '1111110000010000',
    '0000000000001100',
    '1110101010000111',
    '0000000000000000',
    '1111110000010000',
    '0000000000000010',
    '1110001100001000',
    '0000000000001110',
    '1110101010000111',
  ])
})
