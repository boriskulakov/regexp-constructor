import styles from './css/regexp.module.css'
import classNames from 'classnames'

import { useEffect, useRef, useState } from 'react'
import { InsertType } from '@/types/types'
import { patterns } from '@/data/patterns'
import { availableCharacters, ranges, ranges_alphabet } from '@/data/ranges'

import CustomInput from '../customInput/CustomInput'
import MethodsSelect from './MethodsSelect/MethodsSelect'
import Buttons from '../Buttons/Buttons'

const clickHotkeyButton = (e: KeyboardEvent, keyCode: string) => {
  let button: HTMLElement = document.querySelector(
    `[data-code="${keyCode}"]`
  ) as HTMLElement

  if (button) {
    e.preventDefault()
    button.click()
  }
}

const VALUE_FROM_LINK = decodeURI(location.hash).slice(1)
const FLAGS = ['i', 'g', 'm', 's', 'y', 'd']

function RegexpConstructor() {
  const [currentInsert, setCurrentInsert] = useState<InsertType>({
    insert: VALUE_FROM_LINK,
  })
  const [activeFlags, setActiveFlags] = useState<Set<string>>(new Set())

  const isHotkeyOn = useRef(false)
  const copyButton = useRef<HTMLButtonElement>(null!)
  const shareButton = useRef<HTMLButtonElement>(null!)
  const pressedKeys = useRef<Map<string, string>>(new Map())

  const changeActiveFlags = (flag: string) => {
    activeFlags.has(flag) ? activeFlags.delete(flag) : activeFlags.add(flag)
    setActiveFlags(new Set(activeFlags))
  }

  const switchHotkeyActive = () => {
    isHotkeyOn.current = !isHotkeyOn.current
    setCurrentInsert({ insert: '' })
  }

  const addPressedKey = (keyCode: string, keyValue: string) => {
    if (pressedKeys.current.size === 0) {
      pressedKeys.current.set(keyValue, keyCode)
      return
    }

    if (
      pressedKeys.current.has('Shift') ||
      pressedKeys.current.has('Control')
    ) {
      if (!pressedKeys.current.has(keyValue)) {
        pressedKeys.current.set(keyValue, keyCode)
      }
      return
    }

    pressedKeys.current = new Map()
    pressedKeys.current.set(keyValue, keyCode)
  }

  const deletePressedKey = ({ key: keyValue }: KeyboardEvent) => {
    pressedKeys.current.delete(keyValue)
  }

  const customSpecialAction = (e: KeyboardEvent, insert: InsertType) => {
    e.preventDefault()
    setCurrentInsert(insert)
  }

  const keyPressHandler = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      switchHotkeyActive()
      return
    }

    let keyCode = e.code
    let keyValue = e.key

    addPressedKey(keyCode, keyValue)

    if (pressedKeys.current.has('Shift')) {
      keyCode = `Shift+${keyCode}`
    }
    if (pressedKeys.current.has('Control')) {
      keyCode = `Control+${keyCode}`
      keyValue = `Control+${keyValue}`
    }

    let hotkeyButtonValue = Object.values(patterns)
      .map((patternType) => Object.values(patternType))
      .flat()
      .find((pattern) => pattern.code === keyCode)

    if (isHotkeyOn.current && hotkeyButtonValue) {
      clickHotkeyButton(e, keyCode)
      setCurrentInsert({ ...hotkeyButtonValue })
      return
    }

    if (availableCharacters.find((group) => group.includes(keyValue))) {
      setCurrentInsert({ insert: keyValue })
    }

    switch (keyCode) {
      case 'Backspace':
      case 'Delete':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Shift+ArrowLeft':
      case 'Shift+ArrowRight':
      case 'Control+KeyZ':
      case 'Control+KeyY':
      case 'Control+KeyX':
      case 'Control+KeyC':
      case 'Control+KeyV':
      case 'Control+KeyA':
        customSpecialAction(e, { insert: keyCode })
        break

      case 'Space':
        e.preventDefault()
        break

      default:
        break
    }
  }

  const copyFullExpression = () => {
    setCurrentInsert({ insert: 'copy expression' })
    copyButton.current.classList.add(styles.success)
    setTimeout(() => copyButton.current.classList.remove(styles.success), 1000)
  }

  const shareExpressionLink = () => {
    navigator.clipboard.writeText(location.toString())

    shareButton.current.disabled = true
    shareButton.current.classList.add(styles.success)
    shareButton.current.textContent = 'Ссылка скопирована'

    setTimeout(() => {
      shareButton.current.disabled = false
      shareButton.current.textContent = 'Поделиться'
      shareButton.current.classList.remove(styles.success)
    }, 1500)
  }

  const onSelectRegexpMethod = (method: string) => {
    setCurrentInsert({ insert: `method.${method}` })
  }

  const insertByButton = ({ pattern }: { pattern: InsertType }) => {
    setCurrentInsert(pattern)
  }

  useEffect(() => {
    document.addEventListener('keydown', keyPressHandler)
    document.addEventListener('keyup', deletePressedKey)
    return () => {
      document.removeEventListener('keydown', keyPressHandler)
      document.removeEventListener('keyup', deletePressedKey)
    }
  }, [])

  return (
    <>
      <div className={classNames(styles.input_container)}>
        <div className={classNames(styles.actions)}>
          <button
            className={classNames(
              styles.action_btn,
              styles.icon_btn,
              styles.copy
            )}
            onClick={copyFullExpression}
            ref={copyButton}
          />
          <button
            className={classNames(
              styles.action_btn,
              styles.icon_btn,
              styles.undo
            )}
            onClick={() => setCurrentInsert({ insert: 'Control+KeyZ' })}
          />
          <button
            className={classNames(
              styles.action_btn,
              styles.icon_btn,
              styles.redo
            )}
            onClick={() => setCurrentInsert({ insert: 'Control+KeyY' })}
          />
          <button
            className={classNames(styles.action_btn, styles.select_all)}
            onClick={() => setCurrentInsert({ insert: 'Control+KeyA' })}
          >
            Выбрать все
          </button>
          <button
            className={classNames(styles.action_btn, styles.share)}
            onClick={shareExpressionLink}
            ref={shareButton}
          >
            Поделиться
          </button>

          <button
            className={classNames(
              styles.action_btn,
              styles.icon_btn,
              styles.clear
            )}
            onClick={() => setCurrentInsert({ insert: 'clear input' })}
          />
        </div>

        <CustomInput currentInsert={currentInsert} flags={[...activeFlags]} />
      </div>

      <div className={classNames(styles.setting)}>
        <div className={classNames(styles.hk)}>
          <span className={classNames(styles.hk_title)}>Сочетания клавиш</span>
          <button
            className={classNames(styles.hk_btn)}
            onClick={switchHotkeyActive}
          >
            <span className={classNames(styles.hk_btn_text)}>
              {isHotkeyOn.current ? 'Отключить' : 'Включить'}
            </span>
            <span className={classNames(styles.hk_btn_esc)}>[Esc]</span>
          </button>
        </div>

        <MethodsSelect clickHandler={onSelectRegexpMethod} />

        <div className={classNames(styles.flags)}>
          Флаги:
          {FLAGS.map((flag) => (
            <span
              key={flag}
              className={classNames(
                styles.flag,
                activeFlags.has(flag) && styles.active_flag
              )}
              onClick={() => changeActiveFlags(flag)}
            >
              {flag}
            </span>
          ))}
        </div>
      </div>

      <div className={classNames(styles.keyborad)}>
        <div className={classNames(styles.main)}>
          {Object.entries(patterns).map(([patternType, patternList]) => (
            <Buttons
              key={patternType}
              patternType={patternType}
              source={patternList}
              handler={insertByButton}
              isHotkeyActive={isHotkeyOn.current}
            />
          ))}

          <div className={classNames(styles.ranges)}>
            <div className={classNames(styles.range)}>
              {Object.values(ranges).map((range) => (
                <button
                  key={range.text}
                  className={classNames(styles.btn)}
                  onClick={() => insertByButton({ pattern: range })}
                >
                  {range.text}
                </button>
              ))}
            </div>
            <div className={classNames(styles.range)}>
              {Object.values(ranges_alphabet).map((range) => (
                <button
                  key={range.text}
                  className={classNames(styles.btn)}
                  onClick={() => insertByButton({ pattern: range })}
                >
                  {range.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegexpConstructor
