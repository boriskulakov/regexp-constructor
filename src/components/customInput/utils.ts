import { Analyze, SelectionRange, TaggedSymbol } from '@/types/types'

export const getSelectionNode = (
  selectionNode: Node,
  allElements: Element[]
) => {
  let currentNode = selectionNode
  if (currentNode && currentNode.nodeType === 3) {
    currentNode = currentNode.parentElement!
  }
  let nodeIndex = allElements.findIndex((el) => el === currentNode)

  return { node: currentNode, index: nodeIndex }
}

export const defaultSelectionRange: SelectionRange = {
  text: '',
  direction: 'none',
  firstElement: -1,
  lastElement: -1,
  numberOfElements: 0,
}

export const getSelectionInfo = (
  selection: Selection,
  symbolNodes: Element[]
) => {
  const info = { ...defaultSelectionRange }
  info.text = selection.toString().split('\n').join('')

  if (!selection?.anchorNode) return info

  const anchorNode = selection?.anchorNode as Element
  const focusNode = selection?.focusNode as Element

  let { index: anchorPosition } = getSelectionNode(anchorNode, symbolNodes)
  let { index: focusPosition } = getSelectionNode(focusNode, symbolNodes)

  if (anchorPosition !== -1) {
    anchorPosition += selection.anchorOffset
  }
  if (focusPosition !== -1) {
    focusPosition += selection.focusOffset
  }
  if (anchorPosition === focusPosition) return info

  info.direction = anchorPosition > focusPosition ? 'left' : 'right'
  info.firstElement = Math.min(anchorPosition, focusPosition)
  info.lastElement = Math.max(anchorPosition, focusPosition)
  info.numberOfElements = info.text.length
  return info
}

export function analyzeExpression({ expression }: Analyze) {
  if (expression.length < 1) return expression

  let taggedExpression: TaggedSymbol[] = []
  let backslashCount = 0
  let openGroups: number[] = []
  let maxGroupNumber = 0
  let isSetOpen = false
  let quantifiers: { prev: number | null } = { prev: null }

  for (let i = 0; i < expression.length; i++) {
    const { id, symbol } = expression[i]

    let taggedSymbol: TaggedSymbol = { id, symbol }

    if (backslashCount % 2) {
      taggedSymbol.isEscaped = true
      taggedExpression[i - 1].isEscaped = true
    } else {
      if (!isSetOpen) {
        if (symbol === '[') {
          isSetOpen = true
          taggedSymbol.isSetBracket = true
        }
        if (symbol === '(') {
          maxGroupNumber += 1
          openGroups.push(maxGroupNumber)
          taggedSymbol.groupNumber = { number: maxGroupNumber, type: 'open' }
        }
        if (symbol === ')' && openGroups.length > 0) {
          taggedSymbol.groupNumber = {
            number: openGroups.pop() as number,
            type: 'close',
          }
        }
        if (symbol === '{') {
          quantifiers.prev = i
          taggedSymbol.isQuantifier = true
        }

        if (symbol === '}' && typeof quantifiers.prev === 'number') {
          let quantiferValue = expression
            .slice(quantifiers.prev + 1, i)
            .filter(({ symbol }) => !isNaN(+symbol) || symbol === ',')

          if (quantiferValue.length + 1 === i - quantifiers.prev) {
            taggedSymbol.isQuantifier = true
          } else {
            taggedExpression[quantifiers.prev].isQuantifier = false
          }
          quantifiers.prev = null
        }
        if (['+', '*', '?', '^', '$', '|'].includes(symbol)) {
          taggedSymbol.isSpecial = true
        }
      } else {
        if (symbol === ']') {
          isSetOpen = false
          taggedSymbol.isSetBracket = true
        }
        if (symbol === '^' && expression[i - 1].symbol === '[') {
          taggedSymbol.isSetBracket = true
        }
      }
    }

    if (symbol === '\\') {
      backslashCount += 1
    } else {
      backslashCount = 0
    }

    taggedExpression.push(taggedSymbol)
  }

  for (let k = 0; k < taggedExpression.length; k++) {
    if (taggedExpression[k].symbol !== '(' || !taggedExpression[k].groupNumber)
      continue

    const setElementsTags = (to: number, tag: string) => {
      for (let t = k + 1; t <= to; t++) {
        taggedExpression[t] = Object.assign(taggedExpression[t], {
          [tag]: true,
        })
      }
    }

    let groupFirstChars = taggedExpression
      .slice(k + 1, k + 4)
      .map((el) => el.symbol)
      .join('')

    if (groupFirstChars.startsWith('?<')) {
      let closeBracket = taggedExpression.findIndex(
        (el, index) => el.symbol === '>' && index > k + 2
      )
      let groupName = taggedExpression
        .slice(k + 3, closeBracket + 1)
        .map((el) => el.symbol)
        .join('')

      if (groupName.match(/[a-zA-Z$_]+[\w$]*\>/)?.index === 0) {
        setElementsTags(closeBracket, 'isNamedGroup')
      }
    }
    if (
      groupFirstChars.startsWith('?:') ||
      groupFirstChars.startsWith('?=') ||
      groupFirstChars.startsWith('?!')
    ) {
      setElementsTags(k + 2, 'isSpecialGroup')
    }
    if (
      groupFirstChars.startsWith('?<=') ||
      groupFirstChars.startsWith('?<!')
    ) {
      setElementsTags(k + 3, 'isSpecialGroup')
    }
  }

  return taggedExpression
}

export const groupClass = (
  symbol: TaggedSymbol,
  styles: Record<string, string>
) => {
  let specialClasses = []
  if (symbol.groupNumber) {
    specialClasses.push(
      symbol.groupNumber.type === 'open'
        ? 'group_bracket_open'
        : 'group_bracket_close'
    )
  }
  if (symbol.isEscaped) {
    specialClasses.push('escaped')
  }
  if (symbol.isQuantifier) {
    specialClasses.push('quantifier')
  }
  if (symbol.isSetBracket) {
    specialClasses.push('set_bracket')
  }
  if (symbol.isSpecial) {
    specialClasses.push('special')
  }
  if (symbol.isSpecialGroup) {
    specialClasses.push('special_group')
  }
  if (symbol.isNamedGroup) {
    specialClasses.push('named_group')
  }
  return specialClasses.map((className) => styles[className])
}
