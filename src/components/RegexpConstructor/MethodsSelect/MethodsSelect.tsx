import styles from './css/methodsSelect.module.css'
import classNames from 'classnames'

import { useState, useEffect } from 'react'

interface MethodsSelectProps {
  clickHandler: (method: string) => void
}

const REGEXP_METHODS = [
  'str.match',
  'str.matchAll',
  'str.split',
  'str.search',
  'str.replace',
  'regexp.exec',
  'regexp.test',
]

function MethodsSelect({ clickHandler }: MethodsSelectProps) {
  const [isMethodsOpen, setIsMethodsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const onSelectClose = () => setIsMethodsOpen(false)
  const onOptionClick = (method: string) => {
    setIsCopied(true)
    clickHandler(method)
  }

  useEffect(() => {
    if (isCopied) setTimeout(() => setIsCopied(false), 2000)
  }, [isMethodsOpen])

  useEffect(() => {
    document.addEventListener('scroll', onSelectClose)
    return () => {
      document.removeEventListener('scroll', onSelectClose)
    }
  }, [])
  return (
    <div
      className={classNames(
        styles.methods,
        isMethodsOpen && styles.open,
        isCopied && styles.copied
      )}
      onClick={() => setIsMethodsOpen((prev) => !prev)}
    >
      <div className={classNames(styles.select)}>
        <div className={classNames(styles.methods_title)}>RegExp Методы</div>
        <div
          className={classNames(styles.arrow, isMethodsOpen && styles.open)}
        />
      </div>
      {isMethodsOpen && (
        <div className={classNames(styles.container)} tabIndex={0}>
          {REGEXP_METHODS.map((method) => (
            <button
              key={method}
              className={classNames(styles.button)}
              onClick={() => onOptionClick(method)}
            >
              {method}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MethodsSelect
