interface Constant {
  type: 'constant'
  value: number
}

interface SymbolIdentifier {
  type: 'symbol_identifier'
  identifier: string
  value: number
}

interface AInstruction {
  type: 'a_instruction'
  operand: Constant | SymbolIdentifier
}

type Dest = keyof typeof DESTS
type Comp = keyof typeof COMPS
type Jump = keyof typeof JUMPS

interface CInstruction {
  type: 'c_instruction'
  dest: Dest | null
  comp: Comp
  jump: Jump | null
}

type Instruction = AInstruction | CInstruction

const COMPS = {
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

const DESTS = {
  null: '000',
  M: '001',
  D: '010',
  MD: '011',
  A: '100',
  AM: '101',
  AD: '110',
  AMD: '111',
} as const

const JUMPS = {
  null: '000',
  JGT: '001',
  JEQ: '010',
  JGE: '011',
  JLT: '100',
  JNE: '101',
  JLE: '110',
  JMP: '111',
} as const

const isDest = (dest: string): dest is Dest => {
  return DESTS.hasOwnProperty(dest)
}

const isComp = (comp: string): comp is Comp => {
  return COMPS.hasOwnProperty(comp)
}

const isJump = (jump: string): jump is Jump => {
  return JUMPS.hasOwnProperty(jump)
}

const dec2bin = (dec: number) => {
  return (dec >>> 0).toString(2)
}

export class HackAssembler {
  static variablesMemStart = 16

  assemblyCode: string = ''

  curLine = 0
  curCharIndex = -1
  instructionCounter = 0

  symbols: Record<string, SymbolIdentifier> = {}
  symbolsMemoryCounter = HackAssembler.variablesMemStart

  instructions: Instruction[] = []

  private throwErrorWithParserState(errorDescription: string) {
    const assemblyLines = this.assemblyCode.split('\n')

    const linesExcerpt = assemblyLines
      .map((line, index) =>
        index + 1 === this.curLine
          ? ` ${index + 1}| ${line} <<<`
          : ` ${index + 1}| ${line}`
      )
      .slice(
        Math.max(this.curLine - 4, 0),
        Math.min(this.curLine + 4, assemblyLines.length)
      )
      .join('\n')

    throw new Error(
      `${errorDescription}\n\nat line ${this.curLine}\nat position ${this.curCharIndex}\n${linesExcerpt}`
    )
  }

  private getCurChar() {
    return this.assemblyCode.charAt(this.curCharIndex)
  }

  static isDigit = (char: string) => char >= '0' && char <= '9'
  static isLetter = (char: string) =>
    (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')

  static testAllowedSymbolCharacters = (char: string) =>
    HackAssembler.isDigit(char) ||
    HackAssembler.isLetter(char) ||
    char === '_' ||
    char === '.' ||
    char === '$' ||
    char === ':'
  private parseSymbol = (stopChars = ['\n', ' ']) => {
    let curChar = this.getCurChar()

    if (HackAssembler.isDigit(curChar)) {
      this.throwErrorWithParserState("A symbol can't start with a digit")
    }

    let symbol = ''
    while (!stopChars.includes(curChar) && curChar !== '') {
      if (!HackAssembler.testAllowedSymbolCharacters(curChar)) {
        this.throwErrorWithParserState(
          `Invalid character inside a symbol: "${curChar}"`
        )
      }
      symbol += curChar
      this.curCharIndex++
      curChar = this.getCurChar()
    }

    if (!symbol) {
      this.throwErrorWithParserState(`Expected symbol definition`)
    }

    return symbol
  }

  private parseInstructionLabel = (): SymbolIdentifier | null => {
    if (this.getCurChar() !== '(') {
      return null
    }
    this.curCharIndex++

    const instructionSymbol = this.parseSymbol([')'])

    if (this.symbols[instructionSymbol]) {
      /**
       * If the symbol is already defined, it means that it was used
       * as a variable in some past instruction, so we just update
       * its value to the current instruction counter.
       */
      this.symbols[instructionSymbol].value = this.instructionCounter
    } else {
      this.symbols[instructionSymbol] = {
        type: 'symbol_identifier',
        identifier: instructionSymbol,
        value: this.instructionCounter,
      }
    }

    return this.symbols[instructionSymbol]
  }

  private parseConstant = (): Constant | null => {
    if (!HackAssembler.isDigit(this.assemblyCode[this.curCharIndex])) {
      return null
    }

    let constant = ''

    while (true) {
      if (
        this.getCurChar() === '\n' ||
        this.getCurChar() === ' ' ||
        this.getCurChar() === ''
      ) {
        this.curCharIndex--
        break
      }

      if (!HackAssembler.isDigit(this.getCurChar())) {
        this.throwErrorWithParserState(
          `Invalid character inside a constant: "${this.getCurChar()}"`
        )
      }

      constant += this.getCurChar()
      this.curCharIndex++
    }

    return {
      type: 'constant',
      value: parseInt(constant),
    }
  }

  private skipCommentsAndBlankSpaces = () => {
    while (true) {
      if (this.getCurChar() === '/') {
        const nextNewlineIndex = this.assemblyCode.indexOf(
          '\n',
          this.curCharIndex
        )
        this.curLine++
        this.curCharIndex = nextNewlineIndex + 1
        continue
      }

      if (this.getCurChar() === ' ') {
        this.curCharIndex++
        continue
      }

      if (this.getCurChar() === '\n') {
        this.curCharIndex++
        this.curLine++
        continue
      }

      break
    }
  }

  private getSymbol = (identifier: string) => {
    if (this.symbols[identifier] === undefined) {
      this.symbols[identifier] = {
        type: 'symbol_identifier',
        identifier: identifier,
        value: Number.NaN,
      }
    }

    return this.symbols[identifier]
  }

  private parseAInstruction = (): AInstruction | null => {
    if (this.getCurChar() !== '@') {
      return null
    }
    this.curCharIndex++

    const constantOperand = this.parseConstant()
    if (constantOperand) {
      return {
        type: 'a_instruction',
        operand: constantOperand,
      }
    }

    const symbolIdentifier = this.parseSymbol()
    const symbol = this.getSymbol(symbolIdentifier)

    if (symbol) {
      return {
        type: 'a_instruction',
        operand: symbol,
      }
    }

    return null
  }

  private parseCInstruction = (): CInstruction | null => {
    const parts = []

    let hasDest = false
    let hasJump = false

    let curPart = ''
    while (true) {
      const curChar = this.getCurChar()
      if (curChar === '\n' || curChar === ' ' || curChar === '') {
        break
      }

      this.curCharIndex++

      if (curChar === '=') {
        parts.push(curPart)
        curPart = ''

        hasDest = true
        continue
      } else if (curChar === ';') {
        parts.push(curPart)
        curPart = ''

        hasJump = true
        continue
      }

      curPart += curChar
    }
    if (curPart) {
      parts.push(curPart)
    }

    let dest: string = ''
    let comp: string = ''
    let jump: string = ''

    if (hasDest) {
      ;[dest, comp, jump] = parts
    } else {
      ;[comp, jump] = parts
    }

    if (!hasDest && !hasJump) {
      this.throwErrorWithParserState(
        `Invalid c-instruction: "${parts.join('')}"\nIt should have either a dest or a jump`
      )
    }

    if (hasDest && !isDest(dest)) {
      this.throwErrorWithParserState(
        `Invalid dest inside c-instruction: "${dest}"`
      )
    }
    if (!isComp(comp)) {
      this.throwErrorWithParserState(
        `Invalid comp inside c-instruction: "${comp}"`
      )
    }
    if (hasJump && !isJump(jump)) {
      this.throwErrorWithParserState(
        `Invalid jump inside c-instruction: "${jump}"`
      )
    }

    return {
      type: 'c_instruction',
      dest: dest as Dest | null,
      comp: comp as Comp,
      jump: jump as Jump | null,
    }
  }

  private parseNext = () => {
    const parsedInstructionLabel = this.parseInstructionLabel()
    if (parsedInstructionLabel) {
      return
    }

    const parsedAInstruction = this.parseAInstruction()
    if (parsedAInstruction) {
      this.instructions.push(parsedAInstruction)
      this.instructionCounter++
      return
    }

    const parsedCInstruction = this.parseCInstruction()
    if (parsedCInstruction) {
      this.instructions.push(parsedCInstruction)
      this.instructionCounter++
      return
    }
  }

  private resetParserState() {
    this.curCharIndex = -1
    this.instructionCounter = 0
    this.instructions = []
  }

  private interpret() {
    this.curLine++

    while (this.curCharIndex < this.assemblyCode.length) {
      if (this.getCurChar() === '\n') {
        this.curLine++
      }
      this.curCharIndex++

      this.skipCommentsAndBlankSpaces()
      if (this.curCharIndex >= this.assemblyCode.length) {
        break
      }

      this.parseNext()
    }

    /**
     * The symbols that will have no value at this point are the ones
     * that don't represent instruction labels, since the symbols that
     * represent instruction labels will have their values set when the
     * instruction label itself is reached by the parser.
     */
    Object.values(this.symbols).forEach((symbol) => {
      if (Number.isNaN(symbol.value)) {
        symbol.value = this.symbolsMemoryCounter
        this.symbolsMemoryCounter++
      }
    })
  }

  loadAssemblyCode(assemblyCode: string) {
    this.assemblyCode = assemblyCode
  }

  private setBinaryLength = (binary: string, length: number) => {
    if (binary.length > length) {
      throw new Error(`Binary length exceeded: ${binary}`)
    }

    return '0'.repeat(length - binary.length) + binary
  }

  private compileConstant = (constant: Constant) => {
    const binaryValue = dec2bin(constant.value)
    if (binaryValue.length > 15) {
      throw new Error(`Constant exceeded 15 bits limit: ${constant.value}`)
    }

    return binaryValue
  }
  private compileSymbol = (symbol: SymbolIdentifier) => dec2bin(symbol.value)
  private compileAInstruction = (aInstruction: AInstruction) => {
    const compiledOperand =
      aInstruction.operand.type === 'constant'
        ? this.compileConstant(aInstruction.operand)
        : this.compileSymbol(aInstruction.operand)

    const compiledOperandWithLeadingZeros = this.setBinaryLength(
      compiledOperand,
      15
    )

    return `0${compiledOperandWithLeadingZeros}`
  }

  private compileCInstruction = (cInstruction: CInstruction) => {
    const dest = cInstruction.dest ? DESTS[cInstruction.dest] : DESTS.null
    const comp = COMPS[cInstruction.comp]
    const jump = cInstruction.jump ? JUMPS[cInstruction.jump] : JUMPS.null

    return `111${comp}${dest}${jump}`
  }

  parse() {
    this.resetParserState()

    this.interpret()

    return this
  }

  compile() {
    return this.instructions.map((instruction) =>
      instruction.type === 'a_instruction'
        ? this.compileAInstruction(instruction)
        : this.compileCInstruction(instruction)
    )
  }
}
