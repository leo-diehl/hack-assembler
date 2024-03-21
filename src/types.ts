export const COMP = {
  '0': '0',
  '1': '1',
  '-1': '-1',
  D: 'D',
  A: 'A',
  '!D': '!D',
  '!A': '!A',
  '-D': '-D',
  '-A': '-A',
  'D+1': 'D+1',
  'A+1': 'A+1',
  'D-1': 'D-1',
  'A-1': 'A-1',
  'D+A': 'D+A',
  'D-A': 'D-A',
  'A-D': 'A-D',
  'D&A': 'D&A',
  'D|A': 'D|A',
  M: 'M',
  '!M': '!M',
  '-M': '-M',
  'M+1': 'M+1',
  'M-1': 'M-1',
  'D+M': 'D+M',
  'D-M': 'D-M',
  'M-D': 'M-D',
  'D&M': 'D&M',
  'D|M': 'D|M',
} as const
export type Comp = keyof typeof COMP

export const DEST = {
  null: 'null',
  M: 'M',
  D: 'D',
  MD: 'MD',
  A: 'A',
  AM: 'AM',
  AD: 'AD',
  AMD: 'AMD',
} as const
export type Dest = keyof typeof DEST

export const JUMP = {
  null: 'null',
  JGT: 'JGT',
  JEQ: 'JEQ',
  JGE: 'JGE',
  JLT: 'JLT',
  JNE: 'JNE',
  JLE: 'JLE',
  JMP: 'JMP',
} as const
export type Jump = keyof typeof JUMP

export interface Constant {
  type: 'constant'
  value: number
}

export interface SymbolIdentifier {
  type: 'symbol_identifier'
  identifier: string
  value: number
}

export interface AInstruction {
  type: 'a_instruction'
  operand: Constant | SymbolIdentifier
}

export interface CInstruction {
  type: 'c_instruction'
  dest: Dest | null
  comp: Comp
  jump: Jump | null
}

export type Instruction = AInstruction | CInstruction
