use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("EbNFQpCGVTbJSvL7bvXrsjfkd4Z9GMZPrjFt6GEzRbfr");

#[program]
mod asset_manager_vault {
    use super::*;

    pub fn create_vault(ctx: Context<CreateVault>) -> Result<()> {
        msg!("Creating asset manager vault");
        let vault = &mut ctx.accounts.vault_account;
        vault.asset_manager = ctx.accounts.asset_manager.key();
        vault.token_mints = Vec::new();
        vault.balances = Vec::new();
        Ok(())
    }

    pub fn deposit_tokens(ctx: Context<DepositTokens>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault_account;
        let token_mint = ctx.accounts.token_mint.key();

        if let Some(index) = vault.token_mints.iter().position(|&m| m == token_mint) {
            vault.balances[index] = vault.balances[index].checked_add(amount).unwrap();
        } else {
            vault.token_mints.push(token_mint);
            vault.balances.push(amount);
        }

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.customer_token_account.to_account_info(),
                    to: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.customer.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    pub fn withdraw_tokens(ctx: Context<WithdrawTokens>, amount: u64) -> Result<()> {
        if ctx.accounts.withdrawer.key() == ctx.accounts.vault_account.asset_manager {
            return Err(ErrorCode::AssetManagerCannotWithdraw.into());
        }

        let vault = &mut ctx.accounts.vault_account;
        let token_mint = ctx.accounts.token_mint.key();

        if let Some(index) = vault.token_mints.iter().position(|&m| m == token_mint) {
            if vault.balances[index] < amount {
                return Err(ErrorCode::InsufficientFunds.into());
            }
            vault.balances[index] -= amount;

            let vault_bump = ctx.bumps.vault_account;
            let asset_manager_key = vault.asset_manager.key();
            let seeds = &[b"vault", asset_manager_key.as_ref(), &[vault_bump]];

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.vault_token_account.to_account_info(),
                        to: ctx.accounts.recipient_token_account.to_account_info(),
                        authority: vault.to_account_info(),
                    },
                    &[seeds],
                ),
                amount,
            )?;

            let current_balance = vault.balances[index];
            if current_balance == 0 {
                vault.token_mints.remove(index);
                vault.balances.remove(index);
            }
        } else {
            return Err(ErrorCode::TokenNotFound.into());
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(mut)]
    pub asset_manager: Signer<'info>,
    #[account(
        init,
        payer = asset_manager,
        seeds = [b"vault", asset_manager.key().as_ref()],
        bump,
        space = 8 + 32 + (32 * 10) + (8 * 10)
    )]
    pub vault_account: Account<'info, VaultState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositTokens<'info> {
    pub customer: Signer<'info>,
    #[account(mut)]
    pub customer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub vault_account: Account<'info, VaultState>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault_account.asset_manager.key().as_ref()],
        bump,
    )]
    pub vault_account: Account<'info, VaultState>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub token_mint: Account<'info, Mint>,
    pub withdrawer: Signer<'info>,
}

#[account]
pub struct VaultState {
    pub asset_manager: Pubkey,
    pub token_mints: Vec<Pubkey>,
    pub balances: Vec<u64>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The asset manager cannot withdraw funds")]
    AssetManagerCannotWithdraw,
    #[msg("Token not found in the vault")]
    TokenNotFound,
    #[msg("Insufficient funds for withdrawal")]
    InsufficientFunds,
}
