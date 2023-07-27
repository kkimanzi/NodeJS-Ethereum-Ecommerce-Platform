import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import configuration from '../build/contracts/E_commerce.json';
import businessImage from '../images/logo.jpg';

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;


const web3 = new Web3(window.ethereum);
window.ethereum.enable();

const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

let account;

let accountEl = document.getElementById('account');
let businessesEl = document.getElementById('businesses');

const createElementFromString = (string) => {
    const div = document.createElement('div');
    div.innerHTML = string.trim();
    return div.firstChild;
};

const displayRegisteredBusinesses = async () => {
    console.log("Inside displayRegisteredBusinesses");
    businessesEl.innerHTML = '';
    const registeredBusinesses = await contract.methods.getAllBusinesses().call();
    console.log(registeredBusinesses);
    for(let i = 0; i < registeredBusinesses.length; i++){
        console.log(registeredBusinesses[i]);  
         const businessEl = createElementFromString(`
            <div class="col">
                <div class="card"">
                    <img src=${businessImage} class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${registeredBusinesses[i][0]}</h5>
                        <p class="card-text">${registeredBusinesses[i][1]}</p>
                        <p class="card-text">${registeredBusinesses[i][2]}</p>
                    </div>
                </div>
            </div>
        `);
        businessesEl.appendChild(businessEl);
    }
    
     
}


const main = async () => {
    console.log("Inside main() -> 2");
    const accounts = await web3.eth.requestAccounts();
    account = accounts[0];
    accountEl.innerText = account;

    await displayRegisteredBusinesses();
};

window.addEventListener('load', function () {
    console.log("HERE");
    main();
});



