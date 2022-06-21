const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet", function () {
  it("Execute Transaction", async function () {
    // MultiSigWallet Creation with 3 owners and 2 confirmations
    const addresses = await ethers.getSigners();
    const receiverAddress = addresses[4];
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const NUM_CONFIRMATIONS_REQUIRED = 2;
    const multiSigWallet = await MultiSigWallet.deploy(
      [addresses[0].address, addresses[1].address, addresses[2].address], 
      NUM_CONFIRMATIONS_REQUIRED);


    // Check if the contract was deployed
    const owners = await multiSigWallet.getOwners();
    expect(owners[0]).to.equal(addresses[0].address);
    const numConfirmationsRequired = await multiSigWallet.numConfirmationsRequired();
    expect(numConfirmationsRequired).to.equal(NUM_CONFIRMATIONS_REQUIRED);


    // Submit Transaction for sending 1 ether to the new address
    console.log('ant : sender balance => ', (await addresses[0].getBalance()).toString());
    await multiSigWallet.submitTransaction(receiverAddress.address, "1000000000000000000", '0x', {value: "1000000000000000000"});
    console.log('ant : receiver balance => ', (await receiverAddress.getBalance()).toString());


    // Confirm Transaction with two owners
    await multiSigWallet.connect(addresses[0]).confirmTransaction(0);
    await multiSigWallet.connect(addresses[1]).confirmTransaction(0);
    await multiSigWallet.connect(addresses[1]).revokeConfirmation(0);
    await multiSigWallet.connect(addresses[2]).confirmTransaction(0);


    // Execute Transaction
    await multiSigWallet.connect(addresses[0]).executeTransaction(0);
    console.log('ant : receiver balance => ', (await receiverAddress.getBalance()).toString());
    console.log('ant : sender balance => ', (await addresses[0].getBalance()).toString());


    // Check if the transaction was executed
    // struct Transaction {
    //   address to;
    //   uint value;
    //   bytes data;
    //   bool executed;
    //   uint numConfirmations;
    // }
    const transaction = await multiSigWallet.getTransaction(0);
    expect(transaction[3]).to.equal(true);
  });
});
