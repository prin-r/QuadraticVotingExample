import React, { useState } from 'react'
import { Flex, Text } from 'rebass'
import colors from '../ui/colors'
import { answer } from '../api/api'
import Loadable from 'react-loadable'
import Loading from './Loading'

const Input = Loadable({
  loader: () => import('./Input'),
  loading: () => (
    <Flex justifyContent="center" alignItems="center" flex={1}>
      <Loading />
    </Flex>
  ),
})

const Button = Loadable({
  loader: () => import('./Button'),
  loading: () => (
    <Flex justifyContent="center" alignItems="center" flex={1}>
      <Loading />
    </Flex>
  ),
})

const Card = Loadable({
  loader: () => import('./Card'),
  loading: () => (
    <Flex justifyContent="center" alignItems="center" flex={1}>
      <Loading />
    </Flex>
  ),
})

export default ({ question, player, qId }) => {
  const [waiting, setWaiting] = useState(false)
  const [result, setResult] = useState(false)
  const [ans, setAns] = useState('')

  const submit = async () => {
    ;(async () => setWaiting(true))()
    setResult(await answer(qId, ans, player))
    ;(async () => setWaiting(false))()
    setAns('')
  }

  return (
    <Card>
      <Flex mb="30px">
        <Text color={colors.darkGreen}>{`${question}`}</Text>
      </Flex>
      <Input value={ans} onChange={({ target }) => setAns(target.value)} />
      <Flex mt="10px" alignItems="center" style={{ height: '35px' }}>
        <Flex style={{ height: '35px' }}>
          <Button bg={colors.oliveGreen} onClick={submit}>
            submit answer
          </Button>
        </Flex>
        {waiting && (
          <Flex flex={1} style={{ position: 'absolute', left: '50%' }}>
            <Loading size="128px" />
          </Flex>
        )}
        {!waiting && result && (
          <Flex
            flex={1}
            style={{
              height: '35px',
              borderRadius: '4px',
              border: `1px solid ${
                result === 'wrong' ? colors.brick : colors.leaves
              }`,
            }}
            bg={
              result === 'wrong'
                ? 'rgba(174, 81, 31, 0.5)'
                : 'rgba(80, 109, 47, 0.5)'
            }
            ml="20px"
            justifyContent="center"
            alignItems="center"
          >
            <Text color={result === 'wrong' ? colors.brick : colors.leaves}>
              {result}
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  )
}
