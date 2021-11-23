import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = 'HL3rd_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
  'https://media.giphy.com/media/LumPnAI0GQgby8yKW2/giphy.gif',
	'https://media.giphy.com/media/aX5KEfKKzyGjBbYPjE/giphy.gif',
	'https://media.giphy.com/media/0rRB6Wn4iipsZwNBj6/giphy.gif',
	'https://media.giphy.com/media/xBXWbB1p0WfQraQP6k/giphy.gif'
]

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

  const sendGif = async() => {
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue);
    } else {
      console.log('Empty inut. Try again.');
    }
  }

  const renderConnectedContainer = () => (
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
        <button type="submit" className="cta-button submit-gif-button">Submit</button>
      </form>
      <div className="gif-grid">
        {gifList.map(gif => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      
      // TODO: Call Solana program here

      setGifList(TEST_GIFS);
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
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
