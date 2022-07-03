//this is used to see if there is a metamask extention in the browser
//if there is the window.eth is not undefined
//reason we do this so that metamask doesnt ask us to connect everytime we refresh instead wait to call connect
//for raw javascript to develop the front end we will use statements like "import" but not require
//we wont be using yarn add packages on raw js to develop the front end but later on when we use react.js

import { ethers, Wallet } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js"; //since the contract address change developers add a constant file that represents the ABI of the contract becuase that must remain same

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdraw");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

console.log(ethers);

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" }); //try to connect to metamask if you see one
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected!";
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log(accounts);
    } else {
        connectButton.innerHTML = "Please Install metamask";
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}.... 3`);
    //provider //connection to the blockchain
    //signer / wallet / someone with gas
    //contract that we are interacting with
    //^ ABI and addresss
    //web3Provider is a object that helps wrap aorund stuff like metamask is similar to
    //JsonRpcProvider it sticks the RPC url into the function from metamask for us
    const provider = new ethers.providers.Web3Provider(window.ethereum); //window.etherum comes with metamask
    const signer = provider.getSigner();
    console.log(signer);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
        const transactionResponse = await contract.fund({
            value: ethers.utils.parseEther(ethAmount),
        });
        await listenForTransactionMine(transactionResponse, provider);
        console.log("done");
    } catch (error) {
        console.log(error);
    }
}

/*if we dont dont rreturun a promise what will happen is when this method is called
even using await that provider.once will start off as another process
as function is not async the function will end before even process.once is
finished and thats why it will appear after console.log("done")
it basically is in an event loop our front end will keep checking if this 
function once is done and once its done it will deiplay results
now when we add promise and the function has to return somthing so it will be
either resolve or reject
this confirms the transaction that is mined and is sucessful/
//return: promise
*/
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}....`);
    //listen for events                     //listener anonymous func
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.conformations} conformations`
            );
            resolve();
        });
    });
}

async function getBalance() {
    //console.log("no balance");
    if (typeof window.ethereum !== "undefined") {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const balance = await provider.getBalance(contractAddress);
            console.log(ethers.utils.formatEther(balance));
            //console.log("no balance");
        } catch (error) {
            console.log(error);
        }
    } else {
        connectButton.innerHTML = "Please Install metamask";
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum); //window.etherum comes with metamask
            const signer = provider.getSigner();
            console.log(signer);
            const contract = new ethers.Contract(contractAddress, abi, signer);
            try {
                const transactionResponse = await contract.withdraw();
                await listenForTransactionMine(transactionResponse, provider);
                console.log("done");
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        connectButton.innerHTML = "Please Install metamask";
    }
}
