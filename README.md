# radio3 (Production Version)

A programming package to include decentralized large communication protocols. ***radio3*** allows event hosts to send announcements/SOS calls 
to their participants with ease. 

Powered by an elementary ***Proof-of-Account***, ***radio3*** verifies participants given an event ensuring security and easy event monitoring.

***Note***: Requires ***mainnet*** eth.

### Installation and use

***Prerequisite:***

Initialize npm directory:

```
npm init 
```

Install npm package:

```
npm install radio3-prod
```

Global Installation npm pacakge:

```
npm install -g radio3-prod
```

### Dependencies

***radio3*** runs on three libraries at the moment: `node-fetch`, `@epnsproject/backend-sdk`, `dotenv`, `web3`. 

Currently, `node-fetch` is running on version *2.6.6* despite having recently published a new version *@3.7.8*. This is due to the new version not being a module, and thus, not being compatiable for ES6. 

The `@epnsproject/backend-sdk` is currently an EPNS library for production environments. All radio3 processes will require mainnet eth instead of Kovan (***as required for the staging version***). Though, the current version of `radio3` works perfectly for large events whether they have their NFT or EPNS Channel on mainnet or a test network.


### radio3 reference

***radio3*** has asynchronous nature. All basic commands require asynchronous function overlap to view result.

#### Import radio3 package

Import radio3 package as a ES6 Module as:
```
var variable_name = require('radio3-prod')
```
Alternative Import Method:
```
import radio3 from 'radio3-prod'
```

#### radio3 Initialization

Initializes event and connects to user's EPNS Channel on the ***mainnet***. This requires users's *private key*. 
*Note*: ***radio3*** does not save or share private keys to anyone or anything. We understand that private keys are confidential and should not be shared with anyone.

```
var variable_name = await radio3.radio3_init(PRIVATE_KEY)
```

To see if a user has successfully connected, try `console.log()` the initialization. If an EPNS object comes out with details about the channel, the user has successfully connected.

#### Connect Event NFT

To send an announcement/sos call to all NFT holders of a specific NFT, a NFT initialization is needed. ***radio3*** allows for such initialization to allow Covalent API to query the chain for the NFT metadata. 

```
var variable_name = await radio3.connect_nft(contract_address, network)
```
***Note***: The `network` parameter can be either two values: `eth` or `poly`. Failing to type such parameters will result in an Error (View ***Errors*** for more information). As a result, the NFTs can only be from the ***Ethereum*** or ***Polygon*** network.

To ensure that a user has successfully connected their nft, `connect_nft()` does return a list of accounts that hold the given nft. However, if the nft can only be held by ***one*** wallet, past wallets that have held the nft will be part of the array as well. 

#### Send Announcement/SOS to Subscribers

Sends an Announcement or SOS to wallets that have subscribed to the EPNS channel made by the event host's private key. Users can view ***Resources*** to learn more about how EPNS Channels work. Since ***radio3-prod*** is a production library, all members on the mainnet channel will receive the message.

```
const variable_name = await radio3.sendm_sub(message_title, message_content, redirect_link)
```

`sendm_sub()` returns either `true` or `false` depending on if all the messages were sent. If successfully sent, the function will return `true`, else `false` otherwise. 


***Note***: `message_title` must be *larger* than 1 character and *shorter* than 40 characters. `message_content` must be *larger* than 1 character and *shorter* than 115 characters. 

In terms of what users will see on their EPNS wallets, they will see a notification title and notification message first before opening the actual message to see the `message_content` and `message_title`. For ease, radio3 uses the same `message_content` for the **content of notifications** and uses *half* of `message_title` as the **notification title**. 

The `redirect_link` parameter is optional. If an event has a link to send to their participants, wallets can click on that message to be redirected to link. If such a parameter is not needed, keep `redirect_link = null`. 

#### Send Announcement/SOS to Event NFT Holders

Sends an Announcement or SOS to wallets that have a given NFT. However, if the NFT can only be owned by one wallet, the announcement/sos will be sent to all past wallets as well. 

When a user runs the function, the ***proof-of-account*** verification protocol will run where it will output a list of accounts that are ***not*** connected to the event host's EPNS Channel. However, this will just be a warning message, and thus, the content will send, however, will be ended up in their ***spam*** inbox (View ***Resources*** to learn more about EPNS). 

```
const variable_name = await radio3.sendm_nft(message_title, message_content, redirect_link, network)
```

`sendm_nft()` returns either `true` or `false` depending on if all the messages were sent. If successfully sent, the function will return `true`, else `false` otherwise. 


***Note***: `message_title` must be *larger* than 1 character and *shorter* than 40 characters. `message_content` must be *larger* than 1 character and *shorter* than 115 characters. 

In terms of what users will see on their EPNS wallets, they will see a notification title and notification message first before opening the actual message to see the `message_content` and `message_title`. For ease, radio3 uses the same `message_content` for the **content of notifications** and uses *half* of `message_title` as the **notification title**. 

The `redirect_link` parameter is optional. If an event has a link to send to their participants, wallets can click on that message to be redirected to link. If such a parameter is not needed, keep `redirect_link = null`. 

The `network` parameter takes only two parameters: `eth` or `poly`. The parameter inputted should be parallel to which network the NFT is on.

## Errors

```
Error: NFT Holders are Empy
```
Occurs when the Covalent API query cannot find the NFT address. It is important that the inputted `contract_address` must be valid and ***have*** a wallet that has owned or currently owns the NFT.

```
Error: NFT Contract Address not valid
```

Will prompt if the contract address is not valid, or does not reflect a ERC20 or ERC721 contract. Be sure that the `contract_address` parameters only take ERC20 or ERC721 addresses.

```
Error: Network {network} is not a valid parameter
```

This error is typical when the `network` parameter is not `eth` or `poly`. It is essential that the user has the `network` parameter as only: `eth` or `poly` (polygon) as radio3 only supports the two chains.

```
Error: Addresses were not found
```

There are two possiblilities why this error can pop up. 1) The NFT contract address inputted was not found or had 0 holders. This error will be prompted when Covalent can not query or scrape the ***Accounts*** section of the NFT metadata. 2) The EPNS Channel of the Host is not found. It is necessary that the host has their EPNS channel on the ***mainnet*** platform.

```
Error: {word}... does not match word limit
```
Occurs when either `message_content` or `message_title` does not adhere to the word limit. For the `message_content`, the word limit that the user must follow is between `1 < word < 115`. For `message_title`, the word limit holds as: `1 < word < 40`

## Resources

Found below are some resources to understand the technologies used for radio3:
 - [EPNS Staging App](https://staging.epns.io/)
 - [EPNS](https://epns.io/)
 - [Covalent API](https://www.covalenthq.com/)
 - [Radio3 (Staging Version)](https://github.com/GEEGABYTE1/Radio)

## Contact Information
Here are some of the ways you can find me:
 - [www.jaivalpatel.com]
 - [Twitter](https://twitter.com/patjaival)
 - [npm](https://www.npmjs.com/~jaivalpatel1)
 - [Instagram](https://www.instagram.com/jaivalpatelll/)

Made by @Jaival - 2022