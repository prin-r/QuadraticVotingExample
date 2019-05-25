import React, { useState, useEffect } from 'react'
import { Flex, Text } from 'rebass'
import colors from '../ui/colors'
import Loadable from 'react-loadable'
import Loading from './Loading'
import Web3 from 'web3'
import BN from '../utils/bignum'

const Logo = Loadable({
  loader: () => import('../images/logo'),
  loading: () => <Loading />,
})

const Wallet = Loadable({
  loader: () => import('../images/wallet'),
  loading: () => <Loading />,
})

export default props => {
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState(new BN(0))

  const opad = x => (x.length < 64 ? opad('0' + x) : x)

  useEffect(() => {
    window.web3 = new Web3(window.web3.currentProvider)
    ;(async () => {
      const addr = (await window.web3.eth.getAccounts())[0]
      setAccount(addr)
      const balanceQVT = await window.web3.eth.call({
        to: '0xC1b11E986F34323C65bf68bb4A1F706639A4a73F',
        data: '0x70a08231' + opad(addr.slice(2)),
      })
      setBalance(new BN(balanceQVT.slice(2), 16))
    })()
  }, [])

  return (
    <Flex
      flexDirection="row"
      width={1}
      style={{ height: '60px' }}
      bg={colors.dim}
      px={[0, '10%']}
    >
      <Flex flex={1}>
        <Logo width="60" height="60" />
      </Flex>
      <Flex
        flex={[10, 1]}
        alignItems="center"
        justifyContent="flex-end"
        style={{ position: 'relative' }}
      >
        <div
          style={{
            marginRight: '20px',
            color: colors.pale,
            whiteSpace: 'nowrap',
            width: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {account}
        </div>
        <Flex
          style={{ position: 'absolute', right: '10px' }}
          alignItems="center"
        >
          <Text>QVT </Text>
          <Text fontSize="30px" mx="10px">
            |
          </Text>
          <Flex style={{ cursor: 'pointer' }}>
            <Wallet width="30" height="30" />
          </Flex>
        </Flex>
        <Flex
          alignItems="center"
          p="10px"
          bg="white"
          style={{
            borderRadius: '4px',
            width: window.innerWidth < 640 ? '120%' : '50%',
            height: '60%',
          }}
        >
          {balance.pretty()}
        </Flex>
      </Flex>
    </Flex>
  )
}
