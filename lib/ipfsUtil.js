const ipfsAPI = require('ipfs-api');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const Progress = CLI.Progress;
const Sleep = require('sleep');
const chalk = require('chalk');

module.exports = {
   
    ipfs : ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'}),

    addItem: (hash) => { 
        return new Promise((resolve,reject) => {
            module.exports.ipfs.pin.add(hash, (e) => {
                if(e) {
                    reject(e);
                } else {
                    resolve(hash);
                };
            });
        });
    },

    getPinnedItems: () => {
        return new Promise((resolve,reject) => {
            module.exports.ipfs.refs.local((e,res)=>{
                if (e) {
                    reject(e);
                } else {
                    resolve(res);
                }
            });
            
        });
    },

    addMultipleItems: (hashArray) => {
        return new Promise((resolve,reject) => {
            for (let i = 0; i < hashArray.length; i++) {
                module.exports.ipfs.pin.add(hashArray[i], (e) => {
                    if(e) {
                        reject(e);
                    } 
                });
                console.log(chalk.blue('Pinned: '+ hashArray[i]));
            }
            resolve();
        });
    }

}
