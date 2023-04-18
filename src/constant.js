const CONTRACT_ADDRESS = "0x517D3B729aCC600d6e495c29Ab2CB459c1f855Ac";
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