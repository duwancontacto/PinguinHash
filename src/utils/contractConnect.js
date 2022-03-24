import Abi from "./Abi.json"
const connectContract = (tokenAddress, web3) => {
    return web3
        ? new web3.eth.Contract(Abi, tokenAddress, {
            from: web3.eth.defaultAccount,
        })
        : null
}



export default connectContract