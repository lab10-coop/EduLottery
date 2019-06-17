

//this deploy functions can be used within a truffle console.
//truffle develop
//or
//truffle console --network=sigma1_rpc

var lottery1 = await EduLottery.new(web3.utils.toWei('1'), '60','30')
var lottery5 = await EduLottery.new(web3.utils.toWei('5'), '60','30')
var lottery10 = await EduLottery.new(web3.utils.toWei('10'), '60','30')
var lotteryDyn = await EduLottery.new('0', '60','30')
