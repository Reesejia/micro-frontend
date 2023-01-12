import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import App from './App'

let root

function render() {
  root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

if (!window.__POWERED_BY_QIANKUN__) {
  // 独立运行
  render()
}

export async function bootstrap() {}
export async function mount(props) {
  render(props)
}
export async function unmount() {
  root && root.unmount()
}
