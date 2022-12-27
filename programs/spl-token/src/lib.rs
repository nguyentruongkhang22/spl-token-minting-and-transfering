use anchor_lang::prelude::*;
use anchor_spl::token::{Transfer, MintTo};
pub mod state;
pub mod context;

use crate::state::*;
use crate::context::*;

declare_id!("GbTWSq7vQKbXeHc9dMcugHK9wkogBLoSrpKGei42isfX");

#[program]
pub mod spl_token {
    use anchor_spl::token;

    use super::*;

    pub fn transfer_token(ctx: Context<TransferToken>, ) -> Result<()> {
        let transfer_instruction = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.from_authority.to_account_info()
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, transfer_instruction);

        anchor_spl::token::transfer(cpi_ctx, 5)?;

        Ok(())
    }

    pub fn mint_token(ctx: Context<MintToken>) -> Result<()> {
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info()
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::mint_to(cpi_ctx, 10)?;
        Ok(())
    }

}

