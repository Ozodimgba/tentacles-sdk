use std::env;
use dotenv::dotenv;
use anchor_client::anchor_lang::prelude::*;
use anchor_client::solana_sdk::pubkey::Pubkey;
use anchor_client::{solana_sdk::
    signature::Keypair,
Client, Cluster, ClientError};
use std::rc::Rc;
use tentacles::state::SplitWallet;

pub async fn get_wallet(
    wallet: Pubkey,
) -> Result<SplitWallet> {
    // program instance -> 
    dotenv().ok();
    let payer_sk = env::var("PAYER_BASE58").expect("PAYER_BASE58 must be set in .env file");
    let payer = Keypair::from_base58_string(&payer_sk);

    // Load the USE_MAINNET environment variable
    let use_mainnet = env::var("USE_MAINNET")
        .unwrap_or_else(|_| "false".to_string())
        .parse::<bool>()
        .expect("USE_MAINNET must be a boolean value");

    let cluster = if use_mainnet {
            Cluster::Mainnet
        } else {
            Cluster::Devnet
        };

    let client = Client::new(cluster, Rc::new(payer));

    // Create program
    let program = client.program(tentacles::ID).unwrap();
    // Fetch the account data
    let account_data: std::result::Result<SplitWallet, ClientError> = program.account::<SplitWallet>(wallet).await;
    
    // Return the price field from the deserialized struct
    Ok(account_data.unwrap())
}

