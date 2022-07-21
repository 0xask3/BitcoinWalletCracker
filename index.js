console.clear();
/*************************************************/
/*************** Declaring Consts ****************/
/*************************************************/
const bip39 = require('bip39');
const bip32 = require('bip32');
const fs = require('fs');
const chalk = require('chalk');
var bitcoin = require('bitcoinjs-lib');
var easyBtc = require('easy-bitcoin-js');
var request = require('request');
const process = require('process');
uuid = require("machine-uuid-sync")();



var iterations = 0;
var threads = 100;
var cpm = 0;
var totalbalance = 0;
var isHWIDAllowed = false;
/*************************************************/
/*************** Declaring Functs ****************/
/*************************************************/
function getAddress (node) {
return bitcoin.payments.p2pkh({ pubkey: node.publicKey }).address
}

function saveHit (addy, balance) {
  fs.appendFile("hits.txt", "\n"+addy + ":     " + balance, function(err) {/**/});
}

function thread() {
    iterations++;
    var mnemonic = bip39.generateMnemonic();
    if(bip39.validateMnemonic(mnemonic) != true) {
      console.log(chalk.red(mnemonic + " : INVALID"));
      return;
    }
    else {
      var seed = bip39.mnemonicToSeedSync(mnemonic);
      const root = bip32.fromSeed(seed);
      const path = "m/44'/0'/0'/0/0";
      const child1 = root.derivePath(path);
      const path2 = "m/44'/0'/0'/0/1"
      const child2 = root.derivePath(path2);
      var address1 = getAddress(child1);
      var address2 = getAddress(child2);

      request('https://blockchain.info/q/addressbalance/' + address1, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        var accbalance = body*1;
        request('https://blockchain.info/q/addressbalance/' + address2, { json: true }, (err, res, bodyy) => {
          if (err) { return console.log(err); }
          accbalance = accbalance + (bodyy*1);
            if(accbalance > 0) {
              cpm = iterations/(Math.floor(Date.now() / 1000)-startTime);
              totalbalance = (accbalance*1) + totalbalance;
              process.title = "Threads: " + threads + " | Checked " + iterations + " | CPS " + parseFloat(cpm).toFixed(2) + " | Balance " + totalbalance/100000000;


              console.log(chalk.green("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n"+"Mnemonic: "+mnemonic+"\n"+"Balance: "+accbalance+ "\n+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"));
              saveHit(mnemonic, accbalance);
              loop();
            }
            else {
              cpm = iterations/(Math.floor(Date.now() / 1000)-startTime);
              totalbalance = (accbalance*1) + totalbalance;
              process.title = "Threads: " + threads + " | Checked " + iterations + " | CPS " + parseFloat(cpm).toFixed(2) + " | Balance " + totalbalance/100000000;

              console.log(chalk.red("Mnemonic: "+mnemonic));
              loop();
            }
        });
      });


    }
}

function loop() {
    thread();
}

/*************************************************/
/***************** Program Code ******************/
/*************************************************/
console.clear();
var startTime = Math.floor(Date.now() / 1000);
for(i=1; i<=threads; i++) {
  process.title = "Threads: " + i + " | Checked " + iterations + " | CPS " + parseFloat(cpm).toFixed(2)  + " | Balance " + totalbalance/100000000;
  loop();
}
