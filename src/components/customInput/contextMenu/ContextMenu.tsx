import styles from './css/contextMenu.module.css'
import classNames from 'classnames'

import { useEffect, useRef, FocusEvent } from 'react'
import { ClickInfo, SelectionRange } from '@/types/types'

const MENU_ITEMS = [
  {
    action: 'selectAll',
    title: 'Выбрать все',
  },
  {
    action: 'cut',
    title: 'Вырезать',
  },
  {
    action: 'paste',
    title: 'Вставить',
  },
  {
    action: 'copy',
    title: 'Копировать',
  },
  {
    action: 'copyWithFlags',
    title: 'Копировать с флагами',
  },
  {
    action: 'copyAsString',
    title: 'Копировать как строку',
  },
]

interface ContextMenuProps {
  onClose: () => void
  onCopyHandler: (text: string) => void
  onCutHandler: (text: string) => void
  onPasteHandler: () => void
  onSelectHandler: () => void
  clickInfo: ClickInfo
  selectionRange: SelectionRange
  flags: string[]
}

function ContextMenu({
  onClose,
  onCopyHandler,
  onCutHandler,
  onPasteHandler,
  onSelectHandler,
  clickInfo,
  selectionRange,
  flags,
}: ContextMenuProps) {
  const menu = useRef<HTMLDivElement>(null!)
  const windowSize = document.documentElement.clientWidth
  const menuPosition = {
    x: clickInfo.x,
    y: clickInfo.y,
    fromLeftSide: windowSize - clickInfo.x,
  }

  const closeHandler = () => onClose()
  const blurHandler = (event: FocusEvent<HTMLDivElement>) => {
    if (
      event.relatedTarget &&
      [...menu.current.children].includes(event.relatedTarget)
    )
      return
    onClose()
  }

  const clickHandler = (actionType: string) => {
    if (actionType === 'paste') {
      onPasteHandler()
    }
    if (actionType === 'copy') {
      onCopyHandler(selectionRange.text)
    }
    if (actionType === 'copyWithFlags') {
      onCopyHandler(`/${selectionRange.text}/${flags.join('')}`)
    }
    if (actionType === 'copyAsString') {
      let stringExp = `${selectionRange.text
        .replaceAll(/((\\{1})([^\\]))|(\\{2})/g, '$2$2$3$4$4')
        .replaceAll(/([`'"])/g, '\\$1')}`

      onCopyHandler(`'/${stringExp}/${flags.join('')}'`)
    }
    if (actionType === 'cut') {
      onCutHandler(selectionRange.text)
    }
    if (actionType === 'selectAll') {
      onSelectHandler()
      return
    }
    onClose()
  }

  useEffect(() => {
    menu.current.focus()

    document.addEventListener('scroll', closeHandler)
    return () => {
      document.removeEventListener('scroll', closeHandler)
    }
  }, [])

  return (
    <div
      className={classNames(styles.container)}
      ref={menu}
      tabIndex={0}
      onBlur={(e) => blurHandler(e)}
      style={{
        top: menuPosition.y,
        left:
          menuPosition.fromLeftSide > 210
            ? menuPosition.x
            : menuPosition.x - 210 + menuPosition.fromLeftSide,
      }}
    >
      {MENU_ITEMS.map((item) => (
        <button
          key={item.action}
          className={classNames(styles.button)}
          onClick={() => clickHandler(item.action)}
        >
          {item.title}
        </button>
      ))}
    </div>
  )
}

export default ContextMenu
