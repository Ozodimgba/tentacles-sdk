import { Idl } from "@coral-xyz/anchor";

export interface Tentacles extends Idl {
  "address": "6gswY98TSzTsTWY96ZBtKAVhfsYuwp62kQ1Wgop8BnHf",
  "metadata": {
    "name": "tentacles",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "initializeWallet",
      "discriminator": [
        213,
        0,
        239,
        240,
        73,
        100,
        188,
        193
      ],
      "accounts": [
        {
          "name": "wallet",
          "writable": true
        },
        {
          "name": "walletTokenAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "rent"
        },
        {
          "name": "associatedTokenProgram"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "total_shares",
          "type": "u64"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "addMember",
      "discriminator": [
        13,
        116,
        123,
        130,
        126,
        198,
        57,
        34
      ],
      "accounts": [
        {
          "name": "wallet",
          "writable": true
        },
        {
          "name": "member"
        },
        {
          "name": "memberTokenAccount",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "rent"
        },
        {
          "name": "associatedTokenProgram"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "shares",
          "type": "u64"
        }
      ]
    },
    {
      "name": "distribute",
      "discriminator": [
        191,
        44,
        223,
        207,
        164,
        236,
        126,
        61
      ],
      "accounts": [
        {
          "name": "wallet",
          "writable": true
        },
        {
          "name": "pdaAsAuthority"
        },
        {
          "name": "walletTokenAccount",
          "writable": true
        },
        {
          "name": "memberTokenAccount",
          "writable": true
        },
        {
          "name": "wallet_authority",
          "signer": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "mint"
        },
        {
          "name": "rent"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "associatedTokenProgram"
        }
      ],
      "args": [
        {
          "name": "member_pubkey",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "SplitWallet",
      "discriminator": [
        213,
        93,
        230,
        188,
        40,
        221,
        207,
        68
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "BadArtithmetic",
      "msg": "Encountered an arithmetic error"
    },
    {
      "code": 6001,
      "name": "DerivedKeyInvalid",
      "msg": "DerivedKeyInvalid"
    },
    {
      "code": 6002,
      "name": "MaxMembersReached",
      "msg": "MaxMembersReached"
    },
    {
      "code": 6003,
      "name": "NotEnoughAvailableShares",
      "msg": "NotEnoughAvailableShares"
    },
    {
      "code": 6004,
      "name": "InvalidAccountData",
      "msg": "InvalidAccountData"
    },
    {
      "code": 6005,
      "name": "InvalidArgument",
      "msg": "InvalidArgument"
    },
    {
      "code": 6006,
      "name": "InvalidMemberTokenAccount",
      "msg": "InvalidMemberTokenAccount"
    },
    {
      "code": 6007,
      "name": "MintMismatch",
      "msg": "Mint mismatch between wallet and member ata"
    },
    {
      "code": 6008,
      "name": "DoubleMember",
      "msg": "Member cannot be added twice"
    },
    {
      "code": 6009,
      "name": "RemainingFlowNotZero",
      "msg": "Wallet is still has to disburse to other members for current cycle"
    },
    {
      "code": 6010,
      "name": "UnclaimedAmountExists",
      "msg": "UnclaimedAmountExists"
    }
  ],
  "types": [
    {
      "name": "MemberInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "member",
            "type": "pubkey"
          },
          {
            "name": "shares",
            "type": "u64"
          },
          {
            "name": "disburse_cycles",
            "type": "u64"
          },
          {
            "name": "member_token_account",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "SplitWallet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "tentacles",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "total_shares",
            "type": "u64"
          },
          {
            "name": "total_members",
            "type": "u8"
          },
          {
            "name": "last_inflow",
            "type": "u64"
          },
          {
            "name": "total_inflow",
            "type": "u64"
          },
          {
            "name": "token_account",
            "type": "pubkey"
          },
          {
            "name": "remaining_flow",
            "type": "u64"
          },
          {
            "name": "bump_seed",
            "type": "u8"
          },
          {
            "name": "total_available_shares",
            "type": "u64"
          },
          {
            "name": "disburse_cycles",
            "type": "u64"
          },
          {
            "name": "members",
            "type": {
              "vec": {
                "defined": {
                  "name": "MemberInfo"
                }
              }
            }
          }
        ]
      }
    }
  ]
}