import React, { useState, useEffect } from 'react'
import { Flex } from 'rebass'
import Loadable from 'react-loadable'
import Loading from '../components/Loading'
import colors from '../ui/colors'
import { getQs, verifyKey } from '../api/api'

const QuestionTab = Loadable({
  loader: () => import('../components/QuestionTab'),
  loading: () => (
    <Flex justifyContent="center" alignItems="center" flex={1}>
      <Loading />
    </Flex>
  ),
})

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

export default ({ match }) => {
  const [questions, setQuestions] = useState([])

  const [isKeyShowed, setIsKeyShowed] = useState(false)
  const [player, setPlayer] = useState(null)
  const [salt, setSalt] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null)
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    setPlayer(match.path.slice(1))
    ;(async () => setQuestions(await getQs()))()
  }, [])

  const onVerifyKey = async () => {
    setWaiting(true)
    setVerificationResult(await verifyKey(player + '_' + salt))
    setWaiting(false)
  }

  return (
    <Flex flexDirection="column" width={1} flex={1}>
      <Flex
        p="20px"
        width={1}
        alignItems="center"
        bg={colors.lightSteel}
        style={{
          zIndex: '1',
          height: '60px',
          position: 'fixed',
          boxShadow: `0 7px 9px 0 grey`,
        }}
      >
        <Flex
          flex={1}
          style={{ height: '35px', position: 'relative' }}
          alignItems="center"
        >
          <Input
            type={isKeyShowed ? 'text' : 'password'}
            style={{ width: '100%' }}
            onChange={({ target }) => setSalt(target.value)}
          />
          <Button
            style={{ position: 'absolute', right: '10px', padding: '5px 10px' }}
            onClick={() => setIsKeyShowed(!isKeyShowed)}
          >
            {isKeyShowed ? (
              <i className="fas fa-eye-slash" />
            ) : (
              <i className="fas fa-eye" />
            )}
          </Button>
        </Flex>
        <Flex
          flex={1}
          style={{ height: '35px', position: 'relative' }}
          justifyContent="flex-end"
        >
          {!waiting && verificationResult && (
            <Flex
              bg="gray"
              style={{ width: '75px', borderRadius: '4px' }}
              justifyContent="center"
              alignItems="center"
            >
              {verificationResult}
            </Flex>
          )}
          {waiting && (
            <Flex style={{ position: 'absolute', top: '-40px', right: '64px' }}>
              <Loading size="128px" />
            </Flex>
          )}
          <Flex ml="20px">
            <Button onClick={onVerifyKey}>verify</Button>
          </Flex>
        </Flex>
      </Flex>
      <Flex mt="60px" px="20px" flexDirection="column" width={1}>
        {questions.map((each, i) => (
          <QuestionTab
            player={player + '_' + salt}
            question={each.question}
            qId={each.qId}
            key={i}
          />
        ))}
      </Flex>
    </Flex>
  )
}
