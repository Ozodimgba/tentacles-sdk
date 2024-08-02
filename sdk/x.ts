import {
    TransactionInstruction,
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
  } from "@solana/web3.js";
  import { Program } from "@coral-xyz/anchor";
  import * as anchor from "@coral-xyz/anchor";
  import {
    VersionedTransaction,
    TransactionMessage,
    AddressLookupTableAccount,
    ComputeBudgetProgram,
  } from "@solana/web3.js";
  import bs58 from "bs58";
import { Tentacles } from "./idl";
  
  export class TransactionBuilder {
    private program: Program<Tentacles>;
    private heliusUrl?: string;
    private blockhash: string = "";
    private computeUnitLimit: number = 1_400_000;
    private computeUnitLimitMultiple: number = 1;
    private computeUnitPrice: number = 0;
    private setAutoComputeUnitMultiple?: number = undefined;
    private ixs: Array<TransactionInstruction>;
    private lookupTables: Array<AddressLookupTableAccount>;
  
    constructor(
      program: Program<Tentacles>,
      ixs: Array<TransactionInstruction>,
      heliusUrl?: string,
      lookupTables?: Array<AddressLookupTableAccount>
    ) {
      this.program = program;
      this.ixs = ixs;
      this.heliusUrl = heliusUrl;
      this.lookupTables = lookupTables ?? [];
      console.log(`heliusUrl: ${this.heliusUrl}`);
    }
  
    static create(
      program: Program<Tentacles>,
      ixs: Array<TransactionInstruction>,
      heliusUrl?: string,
      lookupTables?: Array<AddressLookupTableAccount>
    ): TransactionBuilder {
      return new TransactionBuilder(program, ixs, heliusUrl, lookupTables);
    }
  
    setComputeLimitMultiple(multiple: number): TransactionBuilder {
      this.computeUnitLimitMultiple = multiple;
      return this;
    }
  
    setComputeUnitLimit(limit: number): TransactionBuilder {
      this.computeUnitLimit = limit;
      return this;
    }
  
    setComputeUnitPrice(price: number): TransactionBuilder {
      this.computeUnitPrice = price;
      return this;
    }
  
    setBlockhash(blockhash: string): TransactionBuilder {
      this.blockhash = blockhash;
      return this;
    }
  
    async setAutoComputeUnitLimit(): Promise<TransactionBuilder> {
      const ixs = this.ixs;
      const lookupTables = this.lookupTables;
      const program = this.program;
      const computeUnitLimitMultiple = this.computeUnitLimitMultiple;
      const computeUnitPrice = this.computeUnitPrice;
      const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: computeUnitPrice,
      });
      const simulationComputeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 1_400_000,
      });
      let recentBlockhash = this.blockhash;
      if (recentBlockhash === "") {
        recentBlockhash = (await program.provider.connection.getLatestBlockhash())
          .blockhash;
      }
      const simulateMessageV0 = new TransactionMessage({
        recentBlockhash,
        instructions: [priorityFeeIx, simulationComputeLimitIx, ...ixs],
        payerKey: program.provider.publicKey!,
      }).compileToV0Message(lookupTables);
      const simulationResult =
        await program.provider.connection.simulateTransaction(
          new VersionedTransaction(simulateMessageV0),
          {
            commitment: "processed",
            sigVerify: false,
          }
        );
      const simulationUnitsConsumed = simulationResult.value.unitsConsumed!;
      console.log(`simulationUnitsConsumed: ${simulationUnitsConsumed}`);
      this.computeUnitLimit = Math.floor(
        simulationUnitsConsumed * computeUnitLimitMultiple
      );
      console.log(`computeUnitLimit: ${this.computeUnitLimit}`);
      return this;
    }
  
    async setAutoComputeUnitPrice(
      level: "min" | "low" | "medium" | "high" | "veryHigh" | "unsafeMax"
    ): Promise<TransactionBuilder> {
      if ((this.heliusUrl ?? "") === "") {
        throw new Error("Helius URL is not set");
      }
      if (this.blockhash === "") {
        this.blockhash = (
          await this.program.provider.connection.getLatestBlockhash()
        ).blockhash;
      }
      console.log(`ixs.length: ${this.ixs.length}`);
      const simulateMessageV0 = new TransactionMessage({
        recentBlockhash: this.blockhash,
        instructions: this.ixs,
        payerKey: this.program.provider.publicKey!,
      }).compileToV0Message(this.lookupTables);
      const transaction = new VersionedTransaction(simulateMessageV0);
      const response = await fetch(this.heliusUrl!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `${Math.floor(Math.random() * 100_000_000)}`,
          method: "getPriorityFeeEstimate",
          params: [
            {
              transaction: bs58.encode(transaction.serialize()),
              options: { includeAllPriorityFeeLevels: true },
            },
          ],
        }),
      });
      const data = await response.json();
      this.computeUnitPrice = Math.floor(data.result.priorityFeeLevels[level]);
      console.log(`computeUnitPrice: ${this.computeUnitPrice}`);
      return this;
    }
  
    build(): VersionedTransaction {
      let recentBlockhash = this.blockhash;
      const microLamports = this.computeUnitPrice;
      const units = this.computeUnitLimit;
      if (recentBlockhash === "") {
        throw new Error("Blockhash is not set");
      }
      const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports,
      });
      const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({ units });
      const messageV0 = new TransactionMessage({
        recentBlockhash,
        instructions: [priorityFeeIx, computeLimitIx, ...this.ixs],
        payerKey: this.program.provider.publicKey!,
      }).compileToV0Message(this.lookupTables);
      console.log(`computeUnitPrice: ${this.computeUnitPrice}`);
      console.log(`computeUnitLimit: ${this.computeUnitLimit}`);
      return new VersionedTransaction(messageV0);
    }
  }

  