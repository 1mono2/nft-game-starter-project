import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, SEPOLIA_NETWORK, transformCharacterData } from './constant';
import { ethers } from 'ethers';
import myEpicGame from './Utils/MyEpicGame.json';

// Constants
const TWITTER_HANDLE = '1MoNo2Prod';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  // ユーザーがSepolia Network に接続されているか確認します。
  // '11155111' は Sepolia のネットワークコードです。
  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== SEPOLIA_NETWORK) {
        alert('このゲームはSepolia Networkに接続されている必要があります。');
      } else {
        console.log('Sepolia Networkに接続されています。');
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ユーザーがMetaMaskを持っているか確認します。
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('MetaMaskが見つかりませんでした。');
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        // accountsにWEBサイトを訪れたユーザーのウォレットアカウントを格納します。
        // （複数持っている場合も加味、よって account's' と変数を定義している）
        const accounts = ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          // ユーザーのウォレットアドレスを状態変数に格納します。
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }

    } catch (error) {
      console.log(error);
    }
  };

  // レンダリングメソッド
  const renderContent = () => {
    // シナリオ1.
    // ユーザーがWEBアプリにログインしていない場合、WEBアプリ上に、"Connect Wallet to Get Started" ボタンを表示します。
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img src="https://i.imgur.com/TXBQ4cC.png" alt="LUFFY" />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet to Get Started
          </button>
        </div>
      );
      // シナリオ2.
      // ユーザーはWEBアプリにログインしており、かつ NFT キャラクターを持っていない場合、WEBアプリ上に、を表示します。
    } else if (!characterNFT && currentAccount) {
      return (<SelectCharacter setCharacterNFT={setCharacterNFT} />);
    }
  };

  // ユーザーがウォレットに接続するための関数を定義します。
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('MetaMaskが見つかりませんでした。');
        return;
      }
      // ユーザーがウォレットを持っているか確認します。
      checkIfWalletIsConnected();


      // ユーザーにウォレットに接続するように求めます。
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected', accounts[0]);
      // ユーザーのウォレットアドレスを状態変数に格納します。
      setCurrentAccount(accounts[0]);

      // ユーザーがSepolia Network に接続されているか確認します。
      checkNetwork();

    } catch (error) {
      console.log(error);
    }
  }

  // ページがロードされたときに useEffect()内の関数が呼び出されます。
  useEffect(() => {
    // スマートコントラクトを呼び出す関数です。
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);
      // ユーザーのウォレットアドレスを使用して、スマートコントラクトを呼び出します。
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer);

      const txn = await gameContract.checkIfUserHasNFT();
      // 名前が空文字かどうかで判断
      if (txn.name) {
        console.log("User has character NFT!");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found");
      }
    }

    // 接続されたウォレットがある場合のみ、下記を実行します。
    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚡️ METAVERSE GAME ⚡️</p>
          <p className="sub-text">プレイヤーと協力してボスを倒そう✨</p>
          <div className="connect-wallet-container">
            {/* renderContent メソッドを呼び出します。*/}
            {renderContent()}
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};
export default App;
