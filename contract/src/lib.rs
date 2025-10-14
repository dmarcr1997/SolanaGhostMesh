use anchor_lang::prelude::*;

declare_id!("2Jd2XiHwWKcvynNNMbtQWxA4s2vR3Wu1ii2dZewEnK7j");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod device_attestation {
    use super::*;

    pub fn submit_attestation(
        ctx: Context<SubmitAttestation>,
        device_pubkey: Pubkey,
        ipfs_cid: String,
        timestamp: i64,
    ) -> Result<()> {
        msg!("Adding new device to: {}", ctx.program_id);
        let attestation = &mut ctx.accounts.device_attestation;
        attestation.device_pubkey = device_pubkey;
        attestation.ipfs_cid = ipfs_cid;
        attestation.timestamp = timestamp;
        attestation.verified = false;
        Ok(())
    }

    pub fn verify_device(ctx: Context<VerifyDevice>) -> Result<()> {
        msg!(
            "VERIFIED: {:#?}",
            ctx.accounts.device_attestation.device_pubkey.key().as_ref()
        );
        ctx.accounts.device_attestation.verified = true;
        Ok(())
    }

    pub fn add_whitelist(ctx: Context<ModifyWhitelist>, new_viewer: Pubkey) -> Result<()> {
        let attestation = &mut ctx.accounts.device_attestation;
        msg!(
            "UPDATED WHITELIST({:#?}) with: {}",
            &attestation.device_pubkey.key().as_ref(),
            &new_viewer
        );
        require!(
            ctx.accounts.owner.key() == attestation.device_pubkey,
            CustomError::Unauthorized
        );
        attestation.whitelist.push(new_viewer);
        Ok(())
    }
    pub fn remove_whitelist(ctx: Context<ModifyWhitelist>, target: Pubkey) -> Result<()> {
        let attestation = &mut ctx.accounts.device_attestation;

        msg!(
            "UPDATED WHITELIST({:#?}) with: {}",
            &attestation.device_pubkey.key().as_ref(),
            &target
        );
        require!(
            ctx.accounts.owner.key() == attestation.device_pubkey,
            CustomError::Unauthorized
        );
        attestation.whitelist.retain(|&key| key != target);
        Ok(())
    }

}

#[account]
#[derive(InitSpace)]
pub struct DeviceAttestation {
    pub device_pubkey: Pubkey,
    #[max_len(64)]
    pub ipfs_cid: String,
    pub timestamp: i64,
    pub verified: bool,
    #[max_len(10)]
    pub whitelist: Vec<Pubkey>,
}

#[derive(Accounts)]
pub struct SubmitAttestation<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        space = ANCHOR_DISCRIMINATOR_SIZE + DeviceAttestation::INIT_SPACE,
        seeds = [b"attestation", payer.key().as_ref()],
        bump
    )]
    pub device_attestation: Account<'info, DeviceAttestation>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyDevice<'info> {
    #[account(mut)]
    pub verifier: Signer<'info>,
    #[account(
        mut,
        seeds = [b"attestation", device_attestation.device_pubkey.key().as_ref()],
        bump
    )]
    pub device_attestation: Account<'info, DeviceAttestation>,
}

#[derive(Accounts)]
pub struct ModifyWhitelist<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"attestation", device_attestation.device_pubkey.key().as_ref()],
        bump
    )]
    pub device_attestation: Account<'info, DeviceAttestation>,
}

#[error_code]
pub enum CustomError {
    #[msg("You are not authorized to modify this whitelist")]
    Unauthorized,
}
