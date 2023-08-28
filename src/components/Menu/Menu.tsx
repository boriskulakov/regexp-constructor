import styles from './css/menu.module.css'
import classNames from 'classnames'

import { useState } from 'react'
import { Tabs } from '@/types/types'

import InfoSection from './InfoSection/InfoSection'

interface Tab {
  title: string
  type: Tabs
}

const TABS: Tab[] = [
  {
    title: 'Символы и якоря',
    type: 'Symbols',
  },
  {
    title: 'Группы и наборы',
    type: 'Groups',
  },
  {
    title: 'Квантификаторы',
    type: 'Quantifiers',
  },
  {
    title: 'Флаги',
    type: 'Flags',
  },
  {
    title: 'RegExp методы',
    type: 'Methods',
  },
]

function Menu() {
  const [tabOpen, setTabOpen] = useState<Tabs | null>(null)
  const switchTabs = (tabName: Tabs) => {
    tabName === tabOpen ? setTabOpen(null) : setTabOpen(tabName)
  }
  return (
    <div className={classNames(styles.container)} tabIndex={0}>
      <div className={classNames(styles.tabs, tabOpen)}>
        {tabOpen && <InfoSection infoType={tabOpen} />}
        {TABS.map((tab) => (
          <div
            key={tab.type}
            className={classNames(styles.tab)}
            onClick={() => switchTabs(tab.type)}
          >
            {tab.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Menu
