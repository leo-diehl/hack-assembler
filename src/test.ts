import { readFileSync } from 'fs'
import path from 'path'
import { HackAssembler } from './assembler'
import { compileInstructions } from './compiler'

const root = path.resolve(__dirname, '..')

const assembly = readFileSync(
  path.join(root, `src/__tests__/fixtures/test_6.asm`),
  'utf-8'
)

const assembler = new HackAssembler()
assembler.loadAssemblyCode(assembly)
assembler.parse()

console.log(compileInstructions(assembler.instructions))
