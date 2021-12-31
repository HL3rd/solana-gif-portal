const anchor = require('@project-serum/anchor');
const { SystemProgram } = anchor.web3;

const main = async() => {
  console.log('🚀 Starting test...');

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.Myepicproject;

  const baseAccount = anchor.web3.Keypair.generate();

  let tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });
  console.log('📝 Your transaction signature', tx);

  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString());

  //----- Call add_gif -----//
  console.log('\n:::: TEST add_gif ::::')
  await program.rpc.addGif("https://media.giphy.com/media/5ug19Fv2bd8U9TycSf/giphy.gif", {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    },
  });

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString());

  console.log('👀 GIF List', account.gifList);

  //----- Call upvote_gif -----//
  console.log('\n:::: TEST upvote_gif ::::')

  console.log('🗳 GIF Votes', account.gifList[0].votes.toString(), account.gifList[0].gifLink.toString());

  await program.rpc.upvoteGif("https://media.giphy.com/media/5ug19Fv2bd8U9TycSf/giphy.gif", provider.wallet.publicKey.toString(), {
    accounts: {
      baseAccount: baseAccount.publicKey,
    },
  });

  console.log('⬆️ GIF Upvoted', account.gifList[0].gifLink.toString());

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('🗳 GIF Votes', account.gifList[0].votes.toString(),  account.gifList[0].gifLink.toString());

  //----- Call downvote_gif -----//
  console.log('\n:::: TEST downvote_gif ::::')

  console.log('🗳 GIF Votes', account.gifList[0].votes.toString(), account.gifList[0].gifLink.toString());

  await program.rpc.downvoteGif("https://media.giphy.com/media/5ug19Fv2bd8U9TycSf/giphy.gif", provider.wallet.publicKey.toString(), {
    accounts: {
      baseAccount: baseAccount.publicKey,
    },
  });

  console.log('⬇️ GIF Downvoted', account.gifList[0].gifLink.toString());

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('🗳 GIF Votes', account.gifList[0].votes.toString(),  account.gifList[0].gifLink.toString());

  console.log('\nTest for non-negative downvotes:');

  await program.rpc.downvoteGif("https://media.giphy.com/media/5ug19Fv2bd8U9TycSf/giphy.gif", provider.wallet.publicKey.toString(), {
    accounts: {
      baseAccount: baseAccount.publicKey,
    },
  });

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('🗳 GIF Votes', account.gifList[0].votes.toString(),  account.gifList[0].gifLink.toString());

  // ----- Call delete_gif ----- //
  console.log("\n:::: TEST delete_gif :::")

  await program.rpc.deleteGif("https://media.giphy.com/media/5ug19Fv2bd8U9TycSf/giphy.gif", {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    },
  });

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString());

  console.log('👀 GIF List', account.gifList);

}

const runMain = async() => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

runMain();
