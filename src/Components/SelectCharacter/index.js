import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constant";
import myEpicGame from "../../Utils/MyEpicGame.json";
import LoadingIndicator from "../../Components/LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);

    // NFT キャラクターを Mint します。
    const mintCharacterNFTAction = async (characterId) => {
        try {
            if (gameContract) {
                setMintingCharacter(true);
                console.log("Minting character in progress...");
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log("Minting character done!");
                setMintingCharacter(false);
            }
        } catch (error) {
            console.log("Minting character error:", error);
            setMintingCharacter(false);
        }
    }

    // イベントを受信したときに起動するコールバックメソッド onCharacterMint を追加します。
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
        console.log(`CharacterMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`)
        // NFT キャラクターが Mint されたら、コントラクトからメタデータを受け取り、アリーナ（ボスとのバトルフィールド）に移動するための状態に設定します。
        if (gameContract) {
            const characterNFT = await gameContract.checkIfUserHasNFT();
            console.log("characterNFT:", characterNFT);
            setCharacterNFT(transformCharacterData(characterNFT));
            alert(`NFT キャラクターが Mint されました -- リンクはこちらです: https://testnets.opensea.io/assets/${gameContract.CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        }
    }

    useEffect(() => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer);
            setGameContract(gameContract);
        } else {
            console.log("Ethereum object doesn't exist!");
        }
    }, []);

    useEffect(() => {
        const getCharacter = async () => {
            try {
                console.log("Getting characters from contract...");
                // ミント可能な全 NFT キャラクター をコントラクトをから呼び出します。
                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log("charactersTxn:", charactersTxn);

                // コントラクトから返されたデータを、WEBアプリで使用できるように変換します。
                const characters = charactersTxn.map((characterData) => transformCharacterData(characterData));

                // ミント可能な全 NFT キャラクター を状態変数に格納します。
                setCharacters(characters);
            } catch (error) {
                console.log("Error getting characters:", error);
            }
        }

        if (gameContract) {
            getCharacter();
            // リスナーの設定：NFT キャラクターが Mint された通知を受け取ります。
            if (gameContract) {
                gameContract.on("CharacterMinted", onCharacterMint);
            }
        }

        return () => {
            // リスナーの解除：NFT キャラクターが Mint された通知を受け取ります。
            if (gameContract) {
                gameContract.off("CharacterMinted", onCharacterMint);
            }
        }
    }, [gameContract]);

    // NFT キャラクターをフロントエンドにレンダリングするメソッドです。
    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className="character-item" key={character.name}>
                <div className="name-container">
                    <p>{character.name}</p>
                </div>
                <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} alt={character.name} />
                <button
                    type="button"
                    className="character-mint-button"
                    onClick={() => mintCharacterNFTAction(index)}
                >{`Mint ${character.name}`}</button>
            </div>
        ));

    return (
        <div className="select-character-container">
            <h2>⏬ 一緒に戦う NFT キャラクターを選択 ⏬</h2>
            {/* キャラクターNFTがフロントエンド上で読み込めている際に、下記を表示します*/}
            {characters.length > 0 && (
                <div className="character-grid">{renderCharacters()}</div>
            )}
            {/* キャラクターNFTがフロントエンド上で読み込めていない際に、下記を表示します*/}
            {mintingCharacter && (
                <div className="loading">
                    <div className="indicator">
                        <LoadingIndicator />
                        <p>Minting In Progress</p>
                    </div>
                </div>

            )}
        </div>
    );

}
export default SelectCharacter;