import axios from 'axios'

const api = axios.create({
  baseURL: 'http://128.199.233.55:5000',
})

// eslint-disable-next-line no-extend-native
Array.prototype.shuffle = function() {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[this[i], this[j]] = [this[j], this[i]]
  }
  return this
}

const sleep = m => new Promise(r => setTimeout(r, m))

export const removeQA = async (adminKey, qId) => {
  try {
    const { data } = await api.delete(`questions/${qId}`, {
      headers: { adminKey },
    })
    return data.result
  } catch (err) {
    console.error(err)
    return err.response.data.message
  }
}

export const getStartTime = () => {
  const stTmp = parseInt(JSON.parse(localStorage.getItem('startTime')))
  if (Number.isInteger(stTmp)) {
    return stTmp
  }
  return 0
}

export const getStatus = async () => {
  try {
    const {
      data: {
        result: { gameState },
      },
    } = await api.get('status')
    console.log(gameState)
    return gameState
  } catch (err) {
    console.error(err)
  }
}

export const verifyKey = async key => {
  try {
    const { data } = await api.get(`verify/${key}`)
    return data.result
  } catch (err) {
    console.error(err)
    return err.response.data.message
  }
}

export const addQA = async (adminKey, question) => {
  try {
    const { data } = await api.post(
      'questions',
      { question, answer: ['set this answer'] },
      { headers: { adminKey } },
    )
    return data.result
  } catch (err) {
    console.error(err)
    return err.response.data.message
  }
}

export const setQA = async (adminKey, qId, q, a) => {
  try {
    const { data } = await api.patch(
      'questions',
      { qId, question: q, answer: a },
      { headers: { adminKey } },
    )
    return data.result
  } catch (err) {
    console.error(err)
    return err.response.data.message
  }
}

export const getQs = async () => {
  try {
    const { data } = await api.get('questions')
    return data.result.shuffle()
  } catch (err) {
    console.error(err)
  }
}

export const getQAs = async adminKey => {
  try {
    const { data } = await api.get('questionswithanswer', {
      headers: { adminKey },
    })
    return data.result.map(x => ({
      qId: x.qId,
      q: x.question,
      a: x.answer,
    }))
  } catch (err) {
    console.error(err)
  }
}

export const getUsers = async adminKey => {
  try {
    const { data } = await api.get('user', { headers: { adminKey } })
    return data.result
  } catch (err) {
    return err.response.data.message
  }
}

export const addUser = async (adminKey, userName) => {
  try {
    const { data } = await api.post(
      'user',
      {
        newUser: userName,
      },
      { headers: { adminKey } },
    )
    return data.result
  } catch (err) {
    console.error(err)
    return err.response.data.message
  }
}

export const updateUser = async (adminKey, oldUserName, newUserName) => {
  try {
    const { data } = await api.patch(
      'user',
      {
        newUser: oldUserName,
        oldUser: newUserName,
      },
      { headers: { adminKey } },
    )
    return data.result
  } catch (err) {
    console.error(err)
    return err.response.data.message
  }
}

export const start = async adminKey => {
  await sleep(1000)
  await api.post('start', {}, { headers: { adminKey } })
  localStorage.setItem('startTime', Date.now().toString())
}

export const stop = async adminKey => {
  await sleep(1000)
  await api.post('pause', {}, { headers: { adminKey } })
  localStorage.setItem('startTime', '0')
}

export const answer = async (qId, ans, player) => {
  try {
    const { data } = await api.post('answer', {
      qId,
      answer: ans.split(',').map(x => x.trim()),
      user: player,
    })
    return data.result
  } catch (err) {
    return err.response.data.message
  }
}

export const clearAnswer = async adminKey => {
  try {
    const { data } = await api.post('reset', {}, { headers: { adminKey } })
    alert(data.result)
    return data.result
  } catch (err) {
    return err.response.data.message
  }
}
