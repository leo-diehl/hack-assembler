import { readFileSync } from 'fs'
import { HackAssembler } from '../hackAssembler'

import { expect, test } from 'vitest'

test('fixture 1', () => {
  const assembler = new HackAssembler()

  const assembly = readFileSync('src/__tests__/fixtures/test_1.asm', 'utf-8')
  const hack = readFileSync('src/__tests__/fixtures/test_1.hack', 'utf-8')

  assembler.loadAssemblyCode(assembly)

  expect(assembler.parse().compile()).toEqual(hack.split('\n').filter(Boolean))
})

test('fixture 2', () => {
  const assembler = new HackAssembler()

  const assembly = readFileSync('src/__tests__/fixtures/test_2.asm', 'utf-8')
  const hack = readFileSync('src/__tests__/fixtures/test_2.hack', 'utf-8')

  assembler.loadAssemblyCode(assembly)

  expect(assembler.parse().compile()).toEqual(hack.split('\n').filter(Boolean))
})

test('fixture 3', () => {
  const assembler = new HackAssembler()

  const assembly = readFileSync('src/__tests__/fixtures/test_3.asm', 'utf-8')
  const hack = readFileSync('src/__tests__/fixtures/test_3.hack', 'utf-8')

  assembler.loadAssemblyCode(assembly)

  expect(assembler.parse().compile()).toEqual(hack.split('\n').filter(Boolean))
})

// test('fixture 4', () => {
//   const assembler = new HackAssembler()

//   const assembly = readFileSync('src/__tests__/fixtures/test_4.asm', 'utf-8')
//   const hack = readFileSync('src/__tests__/fixtures/test_4.hack', 'utf-8')

//   assembler.loadAssemblyCode(assembly)

//   expect(assembler.parse().compile()).toEqual(hack.split('\n').filter(Boolean))
// })

// test('fixture 5', () => {
//   const assembler = new HackAssembler()

//   const assembly = readFileSync('src/__tests__/fixtures/test_5.asm', 'utf-8')
//   const hack = readFileSync('src/__tests__/fixtures/test_5.hack', 'utf-8')

//   assembler.loadAssemblyCode(assembly)

//   expect(assembler.parse().compile()).toEqual(hack.split('\n').filter(Boolean))
// })

// test('fixture 6', () => {
//   const assembler = new HackAssembler()

//   const assembly = readFileSync('src/__tests__/fixtures/test_6.asm', 'utf-8')
//   const hack = readFileSync('src/__tests__/fixtures/test_6.hack', 'utf-8')

//   assembler.loadAssemblyCode(assembly)

//   expect(assembler.parse().compile()).toEqual(hack.split('\n').filter(Boolean))
// })
