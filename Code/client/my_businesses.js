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
let myBusinessesEl = document.getElementById('myBusinesses');

const createElementFromString = (string) => {
    const div = document.createElement('div');
    div.innerHTML = string.trim();
    return div.firstChild;
};

const queryBusinessTransactions = async (businessId) => {
    console.log("Business Id Clicked = ",businessId);
    window.location.href = "view_business.html?businessId="+businessId;
    //console.log(await contract.methods.checkPayments(businessId).call({from:account}));
}

const displayMyBusinesses = async () => {
    console.log("Inside displaymyBusinesses");
    myBusinessesEl.innerHTML = '';
    const myBusinesses = await contract.methods.getUserBusinesses().call({from:account});
    console.log(myBusinesses);
    for(let i = 0; i < myBusinesses.length; i++){
        console.log(myBusinesses[i]);  
         const businessEl = createElementFromString(`
            <div class="col">
                <div class="card"">
                    <img src=${businessImage} class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${myBusinesses[i][0]}</h5>
                        <p class="card-text">${myBusinesses[i][1]}</p>
                        <p class="card-text">${myBusinesses[i][2]}</p>
                        <div class="nav justify-content-center" style="width:100%">
                            <button type="button" class="btn btn-primary">Check Details</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        const button = businessEl.querySelector('button');
        button.onclick = queryBusinessTransactions.bind(null, myBusinesses[i][3]);
        myBusinessesEl.appendChild(businessEl);
    }
    
     
}

const main = async () => {
    console.log("Inside main() -> 2");
    const accounts = await web3.eth.requestAccounts();
    account = accounts[0];
    accountEl.innerText = account;

    displayMyBusinesses();

};

window.addEventListener('load', function () {
    console.log("HERE");
    main();
});



