import styles from './css/customInput.module.css'
import classNames from 'classnames'

import { useEffect, useRef, useState } from 'react'
import { uid } from 'uid'

import {
  analyzeExpression,
  defaultSelectionRange,
  getSelectionInfo,
  getSelectionNode,
  groupClass,
} from './utils'

import {
  TaggedSymbol,
  ExpressionCharacter,
  ClickInfo,
  SelectionRange,
  ClickEvent,
  InsertType,
} from '@/types/types'

import Portal from '../Portal'
import ContextMenu from './contextMenu/ContextMenu'

type RenderExpression = Array<{ isCursor: true } | TaggedSymbol>

interface setCursorSideProps {
  clientX: number
  clientY: number
  target: EventTarget
}

interface InputAction {
  expression: string
  symbolElements: ExpressionCharacter[]
  cursorPosition: number
  selection?: [number, number]
}

interface InputHistory {
  actions: InputAction[]
  currentStep: number
}

const defaultInputActions: InputAction[] = [
  { expression: '', symbolElements: [], cursorPosition: 0 },
]

interface CustomInputProps {
  currentInsert: InsertType
  flags: string[]
}

function CustomInput({ currentInsert, flags }: CustomInputProps) {
  const [inputHistory, setInputHistory] = useState<InputHistory>({
    actions: defaultInputActions.slice(),
    currentStep: 0,
  })
  const [currentSelection, setCurrentSelection] = useState({
    cursor: 0,
    range: { ...defaultSelectionRange },
  })
  const stepChangeType = useRef<'previous' | 'next' | ''>('')

  const isInsertSelected = useRef(false)
  const clickInfo = useRef<ClickInfo>({ x: 0, y: 0 })
  const expression = useRef<string>('')
  const symbolElements = useRef<ExpressionCharacter[]>([])

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
  const cursor = useRef<HTMLDivElement>(null!)
  const inputContainer = useRef<HTMLDivElement>(null!)
  const symbolsContainer = useRef<HTMLDivElement>(null!)

  const currentHistoryStep = inputHistory.actions[inputHistory.currentStep]

  expression.current = currentHistoryStep.expression

  symbolElements.current = currentHistoryStep.symbolElements.slice()

  const renderExpression: RenderExpression = analyzeExpression({
    expression: symbolElements.current,
  }).slice()

  if (currentSelection.cursor >= expression.current.length) {
    renderExpression.push({ isCursor: true })
  } else if (currentSelection.cursor === 0) {
    renderExpression.unshift({ isCursor: true })
  } else {
    renderExpression.splice(currentSelection.cursor, 0, {
      isCursor: true,
    })
  }

  const changeCursorPosition = (position: number) => {
    setCurrentSelection((prev) => ({ range: prev.range, cursor: position }))
  }
  const changeSelectedRange = (range: SelectionRange) => {
    setCurrentSelection((prev) => ({ cursor: prev.cursor, range: range }))
  }

  const changeHistory = (newHistoryStep: InputAction) => {
    let history = inputHistory.actions
    let nextStepNumber = inputHistory.currentStep + 1

    if (nextStepNumber < history.length) {
      history = history.slice(0, nextStepNumber)
    }

    if (history.length === 50) {
      nextStepNumber = 49
      history = history.slice(1)
    }

    if (newHistoryStep.expression !== expression.current) {
      setInputHistory({
        actions: history.concat(newHistoryStep),
        currentStep: nextStepNumber,
      })
      changeCursorPosition(newHistoryStep.cursorPosition)
    }

    resetSelectRanges()
  }

  const setCursorSide = ({ clientX, clientY, target }: setCursorSideProps) => {
    const targetElement = target as HTMLElement
    const parentChildren = getChildrenWithoutCursor()
    const elementUnderClick = document.elementFromPoint(clientX, clientY)

    const { firstElement, lastElement, direction } = currentSelection.range
    if (direction === 'right') {
      changeCursorPosition(lastElement)
      if (lastElement === expression.current.length) return
    }
    if (direction === 'left') {
      changeCursorPosition(firstElement)
    }

    if (elementUnderClick) {
      if (targetElement === elementUnderClick) {
        resetSelectRanges()
      }

      if (elementUnderClick.className === styles.symbols) {
        resetSelectRanges()
        changeCursorPosition(parentChildren.length)
      } else {
        const targetSize = elementUnderClick.getBoundingClientRect()
        const elementChildOrder = parentChildren.findIndex(
          (child) => child === elementUnderClick
        )
        if (targetSize.x + targetSize.width / 2 <= clientX) {
          changeCursorPosition(elementChildOrder + 1)
        } else {
          changeCursorPosition(elementChildOrder)
        }
      }
    }
  }

  const inputClickHandler = (event: ClickEvent) => {
    setCursorSide(event)
  }

  const rightClickHandler = (event: ClickEvent) => {
    const { clientX, clientY } = event
    clickInfo.current = { x: clientX, y: clientY, event }
    event.preventDefault()
    setIsContextMenuOpen(true)

    if (currentSelection.range.numberOfElements > 0) return
    setCursorSide(event)
  }

  const cutTextToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(onInputCut)
  }

  const copyTextToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const pasteTextFromClipboard = () => {
    navigator.clipboard.readText().then((clipText) => onInputPaste(clipText))
  }

  const copyFullExpression = () => {
    copyTextToClipboard(expression.current)
  }

  const onInputClear = () => {
    setInputHistory({
      actions: [currentHistoryStep].concat(defaultInputActions),
      currentStep: 1,
    })
    resetSelectRanges()
    changeCursorPosition(0)
  }

  const setHistoryStep = (
    symbols: ExpressionCharacter[],
    cursorOffset: number = 0
  ): InputAction => {
    return {
      expression: symbols.map((symbol) => symbol.symbol).join(''),
      symbolElements: symbols.slice(),
      cursorPosition: currentSelection.cursor + cursorOffset,
    }
  }

  const onInputPaste = (pasteData: string) => {
    inputContainer.current.focus()
    const { firstElement, lastElement, direction, numberOfElements } =
      currentSelection.range

    let newSymbols = symbolElements.current.slice()
    newSymbols.splice(
      firstElement >= 0 ? firstElement : currentSelection.cursor,
      direction !== 'none' ? numberOfElements : 0,
      ...pasteData.split('').map((symbol) => ({
        id: uid(),
        symbol,
      }))
    )

    const historyStep = setHistoryStep(newSymbols, pasteData.length)

    if (firstElement >= 0 && lastElement >= 0) {
      historyStep.cursorPosition = firstElement + pasteData.length
      historyStep.selection = [firstElement, lastElement]
    }

    changeHistory(historyStep)
  }

  const onInputCut = () => {
    inputContainer.current.focus()
    const { firstElement, lastElement, direction, numberOfElements } =
      currentSelection.range

    let newSymbols = symbolElements.current.slice()
    newSymbols.splice(
      firstElement >= 0 ? firstElement : currentSelection.cursor,
      direction !== 'none' ? numberOfElements : 0
    )

    const historyStep = setHistoryStep(newSymbols)

    if (firstElement >= 0 && lastElement >= 0) {
      historyStep.cursorPosition = firstElement
      historyStep.selection = [firstElement, lastElement]
    }

    changeHistory(historyStep)
  }

  const onPressBackspace = () => {
    if (currentSelection.range.numberOfElements) {
      onInputCut()
      return
    }
    if (currentSelection.cursor === 0) return

    let newSymbols = symbolElements.current.slice()
    newSymbols.splice(currentSelection.cursor - 1, 1)

    const historyStep = setHistoryStep(newSymbols, -1)
    changeHistory(historyStep)
  }

  const onPressDelete = () => {
    if (currentSelection.range.numberOfElements) {
      onInputCut()
      return
    }
    if (currentSelection.cursor === expression.current.length) return

    let newSymbols = symbolElements.current.slice()
    newSymbols.splice(currentSelection.cursor, 1)

    const historyStep = setHistoryStep(newSymbols)
    changeHistory(historyStep)
  }

  const onPressArrow = (nextPosition: number) => {
    const { lastElement, direction } = currentSelection.range
    if (
      direction === 'none' &&
      expression.current.length + 1 === nextPosition
    ) {
      nextPosition -= 1
    }
    if (direction === 'left') {
      nextPosition += 1
    }
    if (direction === 'right' && lastElement >= 0) {
      nextPosition = lastElement
    }
    resetSelectRanges()

    return nextPosition
  }

  const onPressLeftArrow = () => {
    const { cursor, range } = currentSelection
    if (cursor === 0 && range.direction === 'none') return
    let nextPosition = cursor - 1
    nextPosition = onPressArrow(nextPosition)
    changeCursorPosition(nextPosition)
  }

  const onPressRightArrow = () => {
    let nextPosition = currentSelection.cursor + 1
    nextPosition = onPressArrow(nextPosition)
    changeCursorPosition(nextPosition)
  }

  const changeHistoryStep = (type: 'previous' | 'next') => {
    const { currentStep, actions } = inputHistory
    let step = type === 'next' ? currentStep + 1 : currentStep - 1
    setInputHistory({
      actions,
      currentStep: step,
    })
    changeCursorPosition(actions[step].cursorPosition)
    stepChangeType.current = type
  }

  const selectAllExpression = () => {
    let range = new Range()
    const symbolNodes = getChildrenWithoutCursor()
    if (symbolNodes.length === 0) return
    range.setStart(symbolNodes[0], 0)
    range.setEnd(symbolNodes[symbolNodes.length - 1], 1)
    document.getSelection()?.removeAllRanges()
    document.getSelection()?.addRange(range)
  }

  const selectElementsWithArrow = (direction: 'right' | 'left') => {
    const selection = document.getSelection()
    if (!selection) return

    const allElements = getChildrenWithoutCursor()
    let { anchorNode, anchorOffset, focusNode, focusOffset } = selection
    let { firstElement, lastElement } = currentSelection.range

    if (direction === 'left') {
      if (currentSelection.cursor <= 0) return
      let nextCursorPosition = currentSelection.cursor - 1

      if (currentSelection.range.direction === 'none') {
        anchorNode = allElements[currentSelection.cursor]
        anchorOffset = 0
        focusNode = allElements[nextCursorPosition]
        focusOffset = 0
      }

      if (currentSelection.range.direction === 'right') {
        if (anchorNode === symbolsContainer.current && firstElement >= 0) {
          anchorNode = allElements[firstElement]
          anchorOffset = 0
        } else if (focusNode === symbolsContainer.current && lastElement >= 0) {
          focusNode = allElements[lastElement]
          focusOffset = 0
        } else {
          focusNode = allElements[nextCursorPosition]
          focusOffset = 0
        }
      }

      if (currentSelection.range.direction === 'left') {
        if (anchorNode === symbolsContainer.current && lastElement >= 0) {
          anchorNode = allElements[lastElement]
          anchorOffset = 0
        } else if (
          focusNode === symbolsContainer.current &&
          firstElement >= 0
        ) {
          focusNode = allElements[firstElement]
          focusOffset = 0
        } else {
          focusNode = allElements[nextCursorPosition]
          focusOffset = 0
        }
      }

      changeCursorPosition(nextCursorPosition)
      if (anchorNode && focusNode) {
        document
          .getSelection()
          ?.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset)
      }
      let newSelection = document.getSelection()

      newSelection && setSelectionRange(newSelection)
    }

    if (direction === 'right') {
      if (currentSelection.cursor === expression.current.length) return
      let newAnchor: { node: Node; index: number }

      if (anchorNode) {
        newAnchor = getSelectionNode(anchorNode, allElements)
      } else {
        newAnchor = {
          node: allElements[currentSelection.cursor],
          index: currentSelection.cursor,
        }
      }
      changeCursorPosition(currentSelection.cursor + 1)
      document
        .getSelection()
        ?.setBaseAndExtent(
          anchorNode ? anchorNode : newAnchor.node,
          anchorOffset || 0,
          allElements[currentSelection.cursor],
          1
        )
      let newSelection = document.getSelection()
      newSelection && setSelectionRange(newSelection)
    }
  }

  function resetSelectRanges() {
    document.getSelection()?.removeAllRanges()
    changeSelectedRange({ ...defaultSelectionRange })
  }

  const setSelectionRange = (selection: Selection) => {
    const selectionInfo = getSelectionInfo(
      selection,
      getChildrenWithoutCursor()
    )
    changeSelectedRange(Object.assign(currentSelection.range, selectionInfo))
  }

  function getChildrenWithoutCursor() {
    return [...symbolsContainer.current.children].filter(
      (node) => !node.classList.contains(styles.cursor)
    )
  }

  const getRegexpMethod = (method: string) => {
    let regexp = `/${expression.current}/${flags.join('')}`

    if (method.startsWith('str')) {
      regexp = `${method}(${regexp})`
      if (method === 'str.replace') {
        regexp = regexp.slice(0, -1).concat(`, '')`)
      }
    } else {
      regexp = regexp.concat(method.slice(6), '(str)')
    }
    navigator.clipboard.writeText(regexp)
  }

  useEffect(() => {
    if (stepChangeType.current === '') return

    let range = new Range()
    let selection = null
    const symbolNodes = getChildrenWithoutCursor()

    if (stepChangeType.current === 'previous') {
      selection = inputHistory.actions[inputHistory.currentStep + 1].selection
    }

    document.getSelection()?.removeAllRanges()
    if (selection) {
      range.setStart(symbolNodes[selection[0]], 0)
      range.setEnd(symbolNodes[selection[1] - 1], 1)
      document.getSelection()?.addRange(range)
      changeCursorPosition(selection[1])
    }

    stepChangeType.current = ''
  }, [stepChangeType.current])

  useEffect(() => {
    if (!currentInsert.insert) return
    if (currentInsert.insert.startsWith('method.')) {
      getRegexpMethod(currentInsert.insert.slice(7))
      return
    }
    if (document.activeElement !== inputContainer.current) {
      inputContainer.current.focus()
    }
    stepChangeType.current = ''

    switch (currentInsert.insert) {
      case 'copy expression':
        copyFullExpression()
        return
      case 'clear input':
        onInputClear()
        return
      case 'Backspace':
        onPressBackspace()
        return
      case 'Delete':
        onPressDelete()
        return
      case 'ArrowLeft':
        onPressLeftArrow()
        return
      case 'ArrowRight':
        onPressRightArrow()
        return
      case 'Control+KeyZ':
        if (inputHistory.currentStep < 1) return
        changeHistoryStep('previous')
        return
      case 'Control+KeyY':
        if (inputHistory.currentStep + 1 === inputHistory.actions.length) return
        changeHistoryStep('next')
        return
      case 'Control+KeyX':
        cutTextToClipboard(currentSelection.range.text)
        return
      case 'Control+KeyC':
        copyTextToClipboard(currentSelection.range.text)
        return
      case 'Control+KeyV':
        pasteTextFromClipboard()
        return
      case 'Control+KeyA':
        selectAllExpression()
        return
      case 'Shift+ArrowLeft':
        selectElementsWithArrow('left')
        return
      case 'Shift+ArrowRight':
        selectElementsWithArrow('right')
        return

      default:
        break
    }

    let { firstElement, lastElement, direction, numberOfElements } =
      currentSelection.range

    firstElement =
      firstElement < 0 ? lastElement - numberOfElements : firstElement

    let newSymbols = symbolElements.current.slice()

    if (currentInsert.isGroup && direction !== 'none') {
      newSymbols.splice(
        lastElement,
        0,
        ...currentInsert.insert
          .slice(-1)
          .split('')
          .map((symbol) => ({
            id: uid(),
            symbol,
          }))
      )
      newSymbols.splice(
        firstElement,
        0,
        ...currentInsert.insert
          .slice(0, -1)
          .split('')
          .map((symbol) => ({
            id: uid(),
            symbol,
          }))
      )
    } else {
      newSymbols.splice(
        firstElement >= 0 ? firstElement : currentSelection.cursor,
        numberOfElements,
        ...currentInsert.insert.split('').map((symbol) => ({
          id: uid(),
          symbol,
        }))
      )
    }

    const historyStep = setHistoryStep(newSymbols, currentInsert.insert.length)

    if (firstElement >= 0 && lastElement >= 0) {
      historyStep.cursorPosition = firstElement + currentInsert.insert.length
      historyStep.selection = [firstElement, lastElement]
    }
    if (currentInsert.selection) {
      if (currentInsert.selection.select) {
        isInsertSelected.current = true
      }

      historyStep.cursorPosition =
        historyStep.cursorPosition -
        currentInsert.insert.length +
        currentInsert.selection.to
    }

    changeHistory(historyStep)
  }, [currentInsert])

  useEffect(() => {
    if (!currentInsert.selection) return
    if (!isInsertSelected.current) return
    isInsertSelected.current = false

    const symbolNodes = getChildrenWithoutCursor()
    const { cursor } = currentSelection
    const { from, to } = currentInsert.selection

    let anchorNode = symbolNodes[cursor + from - to]
    let anchorOffset = 0
    let focusNode = symbolNodes[cursor]
    let focusOffset = 0
    document
      .getSelection()
      ?.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset)

    const newSelection = document.getSelection()
    newSelection && setSelectionRange(newSelection)
  }, [isInsertSelected.current])

  useEffect(() => {
    document.onselectionchange = function () {
      let selection = document.getSelection()
      if (!selection) return
      if (selection.anchorNode === symbolsContainer.current) return
      setSelectionRange(selection)
    }
  }, [])

  useEffect(() => {
    let urlId = setTimeout(() => {
      location.hash = encodeURI(expression.current)
    }, 200)

    return () => {
      clearTimeout(urlId)
    }
  }, [expression.current])

  return (
    <div
      className={classNames(styles.container)}
      tabIndex={0}
      ref={inputContainer}
    >
      <div
        className={classNames(styles.symbols)}
        ref={symbolsContainer}
        onClick={(e) => inputClickHandler(e)}
        onContextMenu={(e) => rightClickHandler(e)}
      >
        {renderExpression.map((elem) => {
          if ('isCursor' in elem) {
            return (
              <div
                key={'cursor'}
                className={classNames(styles.cursor)}
                ref={cursor}
              ></div>
            )
          }

          const { id, symbol, groupNumber } = elem

          return (
            <span
              key={id}
              data-symbol={symbol}
              className={classNames(styles.symbol, ...groupClass(elem, styles))}
              style={
                groupNumber
                  ? {
                      color: `hsl(calc(80 * ${groupNumber.number}) 70% 55%)`,
                    }
                  : {}
              }
            >
              {symbol}
            </span>
          )
        })}
      </div>

      {isContextMenuOpen && (
        <Portal>
          <ContextMenu
            onClose={() => setIsContextMenuOpen(false)}
            onCopyHandler={copyTextToClipboard}
            onCutHandler={cutTextToClipboard}
            onPasteHandler={pasteTextFromClipboard}
            onSelectHandler={selectAllExpression}
            clickInfo={clickInfo.current}
            selectionRange={currentSelection.range}
            flags={flags}
          />
        </Portal>
      )}
    </div>
  )
}

export default CustomInput
