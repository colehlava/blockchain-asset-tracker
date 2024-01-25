const ChainOfCustody = artifacts.require("ChainOfCustody");
const truffleAssert = require('truffle-assertions');

contract('ChainOfCustody', (accounts) => {

    it('Should set contract owner to the first account', async () => {
        const instance = await ChainOfCustody.deployed();
        const owner = await instance.getOwner();
        assert.equal(owner, accounts[0], "Contract owner wasn't the first account");
    });

    it('Should allow contract owner to register asset', async () => {
        const instance = await ChainOfCustody.deployed();
        let result = await instance.registerAsset(accounts[0], "Asset Test Name", { from: accounts[0], value: 10 * 10**18 });
        // assert.equal(result.logs[0].event, "Register", "Register event was not emitted")
        // assert.equal(result.logs[0].args._owner, accounts[0], "Contract should emit Register event with correct Asset owner");
        truffleAssert.eventEmitted(result, 'Register', (ev) => {
            return ev._owner === accounts[0];
        }, 'Contract should emit Register event with correct Asset owner');
    });

    it('Should not allow contract to register asset when transaction value is less than registration fee', async () => {
        const instance = await ChainOfCustody.deployed();
        // let result = await instance.registerAsset(accounts[0], "Asset Test Name", { from: accounts[0], value: 9 * 10**18});
        // assert.equal(result.logs.length, 0, "Contract should not emit Register event when transaction value is less than registration fee");
        // assert.fail( await instance.registerAsset(accounts[0], "Asset Test Name", { from: accounts[0], value: 9 * 10**18}) );
        await truffleAssert.reverts(
            instance.registerAsset(accounts[0], "Asset Test Name", { from: accounts[0], value: 9 * 10**18 }),
            "Insufficient payment value: 10 ether required"
        );
    });
});

