import React, { useState, useEffect } from 'react'
import { Flex, Text } from 'rebass'
import colors from '../ui/colors'
import { updateUser } from '../api/api'
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

export default props => {
  const [waiting, setWaiting] = useState(false)
  const [name, setName] = useState('')
  const [point, setPoint] = useState('')
  const [result, setResult] = useState(false)
  const [hides, setHides] = useState([true, true, true])

  useEffect(() => {
    setName(props.user)
    setPoint(props.point)
    console.log(props)
  }, [])

  const submit = async () => {
    setWaiting(true)
    setResult(await updateUser(props.adminKey, name, props.user))
    setWaiting(false)
  }

  return (
    <Card flexDirection="row">
      <Flex
        flexDirection="row"
        alignItems="center"
        style={{ position: 'relative' }}
        mt="10px"
      >
        <Flex style={{ width: '50px' }} justifyContent="flex-end">
          name
        </Flex>
        <Input
          value={name}
          type={hides[0] ? 'password' : 'text'}
          onChange={({ target }) => setName(target.value)}
        />
        <Button
          onClick={() => setHides([!hides[0], hides[1], hides[2]])}
          style={{ position: 'absolute', right: '5px', padding: '5px' }}
        >
          {hides[0] ? (
            <i className="fas fa-eye-slash" />
          ) : (
            <i className="fas fa-eye" />
          )}
        </Button>
      </Flex>
      {/* <Flex
        flexDirection="row"
        alignItems="center"
        style={{ position: 'relative' }}
        mt="10px"
      >
        <Flex style={{ width: '50px' }} justifyContent="flex-end">
          key
        </Flex>
        <Input
          value={key}
          type={hides[1] ? 'password' : 'text'}
          onChange={({ target }) => setKey(target.value)}
        />
        <Button
          onClick={() => setHides([hides[0], !hides[1], hides[2]])}
          style={{ position: 'absolute', right: '5px', padding: '5px' }}
        >
          {hides[1] ? (
            <i className="fas fa-eye-slash" />
          ) : (
            <i className="fas fa-eye" />
          )}
        </Button>
      </Flex> */}
      <Flex
        flexDirection="row"
        alignItems="center"
        style={{ position: 'relative' }}
        mt="10px"
      >
        <Flex style={{ width: '50px' }} justifyContent="flex-end">
          rp
        </Flex>
        <Input
          value={point}
          type={hides[2] ? 'password' : 'text'}
          onChange={({ target }) => setPoint(target.value)}
        />
        <Button
          onClick={() => setHides([hides[0], hides[1], !hides[2]])}
          style={{ position: 'absolute', right: '5px', padding: '5px' }}
        >
          {hides[2] ? (
            <i className="fas fa-eye-slash" />
          ) : (
            <i className="fas fa-eye" />
          )}
        </Button>
      </Flex>
      <Flex
        alignItems="center"
        justifyContent="center"
        width={1}
        flexDirection="row"
        mt="10px"
        pl="10px"
      >
        <Flex flex={1}>
          <Button
            bg={colors.oliveGreen}
            onClick={submit}
            style={{ width: '100px', minHeight: '35px' }}
          >
            update
          </Button>
        </Flex>
        {waiting && (
          <Flex flex={1} style={{ position: 'absolute', right: '0px' }}>
            <Loading size="128px" />
          </Flex>
        )}
        {!waiting && result && (
          <Flex
            flex={1}
            style={{
              minWidth: '100px',
              height: '35px',
              borderRadius: '4px',
              border: `1px solid ${
                result === 'fail' ? colors.brick : colors.leaves
              }`,
            }}
            bg={
              result === 'fail'
                ? 'rgba(174, 81, 31, 0.5)'
                : 'rgba(80, 109, 47, 0.5)'
            }
            ml="20px"
            justifyContent="center"
            alignItems="center"
          >
            <Text color={result === 'fail' ? colors.brick : colors.leaves}>
              {result}
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  )
}
