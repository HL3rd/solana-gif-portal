use anchor_lang::prelude::*;

declare_id!("HkFfzg6Mpq6PwDc9ACwNrsPaA1XRFXcE2yLEoWb4qPDr");

#[program]
pub mod myepicproject {
  use super::*;

  pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
    let base_account = &mut ctx.accounts.base_account;
    base_account.total_gifs = 0;
    Ok(())
  }

  pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> ProgramResult {
    let base_account = &mut ctx.accounts.base_account;
    let user = &mut ctx.accounts.user;

    let item = ItemStruct {
      gif_link: gif_link.to_string(),
      user_address: *user.to_account_info().key,
      votes: 0,
    };

    base_account.gif_list.push(item);
    base_account.total_gifs += 1;
    Ok(())
  }

  pub fn delete_gif(ctx: Context<DeleteGif>, gif_link: String) -> ProgramResult {
    let base_account = &mut ctx.accounts.base_account;
    let user = &mut ctx.accounts.user;

    let sent_gif_link = gif_link.to_string();
    let sent_user_address = *user.to_account_info().key;

    let gif_list = &mut base_account.gif_list;

    let index = gif_list.iter().position(|x| (x.user_address == sent_user_address && *x.gif_link == sent_gif_link)).unwrap();
    gif_list.remove(index);

    base_account.total_gifs -= 1;
    Ok(())
  }

  pub fn upvote_gif(ctx: Context<UpvoteGif>, gif_link: String, gif_user_address: String) -> ProgramResult {
    let base_account = &mut ctx.accounts.base_account;

    let sent_gif_link = gif_link.to_string();
    let sent_user_address = gif_user_address.to_string();

    let gif_list = &mut base_account.gif_list;
    let item = gif_list
                .into_iter()
                .find(|x| (x.user_address.to_string() == sent_user_address && *x.gif_link == sent_gif_link))
                .unwrap();
    item.votes += 1;

    Ok(())
  }

  pub fn downvote_gif(ctx: Context<DownvoteGif>, gif_link: String, gif_user_address: String) -> ProgramResult {
    let base_account = &mut ctx.accounts.base_account;

    let sent_gif_link = gif_link.to_string();
    let sent_user_address = gif_user_address.to_string();

    let gif_list = &mut base_account.gif_list;
    let item = gif_list
                .into_iter()
                .find(|x| (x.user_address.to_string() == sent_user_address && *x.gif_link == sent_gif_link))
                .unwrap();
    
    if item.votes > 0 {
      item.votes -= 1;
    }

    Ok(())
  }

}

#[derive(Accounts)]
pub struct StartStuffOff<'info> {
  #[account(init, payer = user, space = 9000)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program <'info, System>,
}

#[derive(Accounts)]
pub struct AddGif<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct DeleteGif<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct UpvoteGif<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
}

#[derive(Accounts)]
pub struct DownvoteGif<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
  pub gif_link: String,
  pub user_address: Pubkey,
  pub votes: u64,
}

#[account]
pub struct BaseAccount {
  pub total_gifs: u64,
  pub gif_list: Vec<ItemStruct>,
}