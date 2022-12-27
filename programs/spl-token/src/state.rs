use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Token {
    idx: u64,
    user_sending: Pubkey,
    user_receiving: Pubkey,
    mint_of_token_being_sent: Pubkey,
    escrow_wallet: Pubkey,
    amount_tokens: u64,
    stage: u8
}

// pub struct MintTo<'info> {
//     pub mint: AccountInfo<'info>,
//     pub to: AccountInfo<'info>,
//     pub authority: AccountInfo<'info>,
// }

// pub struct Transfer<'info> {
//     pub from: AccountInfo<'info>,
//     pub to: AccountInfo<'info>,
//     pub authority: AccountInfo<'info>,
// }