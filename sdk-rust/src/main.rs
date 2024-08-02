use std::str::FromStr;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use anchor_client::solana_sdk::pubkey::Pubkey;
use tentacles::state::{MemberInfo, SplitWallet};
use serde::{Deserialize, Serialize};
mod fetch;
use fetch::get_wallet;


#[derive(Deserialize)]
struct WalletRequest {
    public_key: String,
}


#[derive(Serialize)]
struct SerializableSplitWallet {
    authority: String,
    tentacles: String,
    name: String,
    mint: String,
    total_shares: u64,
    total_members: u8,
    last_inflow: u64,
    total_inflow: u64,
    token_account: String,
    remaining_flow: u64,
    bump_seed: u8,
    total_available_shares: u64,
    disburse_cycles: u64,
    members: Vec<SerializableMemberInfo>,
}

#[derive(Serialize)]
struct SerializableMemberInfo {
    member: String,
    shares: u64,
    disburse_cycles: u64,
    member_token_account: String,
}

impl From<SplitWallet> for SerializableSplitWallet {
    fn from(wallet: SplitWallet) -> Self {
        SerializableSplitWallet {
            authority: wallet.authority.to_string(),
            tentacles: wallet.tentacles.to_string(),
            name: wallet.name,
            mint: wallet.mint.to_string(),
            total_shares: wallet.total_shares,
            total_members: wallet.total_members,
            last_inflow: wallet.last_inflow,
            total_inflow: wallet.total_inflow,
            token_account: wallet.token_account.to_string(),
            remaining_flow: wallet.remaining_flow,
            bump_seed: wallet.bump_seed,
            total_available_shares: wallet.total_available_shares,
            disburse_cycles: wallet.disburse_cycles,
            members: wallet.members.into_iter().map(SerializableMemberInfo::from).collect(),
        }
    }
}

impl From<MemberInfo> for SerializableMemberInfo {
    fn from(member: MemberInfo) -> Self {
        SerializableMemberInfo {
            member: member.member.to_string(),
            shares: member.shares,
            disburse_cycles: member.disburse_cycles,
            member_token_account: member.member_token_account.to_string(),
        }
    }
}

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/fetch_wallet")]
async fn fetch_wallet(req_body: web::Json<WalletRequest>) -> impl Responder {

    match Pubkey::from_str(&req_body.public_key) {
        Ok(wallet) => match get_wallet(wallet).await {
            Ok(fetch_wallet) => {
                let serializable_wallet = SerializableSplitWallet::from(fetch_wallet);
                let json_response = serde_json::to_string(&serializable_wallet).expect("Failed to serialize wallet");
                HttpResponse::Ok().body(json_response)
            },
            Err(err) => HttpResponse::InternalServerError().body(format!("Error fetching wallet: {:?}", err)),
        },
        Err(_) => HttpResponse::BadRequest().body("Invalid Public Key String"),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(fetch_wallet)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}