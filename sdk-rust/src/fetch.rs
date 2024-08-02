use std::env;
use anchor_client::solana_client::rpc_filter::RpcFilterType;
use dotenv::dotenv;
use anchor_client::anchor_lang::prelude::*;
use anchor_client::Program;
use anchor_client::solana_sdk::pubkey::Pubkey;
use anchor_client::{solana_sdk::{
    signature::{Keypair},
    system_program,
},
Client, Cluster, ClientError};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use std::rc::Rc;
use tentacles::state::SplitWallet;

pub async fn get_wallet(
    wallet: Pubkey,
) -> Result<SplitWallet> {
    // program instance -> 
    dotenv().ok();
    let payer_sk = env::var("PAYER_BASE58").expect("PAYER_BASE58 must be set in .env file");
    let payer = Keypair::from_base58_string(&payer_sk);
    let client = Client::new(Cluster::Mainnet, Rc::new(payer));

    // Create program
    let program = client.program(tentacles::ID).unwrap();
    // Fetch the account data
    let account_data: std::result::Result<SplitWallet, ClientError> = program.account::<SplitWallet>(wallet).await;
    
    // Return the price field from the deserialized struct
    Ok(account_data.unwrap())
}

pub async fn get_all_wallets() -> std::result::Result<Vec<SplitWallet>, ClientError> {
    // program instance -> 
    dotenv().ok();
    let payer_sk = env::var("PAYER_BASE58").expect("PAYER_BASE58 must be set in .env file");
    let payer = Keypair::from_base58_string(&payer_sk);

    let rpc_url = env::var("RPC_URL").expect("RPC_URL must be set");
    let ws_url = env::var("WS_URL").expect("WS_URL must be set");
    let client = Client::new(Cluster::Custom(rpc_url, ws_url), Rc::new(payer));

    // Create program
    let program = client.program(tentacles::ID).unwrap();

    let data_size = std::mem::size_of::<SplitWallet>() as u64;
    let filters = vec![RpcFilterType::DataSize(data_size)];
    // Fetch the account data
    let account_data: std::result::Result<Vec<(Pubkey, SplitWallet)>, ClientError> = program.accounts::<SplitWallet>(filters).await;
    println!("Fetched accounts result: {:?}", account_data); 
    // Return the price field from the deserialized struct
    match account_data {
        Ok(accounts) => Ok(accounts.into_iter().map(|(_, account)| account).collect()),
        Err(e) => Err(e),
    }
}
