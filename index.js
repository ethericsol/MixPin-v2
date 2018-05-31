const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const ipfsAPI = require('ipfs-api');
const web3 = require('web3');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const web3Util = require('./lib/web3Util');
const ipfsUtil = require('./lib/ipfsUtil');
const Sleep = require('sleep');

clear();
console.log(
  chalk.blue(
    figlet.textSync('MixPin', { horizontalLayout: 'full' })
  )
);

const handleError = (e) => {
  console.log(chalk.red(e));
};


const run = async () => {
    
    //set web3Provider
    try {
      await web3Util.setProvider();
      console.log(chalk.green('Web3 Provider Set!'));
      await web3Util.getSync();
      console.log(chalk.green('Mix Sync Successful!'));
      const spin1 = new Spinner('Pinning past items');
      spin1.start();
      const mixStoreItems = await web3Util.getPreviousItems();
      await ipfsUtil.addMultipleItems(mixStoreItems);
      //console.log(mixStoreItems);
      spin1.stop();
      const spin2 = new Spinner('Watching for new Items');
      spin2.start();
      web3Util.watchForItems((e,ipfsHash) => {
        if(e) {
          handleError(e);
        } else {
          ipfsUtil.addItem(ipfsHash).then((hash)=>{
            console.log(chalk.blue('Pinned New Item : ' + hash));
          });
        }
      });
    } catch (e) {
      handleError(e);
      return;
    }
    
};

run();







