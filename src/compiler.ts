import {
  AInstruction,
  CInstruction,
  Constant,
  Instruction,
  SymbolIdentifier,
  type Comp,
  type Dest,
  type Jump,
} from './types'

export const COMPS: Record<Comp, string> = {
  '0': '0101010',
  '1': '0111111',
  '-1': '0111010',
  D: '0001100',
  A: '0110000',
  '!D': '0001101',
  '!A': '0110001',
  '-D': '0001111',
  '-A': '0110011',
  'D+1': '0011111',
  'A+1': '0110111',
  'D-1': '0001110',
  'A-1': '0110010',
  'D+A': '0000010',
  'D-A': '0010011',
  'A-D': '0000111',
  'D&A': '0000000',
  'D|A': '0010101',
  M: '1110000',
  '!M': '1110001',
  '-M': '1110011',
  'M+1': '1110111',
  'M-1': '1110010',
  'D+M': '1000010',
  'D-M': '1010011',
  'M-D': '1000111',
  'D&M': '1000000',
  'D|M': '1010101',
} as const

export const DESTS: Record<Dest, string> = {
  null: '000',
  M: '001',
  D: '010',
  MD: '011',
  A: '100',
  AM: '101',
  AD: '110',
  AMD: '111',
} as const

export const JUMPS: Record<Jump, string> = {
  null: '000',
  JGT: '001',
  JEQ: '010',
  JGE: '011',
  JLT: '100',
  JNE: '101',
  JLE: '110',
  JMP: '111',
} as const

const dec2bin = (dec: number) => {
  return (dec >>> 0).toString(2)
}

const setBinaryLength = (binary: string, length: number) => {
  if (binary.length > length) {
    throw new Error(`Binary length exceeded: ${binary}`)
  }

  return '0'.repeat(length - binary.length) + binary
}

const compileConstant = (constant: Constant) => {
  const binaryValue = dec2bin(constant.value)
  if (binaryValue.length > 15) {
    throw new Error(`Constant exceeded 15 bits limit: ${constant.value}`)
  }

  return binaryValue
}
const compileSymbol = (symbol: SymbolIdentifier) => dec2bin(symbol.value)
const compileAInstruction = (aInstruction: AInstruction) => {
  const compiledOperand =
    aInstruction.operand.type === 'constant'
      ? compileConstant(aInstruction.operand)
      : compileSymbol(aInstruction.operand)

  const compiledOperandWithLeadingZeros = setBinaryLength(compiledOperand, 15)

  return `0${compiledOperandWithLeadingZeros}`
}

const compileCInstruction = (cInstruction: CInstruction) => {
  const dest = cInstruction.dest ? DESTS[cInstruction.dest] : DESTS.null
  const comp = COMPS[cInstruction.comp]
  const jump = cInstruction.jump ? JUMPS[cInstruction.jump] : JUMPS.null

  return `111${comp}${dest}${jump}`
}

export const compileInstructions = (instructions: Instruction[]) =>
  instructions.map((instruction) =>
    instruction.type === 'a_instruction'
      ? compileAInstruction(instruction)
      : compileCInstruction(instruction)
  )
