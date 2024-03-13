import { readFileSync } from 'fs'
import path from 'path'
import { parse } from './parser'

const sourceAssemblyRawFilePath = process.argv[2]
const targetHackRawFilePath = process.argv[3]

const rootPath = path.join(__dirname, '..')

const sourceAssemblyFilePath = path.join(rootPath, sourceAssemblyRawFilePath)
const sourceAssembly = readFileSync(sourceAssemblyFilePath, 'utf-8')

const parsedAssembly = parse(sourceAssembly)
