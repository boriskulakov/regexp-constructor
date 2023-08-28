import './css/App.css'

import RegexpConstructor from './components/RegexpConstructor/RegexpConstructor'
import Menu from './components/Menu/Menu'

function App() {
  return (
    <div className="page">
      <h1 className="title">
        Regexp Constructor
        <a
          href="https://github.com/boriskulakov/regexp-constructor"
          target="blank"
          className="git_link"
        ></a>
      </h1>
      <div className="main">
        <RegexpConstructor />
      </div>
      <Menu />
      <div id="portal"></div>
    </div>
  )
}

export default App
