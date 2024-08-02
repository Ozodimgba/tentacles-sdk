import { PublicKey } from "@solana/web3.js";
import { u32, u8, struct, blob, seq, cstr } from "@solana/buffer-layout";
import { publicKey, u64, bool } from "@solana/buffer-layout-utils";

export interface MemberInfo {
  member: PublicKey;
  shares: bigint;
  disburse_cycles: bigint;
  member_token_account: PublicKey;
  unclaimed_amount: bigint;
}

export const MemberInfoLayout = struct<MemberInfo>([
  publicKey("member"),
  u64("shares"),
  u64("disburse_cycles"),
  publicKey("member_token_account"),
  u64("unclaimed_amount"),
]);

export interface SplitWallet {
  authority: PublicKey;
  tentacles: PublicKey;
  name: string;
  mint: PublicKey;
  total_shares: bigint;
  total_members: number;
  last_inflow: bigint;
  total_inflow: bigint;
  token_account: PublicKey;
  remaining_flow: bigint;
  bump_seed: number;
  total_available_shares: bigint;
  disburse_cycles: bigint;
  members: MemberInfo[];
}

export const SplitWalletLayout = struct<SplitWallet>([
  publicKey("authority"),
  publicKey("tentacles"),
  u8("name_len"), // Length of the name string
  cstr("name"), // Adjust the length according to the actual name length
  publicKey("mint"),
  u64("total_shares"),
  u8("total_members"),
  u64("last_inflow"),
  u64("total_inflow"),
  publicKey("token_account"),
  u64("remaining_flow"),
  u8("bump_seed"),
  u64("total_available_shares"),
  u64("disburse_cycles"),
  seq(MemberInfoLayout, 5, "members"), // Adjust length if necessary for your data format
]);
