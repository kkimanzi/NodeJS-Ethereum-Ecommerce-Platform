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

let businessNameEl = document.getElementById('businessName');
let businessBalanceEl = document.getElementById('businessBalance');

let withdrawButton = document.getElementById('WithdrawButton');
let inputWithdrawAmountEl = document.getElementById('inputWithdrawAmount');

let addShareholderButton = document.getElementById("addShareholderButton");
let shareholderInputEl = document.getElementById("inputAddShareholder");

let shareholdersEl = document.getElementById("shareholders");

const createElementFromString = (string) => {
    const div = document.createElement('div');
    div.innerHTML = string.trim();
    return div.firstChild;
};

const withdrawFunds = async () => {
    console.log("Inside withdraw funds");
    var businessId = getParameter("businessId");
    var amount = inputWithdrawAmountEl.value;
    console.log(await contract.methods.sendViaCall(businessId,web3.utils.toWei(amount)).send({from:account}));
    location.reload();
}
const fillGeneralDetails = async () => {
    var businessId = getParameter("businessId");
    var bName = await contract.methods.getBusinessName(businessId).call({from:account});
    console.log("bName ".bName);
    businessNameEl.innerText = bName;

    var bBalance = await contract.methods.getBusinessBalance(businessId).call({from:account});
    console.log("bBalance ",web3.utils.fromWei(bBalance));
    businessBalanceEl.innerText = web3.utils.fromWei(bBalance);

}

const addShareholder = async () =>{
    var shareholderAddress = shareholderInputEl.value;
    var businessId = getParameter("businessId");
    await contract.methods.mapShareHolderToMyBusiness(businessId, shareholderAddress).send({from:account});
    location.reload();
}
/*
    const button = businessEl.querySelector('button');
    button.onclick = queryBusinessTransactions.bind(null, myBusinesses[i][3]);
    myBusinessesEl.appendChild(businessEl);
*/
const fillShareholders = async () => {
    var shareholders = await contract.methods.getBusinessShareholders(parseInt(getParameter("businessId"))).call({from:account});
    shareholdersEl.innerHTML = '';

    for (var i = 0; i < shareholders.length; i++){
        const shareholder = createElementFromString(`
            <p class="p-2" style="width:400px">${shareholders[i]}</p>
        `);
        shareholdersEl.appendChild(shareholder);
    }
}

const queryBusinessTransactions = async () => {
    var businessId = getParameter("businessId");
    const rawData = await contract.methods.checkPayments(businessId).call({from:account});
    console.log(rawData);
    var xValues = [];
    var yValues = [];

    for (var i = 0; i < rawData.length; i++){
        var amount = rawData[i][1]/1e18;

        var curTimestamp = (rawData[i][0] * 1000);
        var date = new Date(curTimestamp);
        console.log(date.getFullYear(),date.getMonth(),date.getDate());
        
        var shortDate = new Date(date.getFullYear() ,date.getMonth() ,date.getDate());
        shortDate = shortDate.toLocaleDateString();

        var index = xValues.indexOf(shortDate);
        
        if (index == -1){
            xValues.push(shortDate);
            yValues.push(amount);
        } else {
            yValues[index] += amount;
        }
        
    }

    console.log("xValues ",xValues);
    console.log("yValues ",yValues);

    new Chart("myChart", {
        type: "bar",
        data: {
          labels: xValues,
          datasets: [{
                data: yValues,
                backgroundColor: "#e755ba"
          }]
        },
        options: {
            scales: {
              xAxes: [{
                type: 'time',
                time: {
                  unit: 'day'
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Date'
                }
              }],
              yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Sales (Wei)'
                }
              }]
            }, 
            legend: {display: false},
            title: {
                display: false,
                text: ""
            }
        }
    });

}

getParameter = (key) => {
    address = window.location.search
    parameterList = new URLSearchParams(address)
    return parameterList.get(key)
}


const main = async () => {
    console.log("Inside main() -> 4");
    const accounts = await web3.eth.requestAccounts();
    account = accounts[0];
    accountEl.innerText = account;    

    withdrawButton.onclick = withdrawFunds.bind(null);
    addShareholderButton.onclick = addShareholder.bind(null);

    await fillGeneralDetails();
    await queryBusinessTransactions();
    await fillShareholders();
    
};

window.addEventListener('load', function () {
    console.log("HERE");
    main();
});




