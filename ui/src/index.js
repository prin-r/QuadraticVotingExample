import React from 'react'
import ReactDOM from 'react-dom'
import Loadable from 'react-loadable'
import Loading from './components/Loading'
import * as serviceWorker from './serviceWorker'

const App = Loadable({
  loader: () => import('./App'),
  loading: () => <Loading />,
})

ReactDOM.render(<App />, document.getElementById('root'))

serviceWorker.unregister()
