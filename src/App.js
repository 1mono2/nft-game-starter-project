import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '1MoNo2Prod';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
  const [currentAccount, setCurrentAccount] = React.useState(null);


  // ユーザーがMetaMaskを持っているか確認します。
  const checkIfWalletIsConnected = () => {
    try {
      const { ethereum } = window.ethereum;
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

  // ユーザーがウォレットに接続するための関数を定義します。
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('MetaMaskが見つかりませんでした。');
        return;
      }
      else {
        // ユーザーにウォレットに接続するように求めます。
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected', accounts[0]);
        // ユーザーのウォレットアドレスを状態変数に格納します。
        setCurrentAccount(accounts[0]);
      }

      // ページがロードされたときに useEffect()内の関数が呼び出されます。
      React.useEffect(() => {
        checkIfWalletIsConnected();
      }, []);

      return (
        <div className="App">
          <div className="container">
            <div className="header-container">
              <p className="header gradient-text">⚡️ METAVERSE GAME ⚡️</p>
              <p className="sub-text">プレイヤーと協力してボスを倒そう✨</p>
              <div className="connect-wallet-container">
                <img
                  src="https://i.imgur.com/TXBQ4cC.png"
                  alt="LUFFY"
                />
                {/*
             * ウォレットコネクトを起動するために使用するボタンを設定しています。
             * メソッドを呼び出すために onClick イベントを追加することを忘れないでください。
             */}
                <button
                  className="cta-button connect-wallet-button"
                  onClick={connectWalletAction}
                >
                  Connect Wallet To Get Started
                </button>
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
