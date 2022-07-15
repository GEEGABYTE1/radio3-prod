const fetch = require('node-fetch')
const EpnsSDK = require("@epnsproject/backend-sdk").default
require('dotenv').config()
const Web3 = require('web3')         
const web3 = new Web3(Web3.givenProvider || 'https://eth-goerli.gateway.pokt.network/v1/lb/62b7830e123e6f003984c794') 


class Radio {
    constructor(private_key) {
        this._epnssdk = new EpnsSDK(private_key)
        this._contract_holders = []
        this.nft_address = undefined

    }

    get sdk () {
        return this._epnssdk
    }

    get contract_holders () {
        return this._contract_holders
    }

    set contract_holders(array) {
        this._contract_holders = array
    }

    check_contract(contract) {
        const contract_status = web3.utils.isAddress(contract)
        return contract_status
    }

    async fetch_data(chainId, address, api_key, baseURL) {
        const url = new URL(`${baseURL}${chainId}/tokens/${address}/token_holders/?key=${api_key}`);
        const response = await fetch(url);
        const result = await response.json();
        const data = result.data;
        return data;
    }

    async filter_accounts (array) {
        if (this._contract_holders === 0) {
            throw new Error('NFT Holders are Empty')
        } else {
            let addresses_from_query = []
            let transaction_metadata = array['items']
            
            
            let transaction_idx = 0 
            for (transaction_idx; transaction_idx <= transaction_metadata.length; transaction_idx++) {
                let transaction = transaction_metadata[transaction_idx]
                if (transaction !== undefined) {
                    const address_filter = transaction['address']
                    
                    let contract_check = web3.utils.isAddress(address_filter)
                    if (contract_check === true) {
                        addresses_from_query.push(address_filter)
                    } else {

                    }
                }
            }

            return addresses_from_query
        }
    }
    


    async connect_nft(nft_address, network) {                       // User Function
        const nft_validation = this.check_contract(nft_address)
        if (nft_validation === false) {
            throw new Error(`NFT Contract Address not valid - Contract Address: ${nft_address}`)
        } else {
            var chainId = undefined
            var validation = true
            const block_id = {'eth':'1', "poly":'137'} // 2 Providers
            if (network === 'eth') {
                chainId = block_id[network]
            } else if (network === 'poly') {
                chainId = block_id[network]
            } else {
                validation = false
                throw new Error(`Network ${network} is not a valid parameter`)
                
            }

            if (validation === true ) {

                const fetched_arrays = this.fetch_acc(chainId, nft_address)
                this.nft_address = nft_address
                return fetched_arrays
                     
            } else {
                return []
            }
        }
    }

    async fetch_acc (chainId, nft_address) {
        const baseURL = 'https://api.covalenthq.com/v1/'
        const api_key = process.env.API_KEY
        const array = await this.fetch_data(chainId, nft_address, api_key, baseURL)
        const array_filtered = await this.filter_accounts(array)
        //console.log(array_filtered)
        this._contract_holders = array_filtered
        return array_filtered
    }

    async sendm_nft(message_title, message_content, redirect_link, network) {
        var chainId = undefined
        const block_id = {'eth':'1', "poly":'137'} // 2 Providers
        if (network === 'eth') {
            chainId = block_id[network]
        } else if (network === 'poly') {
            chainId = block_id[network]
        } else {
            throw new Error(`Network ${network} is not a valid parameter`)   
        }


        const filtered_accounts_covalent = await this.fetch_acc(chainId, this.nft_address)
        console.log(filtered_accounts_covalent)
        
        const subbed_accounts = await this.fetch_subscribers()
        console.log(subbed_accounts)
        if (filtered_accounts_covalent.length === 0) {
            throw new Error('Addresses were not found')
        } else {
            const verification_result = this.verification(filtered_accounts_covalent, subbed_accounts)
            
            console.log(verification_result)
            if (verification_result.length > 0) {
                for (let verification_idx=0; verification_idx <= verification_result.length; verification_idx++) {
                    const not_subbed_account = verification_result[verification_idx]
                    console.log(` WARNING: ${not_subbed_account} has not subscribed to the channel yet but still will 
                    be sent the message`)
                } 
            } 
                const message_title_verify = this.message_title_verification(message_title)
                if (message_title_verify[0] === false) {
                    throw new Error(`${message_title} does not match word limit. Character Word Limit is ${message_title_verify[1]} instead of 20`)
                } else {
                    const message_content_verify = this.message_content_verification(message_content)
                    if (message_title_verify[0] === false) {
                        throw new Error(`${message_content} does not match word limit. Character Word Limit is ${message_content_verify[1]} instead of 20`)
                    } else {
                        const notification_title = 'Announcement'
                        const notification_content = this.notification_content(message_content)
                        
                        const subscribers = filtered_accounts_covalent
                        let subscriber_idx = 0
                        
                        
                        try { 
                            for (subscriber_idx; subscriber_idx <= subscribers.length; subscriber_idx++) {
                                let account = subscribers[subscriber_idx]
                                
                                console.log(account)
                                const reponse = account = await this._epnssdk.sendNotification(
                                    account,
                                    message_title,
                                    message_content,
                                    notification_title,
                                    notification_content,
                                    1,
                                    redirect_link
                                )
                                console.log(`${account} has been sent the message`)
                            }
                            return true
                        } catch (err) {
                            console.log(err)
                            return false
                        }
                    }   
                }
            
        }
        
    }
    
    verification(covalent, subbed) {
        const subbed_accounts = []
        let covalent_idx =0
        for (covalent_idx; covalent_idx <= covalent.length; covalent_idx++) {
            const covalent_account = covalent[covalent_idx]
            if (covalent_account in subbed) {} else {
                subbed_accounts.push(covalent_account)
            }
        }

        return subbed_accounts
    }

    async sendm_sub (message_title, message_content, redirect_link) {                   // User Function
        const message_title_verify = this.message_title_verification(message_title)
        if (message_title_verify[0] === false) {
            throw new Error(`${message_title} does not match word limit. Character Word Limit is ${message_title_verify[1]} instead of 20`)
        } else {
            const message_content_verify = this.message_content_verification(message_content)
            if (message_title_verify[0] === false) {
                throw new Error(`${message_content} does not match word limit. Character Word Limit is ${message_content_verify[1]} instead of 20`)
            } else {
                const notification_title = 'Announcement'
                const notification_content = this.notification_content(message_content)
                const subscribers = await this.fetch_subscribers()
                
                let subscriber_idx = 0
                
                try { 
                    for (subscriber_idx; subscriber_idx <= subscribers.length; subscriber_idx++) {
                        let account = subscribers[subscriber_idx]
                        
                        //console.log(account)
                        const reponse = account = await this._epnssdk.sendNotification(
                            account,
                            message_title,
                            message_content,
                            notification_title,
                            notification_content,
                            1,
                            redirect_link
                        )
                        //console.log(`${account} has been sent the message`)
                        
                    }
                    return true
                } catch (err) {
                    console.log(err)
                    return false
                }
            }   
        }


    }

    notification_content(message_content) {
        const message_content_lst = message_content.split('')
        var resulting_string = ''
        const half_length = message_content_lst / 2
        const message_split_lst = message_content_lst.slice(0, half_length)
        let idx = 0 
        for (idx; idx <= message_split_lst.length; idx++) {
            var letter = message_split_lst[idx]
            resulting_string += letter
        }
        return resulting_string
    }


    message_content_verification (message_content) {
        const message_content_lst = message_content.split('')
        if (message_content_lst.length < 1 || message_content_lst.length > 115) {
            return [false, message_content_lst.length]
        } else {
            return true
        }
    }

    message_title_verification (message_title) {
        const message_title_content = message_title.split('')
        if (message_title_content.length < 1 || message_title.length > 40) {
            return [false, message_title_content.length]
        } else {
            return true
        }
    }

    async fetch_subscribers() {
        const allSubscribers = await this._epnssdk.getSubscribedUsers()
        return allSubscribers
    }
    
    time () {
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth()
        const day = date.getDate()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()
        const date_string = `0${month}/${day}/${year}`
        const time_string = `${hours}:${minutes}:${seconds}`
        return [date_string, time_string]

    }


}


// Test Scripting

// ***** radio has asynchornous nature  *****

exports.radio3_init = function (private_key) {
    const radio = new Radio(private_key)
    return radio
}


// Helper Functions

/*
async function connect_nft(contract_address, network) {
    result = await radio.connect_nft(contract_address, network)
    if (radio.contract_holders.length !== 0) {
        //console.log(result)
        radio.contract_holders = result
        return radio.contract_holders
    }
    //console.log(radio._contract_holders)
}

async function sendm_sub(message_title, message_content, redirect_link) {
    const sub_result = await radio.sendm_sub(message_title, message_content, redirect_link)
    console.log(sub_result)
}
async function sendm_nft(message_title, message_content, redirect_link, network) {
    const sub_result = await radio.sendm_nft(message_title, message_content, redirect_link, network)
    console.log(sub_result)
}

//sendm_sub('Test from Module', 'Test from Module Content', 'www.google.ca')


async function test() {             // Module has Asynchronous Nature
    result = await connect_nft('0xe21ebcd28d37a67757b9bc7b290f4c4928a430b1', 'eth')
    //console.log(result)
    //console.log('------------------------------')
    
}

async function test2() {
    const result = await sendm_nft('Test from Module', 'Test from Module Content', 'www.google.ca', 'eth')
    // return true or false
}

async function test3() {
    const result = sendm_sub('Test from Module', 'Test from Module Content', 'www.google.ca')
}
test()
test3()



//sendm_nft('Test from Module', 'Test from Module Content', 'www.google.ca')
*/