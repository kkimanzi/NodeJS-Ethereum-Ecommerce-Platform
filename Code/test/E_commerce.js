const E_commerce = artifacts.require('E_commerce');
const assert = require('assert');
//const { isTypedArray } = require('util/types');


//print ("HERE");
contract('E_commerce', (accounts) => {
    //print("Here");
    const merchant1 = accounts[2];
    const buyer1 = accounts[3];

    before(async() => {
        instance = await E_commerce.deployed();
    })

    it('should allow a merchant to open account', async () => {
        
        const businessName = "Candor Corp";
        const businessDescription = "Best marketting business";
        await instance.registerBusiness(businessName, businessDescription);
        const insertedBusiness = await instance.businesses.call(1);

        assert.equal(insertedBusiness.name, businessName, "The new business should now be created");
        
    });

    it('should allow another merchant to open account', async () => {
        
        const businessName = "Dairy Corp";
        const businessDescription = "Best dairy business";
        await instance.registerBusiness(businessName, businessDescription);
        const insertedBusiness = await instance.businesses.call(2);

        assert.equal(insertedBusiness.name, businessName, "The second business should now be created");
        
    });


    it('should allow making purchase to merchant account', async () => {
        const purchaseId = web3.utils.asciiToHex("1");
        const timestamp = Math.floor(((new Date()).getTime)/1000);
        await instance.makePayment(5, purchaseId, 45878956231,{
            from: buyer1,
            value: 1e18,
        });
        
        const purchaseEntry = await instance.getPurchaseEntry.call(2,purchaseId);
        const {0: buyer, 1: amount, 2: isRecorded} = purchaseEntry;
        //const purchaseEntry= await instance.purchases.call(2,purchaseId);
        assert.equal(isRecorded, true, "Purchase entry successfully added");
    });

    it('should allow making 2nd purchase to merchant account', async () => {
        const purchaseId = web3.utils.asciiToHex("2");
        const timestamp = Math.floor(((new Date()).getTime)/1000);
        await instance.makePayment(2, purchaseId, 45878956231,{
            from: buyer1,
            value: 1e18,
        });
        
        const purchaseEntry = await instance.getPurchaseEntry.call(2,purchaseId);
        const {0: buyer, 1: amount, 2: isRecorded} = purchaseEntry;
        //const purchaseEntry= await instance.purchases.call(2,purchaseId);
        assert.equal(isRecorded, true, "Purchase entry successfully added");
    });

    it('should fetch the paymnets made to merchant account', async () => {
        const purchases = await instance.checkPayments.call(2);
        assert.equal(purchases[0][0], 45878956231, "Two purchase entries found");
    });
});
