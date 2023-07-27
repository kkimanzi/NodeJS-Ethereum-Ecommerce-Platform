import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import configuration from '../build/contracts/E_commerce.json';

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;


const web3 = new Web3(window.ethereum);
window.ethereum.enable();

const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

let account;

let accountEl = document.getElementById('account');

let toEl = document.getElementById('toId');
let amountEl = document.getElementById('amount');
let purchaseIdEl = document.getElementById('purchaseId');

let acceptButton = document.getElementById('accept');
let declineButton = document.getElementById('decline');

let myAddressInput = document.getElementById('myAccount');

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

const proceedToPay = async () => {
    console.log("Proceeding to pay");
    var date = new Date();
    // randomize the date a bit just for simulation
    date.setDate(new Date().getDate() + getRndInteger(1,5));
    var timeStamp = parseInt(Math.floor(date.getTime() / 1000));
    
    var amount = amountEl.value;

    var pId = purchaseIdEl.value;
    var BN = web3.utils.BN;
    var hexPId = web3.utils.asciiToHex(new BN(parseInt(pId)).toString());

    var toId = toEl.value;
    
    //console.log(toId, hexPId, timeStamp,amount);
    await contract.methods.makePayment(parseInt(toId),hexPId,timeStamp).send({from:account,value:web3.utils.toWei(amount)});

    console.log(web3.utils.fromWei(await contract.methods.getBalance().call()));

    location.reload();
}
const declineToPay = async () => {
    console.log("Declining to pay");
}

const main = async () => {
    console.log("Inside main() -> 2");
    const accounts = await web3.eth.requestAccounts();
    account = accounts[0];
    accountEl.innerText = account;
    myAddressInput.value = account;

    acceptButton.onclick = proceedToPay.bind(null);
    declineButton.onclick = declineToPay.bind(null);

};

window.addEventListener('load', function () {
    console.log("HERE");
    main();
});

