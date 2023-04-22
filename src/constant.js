const CONTRACT_ADDRESS = "0xa805343EB8143F14D3B1014F5D772e881B015c20";
const SEPOLIA_NETWORK = "11155111";
const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
    };
};
export { CONTRACT_ADDRESS, SEPOLIA_NETWORK, transformCharacterData };