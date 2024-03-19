import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { HackAssembler } from '../hackAssembler'

import { expect, test } from 'vitest'

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

  const compiled = assembler.parse().compile()
  writeFileSync(
    `src/__tests__/compiled_result/${fixtureName}.hack`,
    compiled.join('\n')
  )

  expect(compiled).toEqual(hack.split('\n').filter(Boolean))
}

if (!existsSync('src/__tests__/compiled_result')) {
  mkdirSync('src/__tests__/compiled_result')
}

test.each(['test_1', 'test_2', 'test_3', 'test_4', 'test_5', 'test_6'])(
  'fixtures/%s',
  (fixtureName) => {
    testFixture(fixtureName)
  }
)
