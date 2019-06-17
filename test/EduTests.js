// import { getLastBlockTimestamp } from './utils.mjs'; // ES6 imports seem still not to be a thing in nodejs
//const utils = require('./utils');

const Lottery = artifacts.require('EduLottery');

const BN = web3.utils.BN;

//const should = require('should'); // eslint-disable-line

async function getTotalBalances(players) {
  var result = new web3.utils.BN();//new BigNumber.BigNumber();
  players.forEach(async player => {
    const balance = await web3.eth.getBalance(player);
    result = result.add(new web3.utils.BN(balance));
  });
  return result;
}

async function AddSpentGasCosts(bigNumber, transactionReceipt) {

  var transaction = await web3.eth.getTransaction(transactionReceipt.transactionHash);
  const cumulativeGasUsed = new BN(transactionReceipt.cumulativeGasUsed);
  const gasPrice = new BN(transaction.gasPrice);

  return bigNumber.add(cumulativeGasUsed.mul(gasPrice));
}

async function printBalance(account) {

  console.log('Balance: ' + await web3.eth.getBalance(account));
}


contract('EduLottery', (accounts) => {
  console.log(`Accounts: ${accounts}`);

  // initial setup
  const lotterySetupAccount = accounts[0];
  const player1 = accounts[1];
  const player2 = accounts[2];
  const player3 = accounts[3];
  const player4 = accounts[4];
  const player5 = accounts[5];

  players = [player1,player2,player3,player4,player5];

  let initialBalance;

  it('calculate initial Balance', async()=> {
    initialBalance = await getTotalBalances(players);
    console.log('initialBalance: ' + initialBalance);
  })

  let lotteryATS1_2_3;
  const oneATS = web3.utils.toWei("1");

  it('deploy lottery lotteryATS1_2_3 1 ATS bid, 2 blocks runtime, 3 blocks pause', async () => {
    assert(typeof contract.payout === "undefined"); // internal function
    lotteryATS1_2_3 = await Lottery.new(oneATS, 2, 3, {from: lotterySetupAccount});
    //console.log('lottery:' + lotteryATS1_2_3);
  });

  it('check lottery lotteryATS1_2_3 values', async() => {
    // console.log('lottery');
    // console.log(lotteryATS1_2_3);
    // console.log('bidAmount');
    // console.log(lotteryATS1_2_3.bidAmount());
    const bidAmountvalue = await lotteryATS1_2_3.bidAmount.call();
    assert.equal(bidAmountvalue,oneATS);
    assert.equal(await lotteryATS1_2_3.roundRuntimeInBlocks.call(), 2);
    assert.equal(await lotteryATS1_2_3.minPauseRuntimeInBlocks.call(), 3);
  });

  it('player balance dit not change until now', async()=> {
    let currentBalance = await getTotalBalances(players);
    assert.isOk(currentBalance.eq(initialBalance));
  })

  var player1_initialBalance;
  var player1_gasCosts = new BN();

  var player2_initialBalance;
  var player2_gasCosts = new BN();

  it('player1 can pid 2 (= lotteryRuntime) times, Lottery Balance is 2', async()=> {

    //await printBalance(player1);
    //console.log('actionBlock: ' + (await lotteryATS1_2_3.actionBlock.call()));

    player1_initialBalance = new BN(await web3.eth.getBalance(player1));
    player2_initialBalance = new BN(await web3.eth.getBalance(player2));
    //var gasCosts = new BN();

    var receipt1 = await web3.eth.sendTransaction({
      from: player1,
      to: lotteryATS1_2_3.address,
      value: oneATS
    })

    assert.equal(receipt1.status, '0x1', 'send must be successful');
    player1_gasCosts = await AddSpentGasCosts(player1_gasCosts, receipt1);

    //await printBalance(player1);

    var receipt2 = await web3.eth.sendTransaction({
      from: player1,
      to: lotteryATS1_2_3.address,
      value: oneATS
    })


    assert.equal(receipt2.status, '0x1', 'send must be successful');
    player1_gasCosts = await AddSpentGasCosts(player1_gasCosts, receipt2);


    //await printBalance(player1);

    //the lottery got called 2 times now (official runtime)

    var lotteryBalance = await web3.eth.getBalance(lotteryATS1_2_3.address);
    //console.log('lotteryBalance: ' + lotteryBalance);

    assert.equal(lotteryBalance, web3.utils.toWei('2'), 'Lottery Balance should be exactly 2 ATS');

  })


  it('trigger the payout with spending a third time!', async () => {
    //console.log('actionBlock: - trigger the payout with spending a third time! ' + (await lotteryATS1_2_3.actionBlock.call()));

    var receipt1 = await web3.eth.sendTransaction({
      from: player2,
      to: lotteryATS1_2_3.address,
      value: oneATS
    })

    player2_gasCosts = await AddSpentGasCosts(player2_gasCosts, receipt1);
    assert.equal(await web3.eth.getBalance(lotteryATS1_2_3.address), web3.utils.toWei('0'), 'Lottery Balance should be exactly 0 ATS');

  })

  it('verifying expected balances', async () => {
    //console.log('actionBlock: verifying expected balances:' + (await lotteryATS1_2_3.actionBlock.call()));

    const player1CurrentBalance = new BN(await  web3.eth.getBalance(player1));

    const isEqual = player1CurrentBalance.add(player1_gasCosts).eq(player1_initialBalance);

    if (!isEqual) {
      console.log('player1 current balance: ', player1CurrentBalance.toString());
      console.log('player1 initial balance: ', player1_initialBalance.toString());
      assert.isOk(isEqual, 'player1 should have gotten his money back.');
    }


    const player2CurrentBalance = new BN(await  web3.eth.getBalance(player2));

    const isEqual2 = player2CurrentBalance.add(player2_gasCosts).eq(player2_initialBalance);

    if (!isEqual2) {
      console.log('player2 current balance: ', player2CurrentBalance.toString());
      console.log('player2 initial balance: ', player2_initialBalance.toString());
      assert.isOk(isEqual2, 'player2 should have gotten his money back.');
    }
    //console.log('player2 current balance: ', player2CurrentBalance);

    assert.equal(await web3.eth.getBalance(lotteryATS1_2_3.address), web3.utils.toWei('0'), 'Lottery should be empty now!' );

    //player2_initialBalance
  });

  it('lottery should now be in pause mode', async () => {

    //console.log('actionBlock: lottery should now be in pause mode: ' + (await lotteryATS1_2_3.actionBlock.call()));

    var lotteryIsPauseException;
    var lotteryIsPaused = false;

    try {
      await web3.eth.sendTransaction({
        from: player2,
        to: lotteryATS1_2_3.address,
        value: oneATS
      })
    } catch (err) {
      lotteryIsPauseException = err;
      lotteryIsPaused = true;
    }

    assert.isOk(lotteryIsPaused, 'Lottery should be paused now!');

    lotteryIsPaused = false;
    try {
      await web3.eth.sendTransaction({
        from: player2,
        to: lotteryATS1_2_3.address,
        value: oneATS
      })
    } catch (err) {
      lotteryIsPauseException = err;
      lotteryIsPaused = true;
    }

    assert.isOk(lotteryIsPaused, 'Lottery should be paused now!');

    lotteryIsPaused = false;
    try {
      await web3.eth.sendTransaction({
        from: player2,
        to: lotteryATS1_2_3.address,
        value: oneATS
      })
    } catch (err) {
      lotteryIsPauseException = err;
      lotteryIsPaused = true;
    }

    assert.isOk(lotteryIsPaused, 'Lottery should be paused now!');
  });

  it('lotteryATS1_2_3 should be available again', async () => {

    var receipt = await web3.eth.sendTransaction({
      from: player2,
      to: lotteryATS1_2_3.address,
      value: oneATS
    })

    assert.equal(receipt.status, '0x1', 'Lottery shoul have started again!');
    //printBalance(lotteryATS1_2_3.address);

  });

  it('lotteryATS1_2_3 should not accept wrong bid value', async () => {

    let hasError = false;
    try {
      var receipt = await web3.eth.sendTransaction({
        from: player2,
        to: lotteryATS1_2_3.address,
        value: web3.utils.toWei('2.5')
      })
    } catch (err) {
      hasError = true;
    }

    assert.isOk(hasError, 'Expected Error on sending wrong amount.');
    //printBalance(lotteryATS1_2_3.address);
  });

  var lottery_dynamic;
  var currentDynamicLotteryValue;

  it('deploying dynamic lottery', async () => {
    lottery_dynamic =  await Lottery.new(0, 5, 2, {from: lotterySetupAccount});
  });

  it('sending #some# amount to dynamic lottery', async () => {

    currentDynamicLotteryValue = web3.utils.toWei('2.5');

    let receipt = await web3.eth.sendTransaction({
      from: player2,
      to: lottery_dynamic.address,
      value: currentDynamicLotteryValue,
      gas: '150000'
    })

    assert.equal(receipt.status, '0x1', 'Lottery should have accepted 2.5 ATS!');
  });

  it('sending a wrong amount to dynamic lottery', async () => {

    var transactionWasFailure = false;
    try {
      receipt = await web3.eth.sendTransaction({
        from: player2,
        to: lottery_dynamic.address,
        value:  web3.utils.toWei('2.45'),
        gas: '100000'
      })
    } catch (err) {
      transactionWasFailure = true;
    }

    assert.isOk(transactionWasFailure, 'Lottery should reject wrong dynamic value - the lottery was already initialized!');
  });

  it('sending correct dynamic amount to dynamic lottery', async () => {

    let receipt = await web3.eth.sendTransaction({
      from: player2,
      to: lottery_dynamic.address,
      value: currentDynamicLotteryValue,
      gas: '150000'
    })

    assert.equal(receipt.status, '0x1', 'Lottery should have accepted 2.5 ATS!');

  });

  it('validating balance of dynamic lottery', async () => {
    assert.equal(await web3.eth.getBalance(lottery_dynamic.address), web3.utils.toWei('5'));
  });

  it('triggering payout with a 0 ETH transaction of lotteryATS1_2_3', async () => {

    //printBalance(lotteryATS1_2_3.address);

    assert.equal(await web3.eth.getBalance(lotteryATS1_2_3.address), web3.utils.toWei('1'), 'unexpected balance for lottery lotteryATS1_2_3');

    let receipt = await web3.eth.sendTransaction({
      from: player2,
      to: lotteryATS1_2_3.address,
      value: web3.utils.toWei('0')
    })

    assert.equal(receipt.status, '0x1', 'lotteryATS1_2_3 should have accepted 0 ATS payout call!');
    assert.equal(await web3.eth.getBalance(lotteryATS1_2_3.address), web3.utils.toWei('0'), 'unexpected balance for lottery lotteryATS1_2_3 after payout');

  });

  it('lotteryATS1_2_3 should be paused again', async () => {

    //printBalance(lotteryATS1_2_3.address);
    var lotteryIsPaused = false;

    try {
      await web3.eth.sendTransaction({
        from: player2,
        to: lotteryATS1_2_3.address,
        value: web3.utils.toWei('0')
      })
    } catch (error) {
      lotteryIsPaused = true;
    }

    assert.isOk(lotteryIsPaused, 'Lottery should be paused now!');

  });


  async function verifyLotteryShouldBePaused(lottery) {

    var lotteryIsPaused = false;
    try {
      await web3.eth.sendTransaction({
        from: player2,
        to: lottery.address,
        value: web3.utils.toWei('0')
      })
    } catch (error) {
      lotteryIsPaused = true;
    }

    assert.isOk(lotteryIsPaused, 'Lottery should be paused now!');
    assert.equal(await web3.eth.getBalance(lottery.address), '0', 'lottery in paused state should be empty.')
  }

  async function verifyDynamicLotteryShouldBePaused() {
    return await verifyLotteryShouldBePaused(lottery_dynamic);
  }

  async function sendToLottery(lottery, amount) {
    let receipt = await web3.eth.sendTransaction({
      from: player2,
      to: lottery.address,
      value: amount,
      gas: '120000'
    })
    assert.equal(receipt.status, '0x1', 'lottery should have accepted transaction!');
  }

  async function verifyPausedEvent(lottery) {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log(Lottery.events);
    console.log('blockNumber:' + blockNumber);
    var paused = await Lottery.events.PausedEvent({fromBlock: blockNumber});
  }

  it('dynamic lottery should payout with 0 transaction', async () => {
    let receipt = await web3.eth.sendTransaction({
      from: player2,
      to:  lottery_dynamic.address,
      value: '0'
    })

    assert.equal(receipt.status, '0x1', 'lottery_dynamic should have accepted another bid!');
    assert.equal(await web3.eth.getBalance(lottery_dynamic.address), '0', 'lottery should have paid out.')
  })

  it ('dynamic lottery should be paused now for 2 blocks', async() => {
    await verifyDynamicLotteryShouldBePaused();
    await verifyDynamicLotteryShouldBePaused();
  })


  it ('dynamic lottery should accept other amount now.', async() => {
    var dynAmount = web3.utils.toWei('1.1');
    await sendToLottery(lottery_dynamic, dynAmount);
    await sendToLottery(lottery_dynamic, dynAmount);
    await sendToLottery(lottery_dynamic, dynAmount);
    await sendToLottery(lottery_dynamic, dynAmount);
    await sendToLottery(lottery_dynamic, dynAmount);

    assert.equal( await web3.eth.getBalance(lottery_dynamic.address), web3.utils.toWei('5.5'), 'Lottery should be filled up now.')

  })


  it ('trigger second payout of dynamic lottery ', async() => {
    await sendToLottery(lottery_dynamic, '0');
    assert.equal( await web3.eth.getBalance(lottery_dynamic.address), web3.utils.toWei('0'), 'Lottery should be empty now.')
  })

  var lottery_nonstop;
  var lottery_nonstopAmount;

  it ('creating a lottery that does not have a pause => nonstop-lottery', async() => {
    lottery_nonstopAmount = web3.utils.toWei('2')
    lottery_nonstop = await Lottery.new( lottery_nonstopAmount, '3','0',  {from: lotterySetupAccount});
  })

  it ('playing one round in the nonstop lottery', async() => {
    await sendToLottery(lottery_nonstop, lottery_nonstopAmount);
    await sendToLottery(lottery_nonstop, lottery_nonstopAmount);
    await sendToLottery(lottery_nonstop, lottery_nonstopAmount);
    assert.equal( await web3.eth.getBalance(lottery_nonstop.address), web3.utils.toWei('6'), 'Lottery should have 6 ATS now.')
    await sendToLottery(lottery_nonstop, web3.utils.toWei('0'));
    assert.equal( await web3.eth.getBalance(lottery_nonstop.address), web3.utils.toWei('0'), 'Lottery should be empty now.')
  })


  it ('playing another round in the nonstop lottery', async() => {
    await sendToLottery(lottery_nonstop, lottery_nonstopAmount);
    await sendToLottery(lottery_nonstop, lottery_nonstopAmount);
    await sendToLottery(lottery_nonstop, lottery_nonstopAmount);
    assert.equal( await web3.eth.getBalance(lottery_nonstop.address), web3.utils.toWei('6'), 'Lottery should have 6 ATS now.')
    await sendToLottery(lottery_nonstop, web3.utils.toWei('0'));
    assert.equal( await web3.eth.getBalance(lottery_nonstop.address), web3.utils.toWei('0'), 'Lottery should be empty now.')
  })

  // it('verify events', async () => {

  //   await verifyPausedEvent(lottery_dynamic);

  // });
});
