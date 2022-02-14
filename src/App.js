import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import idl from "./idl.json";
import kp from './keypair.json'

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram} = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);

  const onInputChange = (e) => {
    const { value } = e.target;
    setInputValue(value);
    console.log(inputValue);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  const sendGif = async () => {
    if(inputValue===0)
    {
      console.log("No Gif link given")
      return
    }
    setInputValue("")
    console.log("Gif Link: ", inputValue)
    try{
      const provider = getProvider()
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      console.log("Gif successfully sent to program", inputValue)
      await getGifList();

    }
    catch(error) {
      console.log("Error sending Gif: ", error)
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found");
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            "Connected with Public Key:",
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        console.log("Get a Phantom Wallet nerd");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
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

  const TEST_GIFS = [
    "https://media0.giphy.com/media/xT0xeknwLbwR5srUvm/giphy.gif?cid=ecf05e47w1cl9lyzw5rnu8x30kjqvr7zm0g2qk9cdqmzfbnb&rid=giphy.gif&ct=g",
    "https://media2.giphy.com/media/e0Qgu8zrZlBZu/giphy.gif?cid=ecf05e47ew2kxjwq0lzo2hb7e5lirh862u6a1a00z3ya7y9z&rid=giphy.gif&ct=g",
    "https://media4.giphy.com/media/DaqTYeahY9b44/giphy.gif?cid=ecf05e47e7dr0rmrqw5o2pcylp1y71vmg3thoxesao3rinsg&rid=giphy.gif&ct=g",
    "https://media1.giphy.com/media/FTSQZtKypegso/giphy.gif?cid=ecf05e47xa0dzi2qkpjsavu5w8ldk3udcbcxt1y96bq9t522&rid=giphy.gif&ct=g",
    "https://media3.giphy.com/media/OBNCjyMRf1UMU/giphy.gif?cid=ecf05e47futc9t540spfdd3kv676hem8okvc72fe3qbphkhh&rid=giphy.gif&ct=g",
    "https://media3.giphy.com/media/x7ocQZV6ucXYeW5hUW/giphy.gif?cid=ecf05e47e7iee900m5d6vtuivaqx70s1hnbkmu3sxxdefytk&rid=giphy.gif&ct=g",
    "https://media2.giphy.com/media/Rgppntk61NFNS/giphy.gif?cid=ecf05e477ty1jwo2lwb36yi9j252ahb5dfhol2y0vn6x6cmh&rid=giphy.gif&ct=g",
    "https://media2.giphy.com/media/xT0BKFqxREAHwgJSMM/giphy.gif?cid=ecf05e47q28vrzmrystvdea8kl4c4sbhfzcl5d60km3gwga7&rid=giphy.gif&ct=g",
  ];

  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time initialisation for GIF program account
          </button>
        </div>
      );
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
            {gifList.map((item,index) => (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} alt="gif" />
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching Gif List...");
      getGifList();
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼 Rapper's Gif Hub</p>
          <p className="sub-text">
            View your GIF collection of rappers in the metaverse ✨
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
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
