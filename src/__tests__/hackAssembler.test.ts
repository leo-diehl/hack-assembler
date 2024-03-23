import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { HackAssembler } from '../assembler'

import { beforeAll, describe, expect, test } from 'vitest'
import { compileInstructions } from '../compiler'

const testFixture = (fixtureName: string) => {
  const assembler = new HackAssembler()

  const assembly = readFileSync(
    `src/__tests__/fixtures/${fixtureName}.asm`,
    'utf-8'
  )
  const hack = readFileSync(
    `src/__tests__/fixtures/${fixtureName}.hack`,
    'utf-8'
  )

  assembler.loadAssemblyCode(assembly)

  const instructions = assembler.parse()
  const compiled = compileInstructions(instructions)
  writeFileSync(
    `src/__tests__/compiled_result/${fixtureName}.hack`,
    compiled.join('\n')
  )

  expect(compiled).toEqual(hack.split('\n').filter(Boolean))
}

describe('fixtures', () => {
  beforeAll(() => {
    if (!existsSync('src/__tests__/compiled_result')) {
      mkdirSync('src/__tests__/compiled_result')
    }
  })

  test.each(['test_1', 'test_2', 'test_3', 'test_4', 'test_5', 'test_6'])(
    '%s',
    (fixtureName) => {
      testFixture(fixtureName)
    }
  )
})

test('parseConstantToMemoryAssignment macro', () => {
  const assembler = new HackAssembler()

  assembler.loadAssemblyCode(`
    @5
    D=A
    @i
    M=D

    @200
    D=A
    @10
    M=D

    @END
    0;JMP

    (END)
  `)
  const instructions = assembler.parse()
  const compiled = compileInstructions(instructions)

  assembler.loadAssemblyCode(`
    M[i]=5
    M[10]=200

    @END
    0;JMP

    (END)
  `)
  const instructionsUsingMacro = assembler.parse()
  const compiledUsingMacro = compileInstructions(instructionsUsingMacro)

  expect(compiledUsingMacro).toEqual(compiled)
})
