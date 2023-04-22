import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constant";
import myEpicGame from "../../Utils/MyEpicGame.json";
import "./Arena.css";

// フロントエンドにNFTキャラクターを表示するため、characterNFTのメタデータを渡します。
const Arena = ({ characterNFT, setCharacterNFT }) => {
    // コントラクトのデータを保有する状態変数を初期化します。
    const [gameContract, setGameContract] = useState(null);
    // ボスのメタデータを保存する状態変数を初期化します。
    const [boss, setBoss] = useState(null);
    // 攻撃の状態を保存する変数を初期化します。
    const [attackState, setAttackState] = useState("");

    // ボスを攻撃する関数を設定します。
    const runAttackAction = async () => {
        try {
            // コントラクトが呼び出されたことを確認します。
            if (gameContract) {
                // attackStateの状態をattackingに設定します。
                setAttackState("attacking");
                console.log("Attacking boss...");

                // NFT キャラクターがボスを攻撃します。
                const attackTxn = await gameContract.attackBoss();
                // トランザクションがマイニングされるまで待ちます。
                await attackTxn.wait();
                console.log("attackTxn:", attackTxn);

                // attackState の状態を hit に設定します。
                setAttackState("hit");
            }
        } catch (error) {
            console.error("Error attacking boss:", error);
            // attackState の状態を null に設定します。
            setAttackState("");
        }
    };

    // ページがロードされると下記が実行されます。
    useEffect(() => {
        const { ethereum } = window;
        // MetaMaskがインストールされているか確認します。
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            // ユーザーがMetaMaskに接続しているか確認します。
            const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer);
            setGameContract(gameContract);
        } else {
            console.log("Ethereum object doesn't exist!");
        }
    }, []);

    useEffect(() => {
        // コントラクトからボスのメタデータを取得し、bossを設定する非同期関数 fetchBoss を設定します。
        const fetchBoss = async () => {
            console.log("Getting boss NFT metadata");
            // コントラクトからボスのメタデータを取得します。
            const bossTxn = await gameContract.getBigBoss();
            console.log("Boss:", bossTxn);
            // ボスのメタデータを設定します。
            setBoss(transformCharacterData(bossTxn));
        };

        //AttackCompleteイベントを受信したときに起動するコールバックメソッドを追加します。
        const onAttackComplete = (newBossHp, newPlayerHp) => {
            const bossHP = newBossHp.toNumber();
            // NFT キャラクターの新しいHPを取得します。
            const playerHP = newPlayerHp.toNumber();
            console.log(`AttackComplete: Boss Hp: ${bossHP} Player Hp: ${playerHP}`);

            // NFT キャラクターとボスのHPを更新します。
            //引数を取ると、前の状態を受け取れる。今回はHPのみ更新したいのでこうしている。
            setBoss((prevState) => {
                return { ...prevState, hp: bossHP };
            });
            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHP };
            });
        };

        if (gameContract) {
            // コントラクトの準備ができたら、ボスのメタデータを取得します。
            fetchBoss();
            // リスナーの設定：ボスが攻撃された通知を受け取ります。
            // ContractのAttackCompleteとonAttackCompleteを関連付けます。
            gameContract.on("AttackCompleted", onAttackComplete);
        }

        // リスナーを削除します。
        return () => {
            if (gameContract) {
                gameContract.off("AttackCompleted", onAttackComplete);
            }
        }
    }, [gameContract]);

    return (
        <div className="arena-container">
            {/* ボスをレンダリングします */}
            {boss && (
                <div className="boss-container">
                    <div className={`boss-content ${attackState}`}>
                        {/* attackState 追加します */}
                        <h2>🔥{boss.name}🔥</h2>
                        <div className="image-content">
                            <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
                            <div className="health-bar">
                                <progress value={boss.hp} max={boss.maxHp} />
                                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                            </div>
                        </div>
                    </div>
                    <div className="attack-container">
                        <button className="cta-button" onClick={runAttackAction}>
                            {`💥Attack (⚔️${boss.attackDamage})`}
                        </button>
                    </div>
                </div>
            )}
            {/* NFT キャラクター */}
            {characterNFT && (
                <div className="players-container">
                    <div className="player-container">
                        <h2>Your Character</h2>
                        <div className="player">
                            <div className="image-content">
                                <h2>{characterNFT.name}</h2>
                                <img
                                    src={characterNFT.imageURI}
                                    alt={`Character ${characterNFT.name}`}
                                />
                                <div className="health-bar">
                                    <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                                    <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                                </div>
                            </div>
                            <div className="stats">
                                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Arena;