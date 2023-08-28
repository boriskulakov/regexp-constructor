import styles from './css/button.module.css'
import classNames from 'classnames'

import { InsertType, Patterns } from '@/types/types'

type Handler = ({ pattern }: { pattern: InsertType }) => void

interface ButtonsProps {
  patternType: string
  source: Patterns
  handler: Handler
  isHotkeyActive: boolean
}

function Buttons({
  patternType,
  source,
  handler,
  isHotkeyActive,
}: ButtonsProps) {
  const cutKeyFromShortcut = (shortcut: string) => {
    if (shortcut.startsWith('Shift+Key')) {
      shortcut = `Shift+${shortcut.slice(-1)}`
    }
    if (shortcut.startsWith('Key')) {
      shortcut = shortcut.slice(-1)
    }
    return shortcut
  }

  return (
    <div
      className={classNames(
        styles.container,
        patternType === 'quantifiers' && styles.quantifiers
      )}
    >
      {Object.values(source).map((pattern) => (
        <button
          key={pattern.insert}
          className={classNames(
            styles.btn,
            isHotkeyActive && styles.btn_hotkey
          )}
          onClick={() => handler({ pattern })}
          data-code={pattern.code}
        >
          <span className={classNames(styles.insertValue)}>
            {pattern.insert}
          </span>
          {isHotkeyActive && pattern.code && (
            <span className={classNames(styles.hotkey)}>
              [{cutKeyFromShortcut(pattern.code)}]
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default Buttons
