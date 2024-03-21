import {
  Constant,
  SymbolIdentifier,
  AInstruction,
  CInstruction,
  Instruction,
  type Dest,
  type Comp,
  type Jump,
  DEST,
  COMP,
  JUMP,
} from './types'

const isDest = (dest: string): dest is Dest => {
  return DEST.hasOwnProperty(dest)
}

const isComp = (comp: string): comp is Comp => {
  return COMP.hasOwnProperty(comp)
}

const isJump = (jump: string): jump is Jump => {
  return JUMP.hasOwnProperty(jump)
}

type IgnoredChar = '' | ' ' | '\n' | '\t' | '\r' | '/'
const isIgnoredChar = (char: string) => {
  switch (char as IgnoredChar) {
    case '':
    case ' ':
    case '\n':
    case '\t':
    case '\r':
    case '/':
      return true
    default:
      return false
  }
}

const isDigit = (char: string) => char >= '0' && char <= '9'

const isLetter = (char: string) =>
  (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')

const testAllowedSymbolCharacters = (char: string) =>
  isDigit(char) ||
  isLetter(char) ||
  char === '_' ||
  char === '.' ||
  char === '$' ||
  char === ':'

export class HackAssembler {
  static variablesMemStart = 16

  private assemblyCode: string = ''

  private curLine = 0
  private curCharIndex = -1
  private instructionCounter = 0

  private symbols: Record<string, SymbolIdentifier> = {}
  private symbolsMemoryCounter = HackAssembler.variablesMemStart

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

  private parseSymbol = (stopChars?: string[]) => {
    let curChar = this.getCurChar()

    if (isDigit(curChar)) {
      this.throwErrorWithParserState("A symbol can't start with a digit")
    }

    let symbol = ''
    while (
      curChar &&
      (stopChars ? !stopChars.includes(curChar) : !isIgnoredChar(curChar))
    ) {
      if (!testAllowedSymbolCharacters(curChar)) {
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
    if (!isDigit(this.assemblyCode[this.curCharIndex])) {
      return null
    }

    let constant = ''

    while (true) {
      if (isIgnoredChar(this.getCurChar())) {
        this.curCharIndex--
        break
      }

      if (!isDigit(this.getCurChar())) {
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

  private skipIgnoredChars = () => {
    if (!isIgnoredChar(this.getCurChar())) {
      return
    }

    while (true) {
      switch (this.getCurChar() as IgnoredChar) {
        case '':
          return
        case ' ':
        case '\t':
        case '\r':
          this.curCharIndex++
          break
        case '\n':
          this.curCharIndex++
          this.curLine++
          break
        case '/':
          const nextNewlineIndex = this.assemblyCode.indexOf(
            '\n',
            this.curCharIndex
          )
          this.curLine++
          this.curCharIndex = nextNewlineIndex + 1
          break
        default:
          return
      }
    }
  }

  /**
   * Get a symbol from the symbols table, if it doesn't exist, create it.
   * We initialize the value of the symbol as NaN but they will be populated during further parsing:
   * - Instruction labels: will be populated when the the instruction label is reached by the parser.
   * - Memory pointers: will be populated in the end of the script.
   */
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
      if (isIgnoredChar(curChar)) {
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

  loadAssemblyCode(assemblyCode: string) {
    this.assemblyCode = assemblyCode
  }

  parse() {
    this.resetParserState()

    this.curLine++

    while (this.curCharIndex < this.assemblyCode.length) {
      this.curCharIndex++
      this.skipIgnoredChars()

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

    return this.instructions
  }
}
