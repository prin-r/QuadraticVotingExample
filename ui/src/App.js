import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Loadable from 'react-loadable'
import Loading from './components/Loading'
import colors from './ui/colors'

const NotFoundPage = Loadable({
  loader: () => import('./pages/404'),
  loading: () => <Loading />,
})

const Nav = Loadable({
  loader: () => import('./components/Nav'),
  loading: () => <Loading />,
})

const Dashboard = Loadable({
  loader: () => import('./pages/Dashboard'),
  loading: () => <Loading />,
})

const Faucet = Loadable({
  loader: () => import('./pages/Faucet'),
  loading: () => <Loading />,
})

const PageContainer = styled(Flex).attrs({
  flexDirection: 'column',
  alignItems: 'center',
})`
  margin: -10px;
  min-height: 100vh;
  background-color: ${colors.bg};
  font-family: Helvetica;
`

export default () => (
  <PageContainer>
    <Nav />
    <Router>
      <Switch>
        <Route exact path="/faucet" component={Faucet} />
        <Route exact path="/" component={Dashboard} />
        <Route path="/" component={NotFoundPage} />
      </Switch>
    </Router>
  </PageContainer>
)
