import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import bs58 from 'bs58';
// Load the IDL
import { Tentacles as Idl } from './idl'
import idl from './idl.json'
import { TransactionBuilder } from './engine';
import * as dotenv from 'dotenv';

dotenv.config()
// Constants
const programId = new PublicKey(process.env.PROGRAM_ID);
const connection = new Connection(process.env.URL_ENDPOINT, 'processed');

// Load the wallet
const sk_string = bs58.decode(process.env.SK)
const sk = Keypair.fromSecretKey(sk_string);


const wallet = new anchor.Wallet(sk)
// Create the provider
const provider = new anchor.AnchorProvider(connection, wallet, {
  preflightCommitment: "processed",
  commitment: "processed"
})

const program = new anchor.Program(idl as Idl, provider)

// Create the program
// const program = new anchor.Program(idl as Tentacles, programId, provider);

// Define the accounts
const mint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export const initializeWallet = async (name) => {

  try {
    const [walletPda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from('split_wallet'), Buffer.from(name)],
      programId
    );
    
    console.log(walletPda.toBase58())


    const walletTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      sk,
      mint,
      walletPda,
      true, // allow owner off curve
      "processed"
    );

    const recentBlockhash = (
      await program.provider.connection.getLatestBlockhash()
    ).blockhash;

    //console.log(walletTokenAccount.address.toBase58());

    //console.log(anchor.web3.SystemProgram.programId.toBase58());
    const ix = await program.methods
      .initializeWallet(name, new anchor.BN(100), bump)
      .accounts({
        wallet: walletPda,
        walletTokenAccount: walletTokenAccount.address,
        mint: mint,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([wallet.payer]) // Ensure the correct signer is provided
      .instruction();

     const tx = await TransactionBuilder.create(program, [ix], process.env.URL_ENDPOINT)
      .setBlockhash(recentBlockhash)
      .setComputeLimitMultiple(1.2)
      .setAutoComputeUnitPrice("high")
      .then((builder: TransactionBuilder) => builder.setAutoComputeUnitLimit())
      .then((builder: TransactionBuilder) => builder.build());

      tx.sign([wallet.payer]);     

      const sig = await connection.sendTransaction(tx);
      console.log("Transaction signature:", sig);
  } catch (error) {
    console.error('Error initializing wallet:', error);
  }
};

export const addMember = async (name, memberPubkey: String, share) => {
  try {
    const shares = new anchor.BN(share);
    const member = new PublicKey(memberPubkey); // Replace with the actual member public key
    // console.log(Keypair.generate().publicKey.toBase58())
    // Fetch the wallet account
    const [walletPda, _bump] = await PublicKey.findProgramAddress(
      [Buffer.from('split_wallet'), Buffer.from(name)],
      programId
    );
    // Find the member's associated token account
    const memberTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      sk,
      mint,
      member,
      true // allow owner off curve
    );

    console.log(memberTokenAccount.address);
    // Add the member using the program's method
    const ix = await program.methods
      .addMember(shares)
      .accounts({
        wallet: walletPda,
        member: member,
        memberTokenAccount: memberTokenAccount.address,
        authority: provider.wallet.publicKey,
        mint: mint,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([sk]) // Ensure the correct signer is provided
      .instruction();

      const recentBlockhash = (
        await program.provider.connection.getLatestBlockhash()
      ).blockhash;

      const tx = await TransactionBuilder.create(program, [ix], process.env.URL_ENDPOINT)
      .setBlockhash(recentBlockhash)
      .setComputeLimitMultiple(1.2)
      .setAutoComputeUnitPrice("high")
      .then((builder: TransactionBuilder) => builder.setAutoComputeUnitLimit())
      .then((builder: TransactionBuilder) => builder.build());

      tx.sign([sk]);     

      const sig = await connection.sendTransaction(tx);

    console.log('Transaction signature:', sig);
  } catch (error) {
    console.error('Error adding member:', error);
  }
};

export const distribute = async (name) => {
  const [walletPda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('split_wallet'), Buffer.from(name)],
    programId
  );

  console.log(walletPda.toBase58())

  const walletTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sk,
    mint,
    walletPda,
    true // allow owner off curve
  );

  // constrain here => if current balance is zero == don't distribute
  
  // console.log(walletTokenAccount.address.toBase58())
  const member = new PublicKey('5PS1SMShnGPJzad6pAnPMHiRTNqR9RXFyLKaNsCVHh3F');


  const memberTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sk,
    mint,
    member,
    true // allow owner off curve
  );

  //console.log(memberTokenAccount.address.toBase58());

  const ix = await program.methods
    .distribute(member)
    .accounts({
      wallet: walletPda,
      pdaAsAuthority: walletPda,
      walletTokenAccount: walletTokenAccount.address,
      memberTokenAccount: memberTokenAccount.address,
      wallet_authority: provider.wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      mint: mint,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .signers([])
    .instruction();

    const recentBlockhash = (
      await program.provider.connection.getLatestBlockhash()
    ).blockhash;

    const tx = await TransactionBuilder.create(program, [ix], process.env.URL_ENDPOINT)
      .setBlockhash(recentBlockhash)
      .setComputeLimitMultiple(1.2)
      .setAutoComputeUnitPrice("low")
      .then((builder: TransactionBuilder) => builder.setAutoComputeUnitLimit())
      .then((builder: TransactionBuilder) => builder.build());

      tx.sign([wallet.payer]);     

      const sig = await connection.sendTransaction(tx);
      console.log("Transaction signature:", sig);
};



// // Call the functions
// (async () => {
//    const name = 'Test-6';
//   //  await initializeWallet(name)
//   //  .then(async () => {
//     await addMember(name, 'Ee79adtuYt4ecrJ6NFP8WF7FTcMb5hDuxRwLHsdu4VQM', 98);
//     await addMember(name, 'FxmGwcJW4fQQboEETbYrfMGKebKdEyW1HXiMMShWXbCj', 1);
//     await addMember(name, '5PS1SMShnGPJzad6pAnPMHiRTNqR9RXFyLKaNsCVHh3F', 1);
//   //  });
   
//   //  await distribute(name);

  
// })();
