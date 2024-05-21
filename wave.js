import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import fs from 'fs';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { bcs } from '@mysten/bcs';
import chalk from "chalk";
import readlineSync from "readline-sync";

const gettimeclaim = (address) => new Promise((resolve, reject) => { fetch('https://fullnode.mainnet.sui.io/', {
  method: 'POST',
  headers: {
    'accept': '*/*',
    'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8',
    'client-sdk-type': 'typescript',
    'client-sdk-version': '0.51.0',
    'client-target-api-version': '1.21.0',
    'content-type': 'application/json',
    'origin': 'https://walletapp.waveonsui.com',
    'priority': 'u=1, i',
    'referer': 'https://walletapp.waveonsui.com/',
    'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99", "Microsoft Edge WebView2";v="124"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
  },
  body: JSON.stringify({
    'jsonrpc': '2.0',
    'id': 45,
    'method': 'suix_getDynamicFieldObject',
    'params': [
      '0x4846a1f1030deffd9dea59016402d832588cf7e0c27b9e4c1a63d2b5e152873a',
      {
        'type': 'address',
        'value': address
      }
    ]
  })
}).then(res => res.json())
        .then(res => {
            resolve(res)
        })
        .catch(err => reject(err));
});


var file = fs.readFileSync('phrase.txt', 'utf-8');
var splitFile = file.split('\r\n');
console.clear();
console.log("============================================================================");
console.log("❇️ 1. Get Balance SUI");
console.log("❇️ 2. Get Balance OCEANS");
console.log("❇️ 3. Claim Token");
console.log("❇️ 4. Send Sui to All");
console.log("❇️ 5. Collect OCEANS");
console.log("❇️ 6. Phrase To Address");
console.log("============================================================================");
const pilihan = readlineSync.question("Masukan Pilihan : ");

if(pilihan == 1){
var jj = 0;
for (let i = 0; i < splitFile.length; i++) {
console.log("============================================================================");
const keypair = Ed25519Keypair.deriveKeypair(splitFile[i]);
const address = keypair.getPublicKey().toSuiAddress()
console.log("Address : " + address);
const client = new SuiClient({
	url: "https://fullnode.mainnet.sui.io",
});
const balance = await client.getCoins({
	owner: address,
});

let balancex;
balancex = balance.data[0].balance;
balancex = balancex / 1000000000
balancex = parseFloat(balancex)
console.log("SUI Balance : " + balancex.toFixed(4));
if(balancex < 0.01){
console.log(chalk.red("Your Balances is Low"));
}
jj = jj+balancex;
}
console.log("============================================================================");
console.log(chalk.yellow(`jumlah Total : ${jj} SUI`));
console.log("============================================================================");
}else if(pilihan == 2){
var jj = 0;
for (let i = 0; i < splitFile.length; i++) {
console.log("============================================================================");
const keypair = Ed25519Keypair.deriveKeypair(splitFile[i]);
const address = keypair.getPublicKey().toSuiAddress()
console.log("Address : " + address);
const client = new SuiClient({
	url: "https://fullnode.mainnet.sui.io",
});

const oceans = await client.getBalance({
	owner: address,
	coinType: '0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN',
});
let oceansx;
oceansx = oceans.totalBalance;
oceansx = oceansx / 1000000000
oceansx = parseFloat(oceansx)
console.log("OCEANS Balance : " + oceansx.toFixed(2));
jj = jj+oceansx;
}
console.log("============================================================================");
console.log(chalk.yellow(`jumlah Total : ${jj} OCEANS`));
console.log("============================================================================");
}else if(pilihan == 3){
for (let i = 0; i < splitFile.length; i++) {
console.log("============================================================================");
const keypair = Ed25519Keypair.deriveKeypair(splitFile[i]);
const address = keypair.getPublicKey().toSuiAddress()
console.log("Address : " + address);
const client = new SuiClient({
	url: "https://fullnode.mainnet.sui.io",
});
let waktu 
waktu = await gettimeclaim(address);
waktu = waktu.result.data.content.fields.last_claim;
waktu = waktu.toString();
//console.log(waktu)
let time
time = Date.now();
time = time.toString()
//console.log(time)
const msto = time - waktu
//console.log(msto)
if(msto > 7200000){

const packageObjectId = '0x1efaf509c9b7e986ee724596f526a22b474b15c376136772c00b8452f204d2d1';
const tx = new TransactionBlock();
const gasBudget = '10000000';
tx.setGasBudget(gasBudget);
tx.moveCall({
	target: `${packageObjectId}::game::claim`,
	arguments: [tx.object("0x4846a1f1030deffd9dea59016402d832588cf7e0c27b9e4c1a63d2b5e152873a"),
                 tx.pure('0x0000000000000000000000000000000000000000000000000000000000000006'),
],
});
const result = await client.signAndExecuteTransactionBlock({
	signer: keypair,
	transactionBlock: tx,
});
const txsk = { result }
console.log(chalk.green(`Sukses Claim => https://suiscan.xyz/mainnet/tx/${txsk.result.digest}`));

}else{
console.log(chalk.red("Belum Waktunya Claim"));
}
}

}else if(pilihan == 4){
console.log("============================================================================");
var fileadds = fs.readFileSync('address.txt', 'utf-8');
var addresscc = fileadds.split('\n');
var phrasefund = fs.readFileSync('fundphrase.txt', 'utf-8');


let fundsend;
//mengirim 0.1 sui ke setiap wallet
const kirim = 0.1;
fundsend = kirim * 1000000000;

const keypair = Ed25519Keypair.deriveKeypair(phrasefund);
const address = keypair.getPublicKey().toSuiAddress()
console.log("Address Fund : " + address);
const client = new SuiClient({
	url: "https://fullnode.mainnet.sui.io",
});
const balance = await client.getCoins({
	owner: address,
});

let balancex;
balancex = balance.data[0].balance;
balancex = balancex / 1000000000
balancex = parseFloat(balancex)
console.log("SUI Balance Sender: " + balancex.toFixed(4) + " SUI");

const akhir = addresscc.length - 1;
for (let i = 0; i < akhir; i++) {
console.log("============================================================================");
console.log("Address : " + addresscc[i]);
const walletbalance = await client.getCoins({
	owner: addresscc[i],
});
//console.log(walletbalance)
const pandress = walletbalance.data;
if(pandress.length == 0){
console.log("SUI Balance : 0");
console.log(chalk.yellow("Balance Rendah Mulai Mengisi"));
const tx = new TransactionBlock();
const gasBudget = '10000000';
tx.setGasBudget(gasBudget);
const [coin] = tx.splitCoins(tx.gas, [fundsend]);
tx.transferObjects([coin], addresscc[i]);
const result = await client.signAndExecuteTransactionBlock({
	signer: keypair,
	transactionBlock: tx,
});
const txsk = { result }
console.log(chalk.green(`Sukses Send ${kirim} SUI => https://suiscan.xyz/mainnet/tx/${txsk.result.digest}`));
}else{
let balancewallet;
balancewallet = walletbalance.data[0].balance;
balancewallet = balancewallet / 1000000000
balancewallet = parseFloat(balancewallet)
console.log("SUI Balance : " + balancewallet.toFixed(4));
if(balancewallet < 0.05){
console.log(chalk.yellow("Balance Rendah Mulai Mengisi"));
const tx = new TransactionBlock();
const gasBudget = '10000000';
tx.setGasBudget(gasBudget);
const [coin] = tx.splitCoins(tx.gas, [fundsend]);
tx.transferObjects([coin], addresscc[i]);
const result = await client.signAndExecuteTransactionBlock({
	signer: keypair,
	transactionBlock: tx,
});
const txsk = { result }
console.log(chalk.green(`Sukses Send ${kirim} SUI => https://suiscan.xyz/mainnet/tx/${txsk.result.digest}`));
}else{
console.log(chalk.green("Balance Masih Cukup Untuk Claim"));
}

}
}
console.log("============================================================================");
}else if(pilihan == 5){
for (let i = 0; i < splitFile.length; i++) {
console.log("============================================================================");
const keypair = Ed25519Keypair.deriveKeypair(splitFile[i]);
const address = keypair.getPublicKey().toSuiAddress()
console.log("Address : " + address);
const client = new SuiClient({
	url: "https://fullnode.mainnet.sui.io",
});


const oceans = await client.getBalance({
	owner: address,
	coinType: '0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN',
});
//console.log(oceans);
let oceansx;
oceansx = oceans.totalBalance;
oceansx = oceansx / 1000000000
oceansx = parseFloat(oceansx)
console.log("OCEANS Balance : " + oceansx.toFixed(2));
if(oceansx > 0.1){
const coins = await client.getCoins({
	owner: address,
	coinType: '0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN',
});
//console.log(coins);	
const mergein = [];
const hiirt = coins.data;
const huxzp = hiirt.length - 1;

if(hiirt.length > 1){
for (let c = 1; c < hiirt.length; c++) {
mergein.push(coins.data[c].coinObjectId);
//console.log(coins.data[c].coinObjectId)
}
}

const mergein2 = coins.data[0].coinObjectId;
//console.log("============================================================================");
//console.log(mergein)
//console.log("============================================================================");

const tx = new TransactionBlock();
const gasBudget = '20000000';

if(hiirt.length > 1){
tx.mergeCoins(mergein2, mergein,
);
}
const [coin] = tx.splitCoins(mergein2, [oceans.totalBalance]);

//console.log([coin])
//////////////////////////////////////////////////////////////////////////////
//address ganti ke punyamu////
tx.transferObjects(
	[coin],
	'0xaddressmu'
);
//////////////////////////////////////////////////////////////////////////////
tx.setGasBudget(gasBudget);
tx.setSender(address);

const result = await client.signAndExecuteTransactionBlock({
	signer: keypair,
	transactionBlock: tx,
});
const txsk = { result }
console.log(chalk.green(`Sukses Transfer  => https://suiscan.xyz/mainnet/tx/${txsk.result.digest}`));

}else{
console.log(chalk.yellow("Balance kurang"));
}
}
console.log("============================================================================");

}else if(pilihan == 6){
for (let i = 0; i < splitFile.length; i++) {
console.log("============================================================================");
const keypair = Ed25519Keypair.deriveKeypair(splitFile[i]);
const address = keypair.getPublicKey().toSuiAddress()
fs.appendFileSync('address.txt', `${address}\n`);
}
}