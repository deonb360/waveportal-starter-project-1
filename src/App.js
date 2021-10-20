import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const [waveCount, setWaveCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [allWaves, setAllWaves] = useState([])
  
  const contractAddress = "0x338E6a70aF36629D274d8E3a4e1be12A6dE3e468";

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
 const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves(); console.log("WAVES:", waves);

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
        console.log("WAVES CLEANED", wavesCleaned);
      } else {
        console.log("Ethereum object does not exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

const wave = async () => {
  try {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

      let count = await wavePortalContract.getTotalWaves();
      setWaveCount(parseInt(count));
      console.log("Recieved total wave count...", count.toNumber());
      
      const waveTxn = await wavePortalContract.wave(document.getElementById("waveMessage").value);
      console.log("Mining...", waveTxn.hash);

      setIsLoading(true);

      await waveTxn.wait();
      console.log("Mined --", waveTxn.hash);
      setIsLoading(false);

      getAllWaves();
      count = await wavePortalContract.getTotalWaves();
      setWaveCount(parseInt(count));  
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}

  let waveText;
  if (isLoading) {
    waveText = (<div className="spinner">
      <div className="bounce1"></div>
      <div className="bounce2"></div>
      <div className="bounce3"></div>
    </div>)
  } else {
    waveText = (<div>
      <div className="inputContainer">
        <textarea className="textarea" id="waveMessage" placeholder="Write me a message! Your message will be recorded on the blockchain and then displayed on the screen.(give it a few moments 😃)" cols="75" rows="5"></textarea>

        {/*
          * If there is no current wallet, then render this button
          */}
        {!currentAccount && (<button className="connectWalletButton" onClick={connectWallet}>
          Connect Wallet 🦊
        </button>)}

        <button className="waveButton" onClick={wave}>Wave at Me 👋🏿</button>
      </div>
      <div className="waveCountText">(Total # of waves: {waveCount})</div>
    </div>
    )
  }


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          ✌🏿👽✌🏿
        </div>

        <div className="bio">
          Yooooo, what's up! I'm excited to share my first Dapp with you. Connect your Ethereum wallet and make sure you're on the Rinkeby testnet with some ETH. Then go ahead and send me a note and a 👋🏿
        </div>

        {waveText}
        <div className="waveContainer">
          {allWaves.slice(0).reverse().map((wave, index) => {
            return (<div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
          })}
        </div>


      </div>
    </div>
  );
}


export default App