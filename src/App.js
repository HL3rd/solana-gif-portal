import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import trashIcon from './assets/trash-white.svg';
import upvoteIcon from './assets/up-arrow-white.svg';
import downvoteIcon from './assets/down-arrow-white.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

import idl from './idl.json';
import kp from './keypair.json';

import './App.css';

const { SystemProgram } = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
}

const TWITTER_HANDLE = 'HL3rd_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
        } 
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
        const response = await solana.connect();
        const pubKey = response.publicKey.toString();
        console.log('Connected with Public Key:', pubKey);
        setWalletAddress(pubKey);
    } else {
      window.open("https://phantom.app/", "_blank");
    }
  };

  const disconnectWallet = async() => {
    const { solana } = window;

    if (solana) {
      await solana.disconnect();
      console.log('Disconnected wallet:', walletAddress);
      setWalletAddress(null);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
      >
        Connect to Wallet
      </button>
  );

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString());
      await getGifList();

    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  }

  // CvSNiPmFm1nyxkF9ayqXDe1hFD2JHjbWcJwodUYNSCJ4

  const sendGif = async() => {
    if (inputValue.length === 0) {
      console.log("No gif link given!");
      return;
    }
    setInputValue('');
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      console.log("GIF successfully sent to program", inputValue);

      await getGifList();

    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  }

  const deleteGif = async(gifLink, itemAddress) => {
    
    if (walletAddress !== itemAddress) {
      console.log("Not authorized to delete!");
      return;
    }
    console.log('Gif link:', gifLink);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.deleteGif(gifLink, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      console.log("GIF successfully deleted via program", gifLink);

      await getGifList();

    } catch (error) {
      console.log("Error deleting GIF:", error);
    }
  }

  const upvoteGif = async(gifLink, gifUserAddress) => {
    
    console.log('Gif link:', gifLink);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.upvoteGif(gifLink, gifUserAddress, {
        accounts: {
          baseAccount: baseAccount.publicKey,
        }
      });
      console.log("GIF successfully upvoted via program", gifLink, gifUserAddress);

      await getGifList();

    } catch (error) {
      console.log("Error upvoting GIF:", error);
    }
  }

  const downvoteGif = async(votes, gifLink, gifUserAddress) => {

    if (votes <= 0) { return }

    console.log('Gif link:', gifLink);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.downvoteGif(gifLink, gifUserAddress, {
        accounts: {
          baseAccount: baseAccount.publicKey,
        }
      });
      console.log("GIF successfully downvoted via program", gifLink, gifUserAddress);

      await getGifList();

    } catch (error) {
      console.log("Error downvoting GIF:", error);
    }
  }

  const renderConnectedContainer = () => {

    if (gifList === null) {
      return(
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization for GIF Program Account
          </button>
        </div>
      )
    } else {
      return (
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendGif();
            }}
          >
            <input
              type="text"
              placeholder="Enter gif link!"
              value={inputValue}
              onChange={onInputChange}
            />
            <button type="submit" className="cta-button submit-gif-button">
              Submit
            </button>
          </form>
          <div className="gif-grid">
            {gifList.map((item, index) => (
              <div className="gif-item" key={index}>
                {(walletAddress && walletAddress === item.userAddress.toString()) && 
                  <button
                    className="delete-button"
                    onClick={(event) => {
                      event.preventDefault();
                      deleteGif(item.gifLink, item.userAddress.toString());
                    }}
                  >
                    <img alt="trash can" className="delete-icon" src={trashIcon} />
                  </button>
                }
                <img src={item.gifLink} alt={index} />
                <div className="gif-details">
                  <img
                    className="arrow upvote-arrow"
                    alt="upvote"
                    onClick={(event) => {
                      event.preventDefault();
                      upvoteGif(item.gifLink, item.userAddress.toString());
                    }}
                    src={upvoteIcon}
                  />
                  <p className="detail">{item.votes.toString()}</p>
                  <img
                    className="arrow downvote-arrow"
                    alt="downvote"
                    onClick={(event) => {
                      event.preventDefault();
                      downvoteGif(item.votes, item.gifLink, item.userAddress.toString());
                    }}
                    src={downvoteIcon}
                  />
                  <p className="detail">{shortenedAddress(item.userAddress.toString())}</p>
                </div>
              </div>
            ))}
            </div>
          </div>
      )
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account);
      setGifList(account.gifList);

    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  }

  const shortenedAddress = (address) => {
    const lastFour = address.substr(address.length - 4);
    return address.substring(0,4) + "..." + lastFour;
  }

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      getGifList();
    }
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  return (
    <div className="App">
      <div className="container">

        <div className="header-container">
          {walletAddress && 
          <button
            className="cta-button disconnect-wallet-button"
            onClick={disconnectWallet}>
              Disconnect: {shortenedAddress(walletAddress)}
          </button>}
          <p className="header">🖼 Degen Memes Portal</p>
          <p className="sub-text">
            Degen meme GIFs ✨ in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
