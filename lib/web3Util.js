const web3 = require('web3');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const Progress = CLI.Progress;
const Sleep = require('sleep');
const multihashes = require('multihashes');
const ipfsUtil = require('./ipfsUtil');
const chalk = require('chalk');

const itemStoreIpfsSha256Address = "0x1c12e8667bd48f87263e0745d7b28ea18f74ac0e";
const itemStoreIpfsSha256Abi = require('./item_store_ipfs_sha256.abi.json');
const eventPublishRevision = "0xa42468235cfdba0d7adbc48b79ee2a88f02cf52f20de70c669aaad7fd3e21585";

module.exports = {
    setProvider: () => {
        return new Promise((resolve,reject) => {
            try {
                Web3 = new web3(new web3.providers.WebsocketProvider("ws://127.0.0.1:8645"));
                resolve();
            } catch(e) {
                reject(e);
            }
        });
    },

    getSync: () => {
        return new Promise((resolve,reject) => {
            Web3.eth.isSyncing((e,sync) => {
                if(e) {
                    reject(e); 
                } else if(sync) {
                    reject('Blockchain still syncing '+ sync.currentBlock + ' out of ' + sync.highestBlock);
                } else {
                    resolve();
                }
            });
        })
    },

    watchForItems : (callback) => {
        const Web3 = new web3(new web3.providers.WebsocketProvider("ws://127.0.0.1:8645"));
        const itemStoreIpfsSha256 = new Web3.eth.Contract(itemStoreIpfsSha256Abi,itemStoreIpfsSha256Address);
        itemStoreIpfsSha256.events.PublishRevision({
            filter: {},
            fromBlock: 0,
            toBlock: 'latest'})
            .on('data',(event) => {
    
                    const ipfsHash = event.returnValues.ipfsHash;
                    //const base58IpfsHash = multihashes.toB58String(multihashes.encode(Buffer.from(ipfsHash, "hex"), 'sha2-256'));
                    const base58IpfsHash = multihashes.toB58String(multihashes.encode(Buffer.from(ipfsHash.substr(2), "hex"), 'sha2-256'));
                    //callback(null,base58IpfsHash);
                    ipfsUtil.addItem(base58IpfsHash).then((hash)=>{
                        console.log(chalk.blue('Pinned New Item : ' + hash));
                    });
                
            });

    },

    getPreviousItems: () => {
        return new Promise((resolve,reject) => {
            Web3.eth.getPastLogs({
                fromBlock: "0x0",
                toBlock:'pending',
                address: itemStoreIpfsSha256Address,
                topics:[eventPublishRevision]
            }).then((events) => {
                try {
                    const retArray = [];
                    for(let i = 0; i < events.length; i++) {
                        let ipfsHash = events[i].data.substr(66, 64);
                        let base58IpfsHash = multihashes.toB58String(multihashes.encode(Buffer.from(ipfsHash, "hex"), 'sha2-256'));
                        retArray.push(base58IpfsHash);
                    };
                    resolve(retArray);
                } catch(e) {
                    reject(e);
                }
            }, (e) => {
                console.log(e);
                reject(e);
            });

        });
    }

};