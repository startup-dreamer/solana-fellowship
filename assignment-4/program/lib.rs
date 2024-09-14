use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
    program_pack::Pack,
};
use spl_token::instruction as token_instruction;

// Define the program ID
solana_program::declare_id!("H2LeuiEaRRqoCzFRWV3dSdAQeiTSHdpvn7aaKbyU7UnJ");

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum VaultInstruction {
    InitializeVault,
    DepositTokens(u64),
    WithdrawTokens(u64),
}

// Entry point of the program
entrypoint!(process_instruction);

// Main processing function
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = VaultInstruction::try_from_slice(instruction_data)?;

    match instruction {
        VaultInstruction::InitializeVault => initialize_vault(program_id, accounts),
        VaultInstruction::DepositTokens(amount) => deposit_tokens(program_id, accounts, amount),
        VaultInstruction::WithdrawTokens(amount) => withdraw_tokens(program_id, accounts, amount),
    }
}

// Initialize the vault
fn initialize_vault(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let vault_account = next_account_info(account_info_iter)?;
    let vault_authority = next_account_info(account_info_iter)?;
    let token_mint = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let rent = Rent::get()?;

    let (vault_pda, _bump_seed) = Pubkey::find_program_address(
        &[b"asset_vault", vault_authority.key.as_ref()],
        program_id,
    );

    if vault_pda != *vault_account.key {
        return Err(ProgramError::InvalidAccountData);
    }

    invoke_signed(
        &system_instruction::create_account(
            vault_authority.key,
            vault_account.key,
            rent.minimum_balance(spl_token::state::Account::LEN),
            spl_token::state::Account::LEN as u64,
            token_program.key,
        ),
        &[vault_authority.clone(), vault_account.clone(), system_program.clone()],
        &[&[b"asset_vault", vault_authority.key.as_ref(), &[_bump_seed]]],
    )?;

    invoke(
        &token_instruction::initialize_account(
            token_program.key,
            vault_account.key,
            token_mint.key,
            vault_account.key,
        )?,
        &[vault_account.clone(), token_mint.clone(), vault_account.clone(), token_program.clone()],
    )?;

    msg!("Vault initialized successfully");
    Ok(())
}

// Deposit tokens into the vault
fn deposit_tokens(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let depositor = next_account_info(account_info_iter)?;
    let depositor_token_account = next_account_info(account_info_iter)?;
    let vault_account = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    let (vault_pda, _bump_seed) = Pubkey::find_program_address(
        &[b"asset_vault", depositor.key.as_ref()],
        program_id,
    );

    if vault_pda != *vault_account.key {
        return Err(ProgramError::InvalidAccountData);
    }

    invoke(
        &token_instruction::transfer(
            token_program.key,
            depositor_token_account.key,
            vault_account.key,
            depositor.key,
            &[],
            amount,
        )?,
        &[
            depositor_token_account.clone(),
            vault_account.clone(),
            depositor.clone(),
            token_program.clone(),
        ],
    )?;

    msg!("Tokens deposited successfully");
    Ok(())
}

// Withdraw tokens from the vault (only allowed for the depositor)
fn withdraw_tokens(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let withdrawer = next_account_info(account_info_iter)?;
    let withdrawer_token_account = next_account_info(account_info_iter)?;
    let vault_account = next_account_info(account_info_iter)?;
    let vault_authority = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    let (vault_pda, bump_seed) = Pubkey::find_program_address(
        &[b"asset_vault", withdrawer.key.as_ref()],
        program_id,
    );

    if vault_pda != *vault_account.key {
        return Err(ProgramError::InvalidAccountData);
    }

    if vault_authority.key != withdrawer.key {
        return Err(ProgramError::InvalidAccountData);
    }

    invoke_signed(
        &token_instruction::transfer(
            token_program.key,
            vault_account.key,
            withdrawer_token_account.key,
            vault_account.key,
            &[],
            amount,
        )?,
        &[
            vault_account.clone(),
            withdrawer_token_account.clone(),
            vault_account.clone(),
            token_program.clone(),
        ],
        &[&[b"asset_vault", withdrawer.key.as_ref(), &[bump_seed]]],
    )?;

    msg!("Tokens withdrawn successfully");
    Ok(())
}