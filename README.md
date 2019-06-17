# About

This is a minimal lottery smart contract for education and demonstration purposes.
All interaction with the contract takes place via the [fallback function](https://solidity.readthedocs.io/en/latest/contracts.html#fallback-function). This allows generic wallet applications to interact with it via simple _send transactions_, instead of requiring a dedicated Dapp.

# Build

This is a [truffle project](https://truffleframework.com/docs/truffle/overview).  
After cloning the repo, run `npm ci` in order to get the npm dependencies. Nodejs v10+ required.  
Now you should have the truffle binary installed at `node_modules/.bin/truffle` and can start your exploration.

A good way to explore is to start a truffle console with `node_modules/.bin/truffle develop`.  
Now you have a REPL which offers you the API of [web3.js](https://web3js.readthedocs.io/en/1.0/index.html) combined with the truffle API and its convenient contract wrappers. E.g. in order to deploy and query an instance of the lottery contract, you could now have a session like this:
```
truffle(develop)> l = await EduLottery.new()
undefined
truffle(develop)> l.startBlock()
<BN: 0>
truffle(develop)> accs = await web3.eth.getAccounts()
truffle(develop)> web3.eth.sendTransaction({ from: accs[0], to: l.address, value: web3.utils.toWei("5") })
{ transactionHash:
   '0x9a413ac11dfaab553e413950031d334d6176b9cbff2d2ca084519587806a9672',
  transactionIndex: 0,
...
truffle(develop)> l.startBlock().then(web3.utils.toDecimal)
12649
```

Open questions? -> [Gitter](https://gitter.im/lab10-collective/Lobby)
