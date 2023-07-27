import 'bootstrap/dist/css/bootstrap.css';

import Web3 from 'web3';
import configuration from '../build/contracts/E_commerce.json';

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;

const web3 = new Web3(window.ethereum);
window.ethereum.enable();

const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

var JSAlert = require("js-alert");

let account;

let accountEl = document.getElementById('account');
let inputBusinessName = document.getElementById('inputBusinessName');
let inputBusinessDescription = document.getElementById('inputBusinessDescription');
let registerButton = document.getElementById('registerButton');

const registerBusiness = async () => {
    console.log(await contract.methods.getBusinessIdCounter2().call());
    console.log("Register button clicked");
    await contract.methods.registerBusiness(inputBusinessName.value, inputBusinessDescription.value).send({from:account});
    // For test only. Function call not for scale
    const myBusinessId = await contract.methods.getBusinessIdCounter2().call();
    JSAlert.alert("Your business has been successfully register.\nYour business ID = "+myBusinessId.toString(),"Business Successfully registered","Got It").
        then(function() {
            location.reload();
        });
    
};

const displayRegisteredBusinesses = async () => {
    const counter = await contract.methods.getBusinessIdCounter2.call();
    console.log(counter);
};

const main = async () => {
    console.log("Inside main() -> 2");
    const accounts = await web3.eth.requestAccounts();
    account = accounts[0];
    accountEl.innerText = account;

    registerButton.innerText = "Register";
    registerButton.onclick = registerBusiness.bind(null);

    inputBusinessName.innerText = "HOLO HOO";

    //displayRegisteredBusinesses();
};

window.addEventListener('load', function () {
    console.log("HERE");
    main();
});



