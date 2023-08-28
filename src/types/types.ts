export type PatternType = 'symbols' | 'quantifiers' | 'groups'

export type Tabs = 'Groups' | 'Symbols' | 'Quantifiers' | 'Flags' | 'Methods'

export type InsertType = Partial<
  Pick<Pattern, 'insert' | 'code' | 'selection' | 'isGroup'>
>

export type ClickEvent = React.MouseEvent<HTMLDivElement>

export interface InsertSelection {
  from: number
  to: number
  select: boolean
}

export interface Pattern {
  insert: string
  explanation: string
  code: string
  selection?: InsertSelection
  isGroup?: boolean
  link?: string
}

export interface Patterns {
  [key: string]: Pattern
}

export interface Ranges {
  [key: string]: {
    insert: string
    text: string
  }
}

export interface ClickInfo {
  x: number
  y: number
  event?: ClickEvent
}

export interface ExpressionCharacter {
  id: string
  symbol: string
}

export interface SelectionRange {
  text: string
  direction: 'left' | 'right' | 'none'
  firstElement: number
  lastElement: number
  numberOfElements: number
}

export interface TaggedSymbol {
  id: string
  symbol: string
  groupNumber?: { number: number; type: 'close' | 'open' }
  isEscaped?: boolean
  isQuantifier?: boolean
  isSetBracket?: boolean
  isSpecial?: boolean
  isSpecialGroup?: boolean
  isNamedGroup?: boolean
}

export interface Analyze {
  expression: ExpressionCharacter[]
}
