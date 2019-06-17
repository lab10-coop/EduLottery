# About

This is a minimal lottery smart contract for education and demonstration purposes.
All interaction with the contract takes place via the [fallback function](https://solidity.readthedocs.io/en/latest/contracts.html#fallback-function). This allows generic wallet applications to interact with it via simple _send transactions_, instead of requiring a dedicated Dapp.

# Release

A set of contracts has been deployed on the [ARTIS Blockchain](https://www.artis.eco)
The runtime of those contracts is 60 Blocks (~ 5 Minutes). 
After a payout the Lottery Pauses 30 Blocks (~ 3 Minutes).  

| ATS | Address                                    |
|-----|--------------------------------------------|
| 1   | [0xF248b7Ab2A2206BD136FE7c730e3C94F91f26007](https://explorer.sigma1.artis.network/address/0xf248b7ab2a2206bd136fe7c730e3c94f91f26007/transactions) |
| 5   | [0xeA871C78b34914adeb2A0eD61942810c46A514d7](https://explorer.sigma1.artis.network/address/0xeA871C78b34914adeb2A0eD61942810c46A514d7/transactions) |
| 10  | [0x8C4402EB9994Da1952f935Eb4eFc3A4424aDF4E1](https://explorer.sigma1.artis.network/address/0x8C4402EB9994Da1952f935Eb4eFc3A4424aDF4E1/transactions) |
| Any | [0x28D7Be522eAebFeC36C1ec201B5C5E58e420B565](https://explorer.sigma1.artis.network/address/0x28D7Be522eAebFeC36C1ec201B5C5E58e420B565/transactions) |

The bid amount of the "Any" Lottery is determined by the first valid transaction within a round.

# Build

This is a [truffle project](https://truffleframework.com/docs/truffle/overview).  
After cloning the repo, run `npm ci` in order to get the npm dependencies. Nodejs v10+ required.  
Now you should have the truffle binary installed at `node_modules/.bin/truffle` and can start your exploration.

A good way to explore is to start a truffle console with `node_modules/.bin/truffle develop`.  
Now you have a REPL which offers you the API of [web3.js](https://web3js.readthedocs.io/en/1.0/index.html) combined with the truffle API and its convenient contract wrappers. E.g. in order to deploy and query an instance of the lottery contract, you could now have a session like this:
```
truffle(develop)>  var roundRuntimeInBlocks='5';
undefined
truffle(develop)> var minPauseRuntimeInBlocks='3'; //lottery should go into a pause state after payout for a minimum of 3 blocks
undefined
truffle(develop)> var bidAmount=web3.utils.toWei('1'); //the bid amount for this lottery should be 1.
undefined
truffle(develop)> bidAmount // the amount in Wei is 1E18.
'1000000000000000000'
truffle(develop)> var lottery = await EduLottery.new(bidAmount, roundRuntimeInBlocks, minPauseRuntimeInBlocks)
undefined
truffle(develop)> accs = await web3.eth.getAccounts()
undefined
truffle(develop)> tx = await web3.eth.sendTransaction({ from: accs[0], to: lottery.address, value: bidAmount })
undefined
truffle(develop)> tx = await web3.eth.sendTransaction({ from: accs[1], to: lottery.address, value: bidAmount })
undefined
truffle(develop)> tx = await web3.eth.sendTransaction({ from: accs[2], to: lottery.address, value: bidAmount })
undefined
truffle(develop)> tx = await web3.eth.sendTransaction({ from: accs[3], to: lottery.address, value: bidAmount })
undefined
truffle(develop)> tx = await web3.eth.sendTransaction({ from: accs[4], to: lottery.address, value: bidAmount })
undefined
truffle(develop)> tx = await web3.eth.sendTransaction({ from: accs[5], to: lottery.address, value: bidAmount })
undefined
truffle(develop)> await web3.eth.getBalance(accs[0]) // lets check the balances of each account for now.
'98999902358000000000'
truffle(develop)> await web3.eth.getBalance(accs[1]) // account 1 is the winner in this case
'103987308546000000000'
truffle(develop)> await web3.eth.getBalance(accs[2]) 
'98999902358000000000'
truffle(develop)> await web3.eth.getBalance(accs[3])
'98999902358000000000'
truffle(develop)> await web3.eth.getBalance(accs[4])
'98999902358000000000'
truffle(develop)> await web3.eth.getBalance(accs[5]) // account 5 dit not even participate in the lottery, he just triggered the payout, and payed the transaction fees.
'99999924472000000000'
```

Open questions? -> [Gitter](https://gitter.im/lab10-collective/Lobby)
