import styles from './css/infoSection.module.css'
import classNames from 'classnames'

import { patterns } from '@/data/patterns'
import { PatternType, Tabs } from '@/types/types'
import { FLAGS_INFO, METHODS_INFO } from '@/data/info'

interface InfoSectionProps {
  infoType: Tabs
}

interface Info {
  symbol: string
  explanation: string
  link?: string
}

function InfoSection({ infoType }: InfoSectionProps) {
  const getPatternsInfo = (type: PatternType) => {
    return Object.values(patterns[type]).map(
      ({ insert, explanation, link }) => ({
        symbol: insert,
        explanation,
        link,
      })
    )
  }

  let info: Info[] = getPatternsInfo('symbols')

  switch (infoType) {
    case 'Symbols':
      info = info
      break
    case 'Groups':
      info = getPatternsInfo('groups')
      break
    case 'Quantifiers':
      info = getPatternsInfo('quantifiers')
      break
    case 'Flags':
      info = FLAGS_INFO
      break
    case 'Methods':
      info = METHODS_INFO
      break

    default:
      break
  }

  return (
    <div className={classNames(styles.container)}>
      {infoType === 'Quantifiers' && (
        <div className={classNames(styles.notes)}>
          Квантификаторы определяют количество повторений символа, набора или
          группы, после которых они указаны
        </div>
      )}

      <div className={classNames(styles.main)}>
        {info.map((pattern) => (
          <div className={classNames(styles.info)} key={pattern.symbol}>
            <span className={classNames(styles.symbol)}>{pattern.symbol}</span>
            <span>⇒</span>
            {pattern.link ? (
              <a
                href={pattern.link}
                target="blank"
                className={classNames(styles.explanation, styles.link)}
              >
                {pattern.explanation}
              </a>
            ) : (
              <span className={classNames(styles.explanation)}>
                {pattern.explanation}
              </span>
            )}
          </div>
        ))}
      </div>

      {infoType === 'Quantifiers' && (
        <div className={classNames(styles.notes)}>
          <p>
            Символ <span className={classNames(styles.symbol)}>?</span> может
            включать "ленивый" режим поиска. Указывается после квантификатора и
            применяется только к нему, например{' '}
            <span className={classNames(styles.symbol)}>+?</span>
          </p>
          <p>
            "Ленивый" режим останавливает поиск на минимальном доступном
            значении квантификатора
          </p>
        </div>
      )}
    </div>
  )
}

export default InfoSection
