const qvtContractAddress = '0xfDb469153D7F1e1943Fa38435bF22ec658bCAfa7'

// eslint-disable-next-line no-extend-native
Array.prototype.shuffle = function() {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[this[i], this[j]] = [this[j], this[i]]
  }
  return this
}

export const requestPower = async user => {
  const result = await window.web3.eth.sendTransaction({
    from: user,
    to: qvtContractAddress,
    data: '0x96560e24',
  })
  console.log(result)
}

export const deposit = async (pid, user) => {
  const result = await window.web3.eth.sendTransaction({
    from: user,
    to: qvtContractAddress,
    data: '0x96560e24',
  })
  console.log(result)
}

export const withdraw = async (pid, amount, user) => {
  const result = await window.web3.eth.sendTransaction({
    from: user,
    to: qvtContractAddress,
    data: '0x96560e24',
  })
  console.log(result)
}

export const propose = async (link, description, user) => {
  const result = await window.web3.eth.sendTransaction({
    from: user,
    to: qvtContractAddress,
    data: '0x96560e24',
  })
  console.log(result)
}

export const updateProposal = async (link, description, user) => {
  const result = await window.web3.eth.sendTransaction({
    from: user,
    to: qvtContractAddress,
    data: '0x96560e24',
  })
  console.log(result)
}
