import React from 'react'
import { Flex, Text } from 'rebass'
import colors from '../ui/colors'
import Loadable from 'react-loadable'
import Loading from '../components/Loading'
import { requestPower } from '../api/api'

const Input = Loadable({
  loader: () => import('../components/Input'),
  loading: () => (
    <Flex justifyContent="center" alignItems="center" flex={1}>
      <Loading />
    </Flex>
  ),
})

const Button = Loadable({
  loader: () => import('../components/Button'),
  loading: () => (
    <Flex justifyContent="center" alignItems="center" flex={1}>
      <Loading />
    </Flex>
  ),
})

export default props => {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      <Flex my={4}>
        <Text color={colors.dim} fontWeight={600} fontSize={32}>
          QVT Faucet
        </Text>
      </Flex>
      <Flex
        flex={1}
        flexDirection={['column', 'row']}
        width="calc(100vw - 40px)"
        justifyContent="center"
        alignItems="center"
      >
        <Text
          mr={['0px', '20px']}
          mb={['30px', '0px']}
          color={colors.dim}
          fontSize="20px"
        >
          Your Address
        </Text>
        <Input
          style={{
            height: '35px',
            width: window.innerWidth < 640 ? '80vw' : '60vw',
          }}
        />
        <Button
          ml={['0px', '20px']}
          mt={['30px', '0px']}
          height="55px"
          onClick={requestPower}
        >
          Give Me QVT
        </Button>
      </Flex>
    </Flex>
  )
}
