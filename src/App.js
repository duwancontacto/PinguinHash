import fondo from "../src/assets/fondomadera.png"
import marco from "../src/assets/marco.png"
import letrero from '../src/assets/letrero.png'
import mapa from '../src/assets/mapa.png'
import boton from "../src/assets/boton.png"
import fondotitulo from '../src/assets/fondo.png'
import titulo from '../src/assets/TituloPrincipal.png'
import Gif from "../src/assets/GIF.gif"

import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from "react"
import { injected } from "./utils/connectors"
import contractConnect from "./utils/contractConnect"

function App() {

  const [whiteListActive, setWhitelistActive] = useState(null)
  const [nftMinted, setNftMinted] = useState([])
  const [loading, setLoading] = useState(false)
  const [allNftMinted, setAllNftMinted] = useState(null)
  const [counterNft, setCounterNft] = useState(0)
  const [maxMint, setMaxMint] = useState(10)
  const [loadingMint, setLoadingMint] = useState(false)
  const [contract, setContract] = useState(null)
  const [cost, setCost] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [accessToMint, setAccessToMint] = useState(null)


  const [pausedSell, setPausedSell] = useState(null)

  const { library, activate, account, chainId, active, networkId, error } = useWeb3React()


  let getReloadData = (contractPinguin) => {
    contractPinguin.methods.paused().call({ from: account }).then(result => setPausedSell(result))
    contractPinguin.methods.whiteListActive().call({ from: account }).then(async result => {

      if (result) {
        contractPinguin.methods.getWhitelistCost().call({ from: account }).then(result => setCost({ costGas: result, costView: result / (1 + '0'.repeat(18)) }))
        contractPinguin.methods.getWhiteListByAddress(account).call({ from: account }).then(result => setAccessToMint(result))
        setMaxSupply(1000)

        /* contractPinguin.methods.whiteListMaxNft().call({ from: account }).then(result => setMaxSupply(result)) */

      }
      else {
        contractPinguin.methods.getCost().call({ from: account }).then(result => setCost({ costGas: result, costView: result / (1 + '0'.repeat(18)) }))
        contractPinguin.methods.maxSupply().call({ from: account }).then(result => setMaxSupply(result))
        setAccessToMint(true)

      }
      setLoading(true);
      setWhitelistActive(result)
    })
    contractPinguin.methods.getTotalSupply().call({ from: account }).then(result => setAllNftMinted(result))


  }

  useEffect(() => {
    let intervalId

    let getContracts = async () => {

      let contractPinguin = await contractConnect("0xC727F7670D9844F32381bf89A633e27CAc710d34", library)

      getReloadData(contractPinguin)
      setContract(contractPinguin)
      contractPinguin.methods.getPenguinsIdByAddress(account).call({ from: account }).then(result => setNftMinted(result.length))
      contractPinguin.methods.maxMintAmount().call({ from: account }).then(result => setMaxMint(result))

      intervalId = setInterval(async () => { getReloadData(contractPinguin) }, 3000)

    }

    if (account && active) getContracts()

    return () => { clearInterval(intervalId) }

  }, [account])

  const handleAddNft = () => { if (counterNft < maxMint) setCounterNft(counterNft + 1) }
  const handleRestNft = () => { if (counterNft > 0) setCounterNft(counterNft - 1) }

  const connectWallet = async () => {

    /* await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${Number(137).toString(16)}`,
          chainName: 'Matic(Polygon) Mainnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://polygon-rpc.com'],
          blockExplorerUrls: ['https://www.polygonscan.com'],
        }
      ]
    }); */
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${Number(80001).toString(16)}`,
          chainName: "Matic(Polygon) Mumbai Testnet",
          nativeCurrency: { name: "tMATIC", symbol: "tMATIC", decimals: 18 },
          rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
          blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        }
      ]
    });
    await activate(injected)
  }

  const onSubmitMint = () => {

    if (contract && account && active && !loadingMint) {
      setLoadingMint(true)

      contract.methods.mint(counterNft).send({ from: account, value: cost.costGas * counterNft }).then(result => {
        contract.methods.getPenguinsIdByAddress(account).call({ from: account }).then(result => setNftMinted(result.length))
        contract.methods.getTotalSupply().call({ from: account }).then(result => setAllNftMinted(result))
        setCounterNft(0)
        setLoadingMint(false)

      }).catch(err => { console.log(err); setLoadingMint(false) })



    }

  }

  return (
    <div className="w-full h-[100vh] ">
      <img className="z-30 fixed h-full w-full top-[-4px] left-0" src={fondo} alt="fondo" />

      < div className="relative z-50 ">

        <div className="relative  flex justify-center ">
          <img src={fondotitulo} alt="letrero" className=" absolute inset-0  m-auto w-[35rem] h-[15rem] z-1 " />
          <img src={titulo} alt="titulo" className="w-[12rem] relative mb-5  " />
        </div>





        <div className=" block md:flex  md:justify-evenly items-center shadow-xl">

          <div className="rounded-full overflow-hidden  m-auto md:m-0 relative " >
            <img src={marco} className="relative z-1 w-[15rem] md:w-[20rem] h-[15rem] md:h-[20rem] m-auto" />
            <img className="absolute inset-0 m-auto z-10 w-[8.5rem] md:w-[11rem] rounded-full" src={Gif} alt="gif" />
          </div>




          <div className=" text-center w-full md:w-[36rem] h-[15rem] md:h-[25rem] my-8 md:my-0 relative   ">

            <img src={mapa} alt="mapa" className="w-[36rem] h-[28rem] inset-0 m-auto z-[1]  absolute" />

            {(active && !pausedSell) ?
              <div className="relative z-[2] mt-[67px]">

                {loading && <>

                  {whiteListActive
                    ? <span className="text-[rgba(41,25,18,0.69)] text-[36px] mt-3 font-bold  ">  Whitelist Sale <span className="text-[#444a4ea1] text-[18px] ">({cost.costView} Matic )</span></span>
                    : <span className="text-[rgba(41,25,18,0.69)] text-[36px] mt-3 font-bold  ">  Public Sale <span className="text-[#444a4ea1] text-[18px] ">({cost.costView} Matic )</span></span>
                  }
                  {/* <span className="text-[rgba(59,35,25,0.53)] font-semibold "><h3>(3 days 2 hours 10 min)</h3></span> */}

                  {(allNftMinted < maxSupply && accessToMint) && <>
                    <div className='flex mx-4 justify-center mt-7'>
                      <div className="flex  bg-[rgba(141,53,37,0.67)]  rounded-lg  shadow-[f8edeb] shadow-xl border-4 border-[#8d5e25]">
                        <div onClick={handleRestNft} className='px-4  cursor-pointer hover:scale-105 transition duration-150 ease-out text-[#fff6edd2] p-0'>-</div>
                        <div className="hover:scale-105 transition duration-150 ease-out text-[#fff6edd2] px-4">{counterNft}</div>
                        <div onClick={handleAddNft} className='px-4   cursor-pointer  hover:scale-105 transition duration-150 ease-out text-[#fff6edd2] '>+</div>

                      </div>
                      <span className="mx-4 text-[rgba(51,30,22,0.69)] font-semibold">Total Price: {(counterNft * cost.costView).toFixed(0)} Matic </span>

                    </div>
                    <div className="flex justify-center items-center mt-3">

                      <div onClick={onSubmitMint} className="cursor-pointer relative w-[120px] hover:scale-105  active:90 transition duration-150 ease-out mt-5">
                        <button className=" text-md font-bold text-[#fff6edd2] relative m-auto inset-0 shadow-[#c76161cb] shadow-xl z-[3]  text-center mb-3" >{loadingMint ? "Loading" : "Mint"}</button>

                        <img src={boton} alt="boton" className="w-[7rem] z-[1]  rounded-lg absolute m-auto inset-0  " />
                      </div>
                      {(nftMinted && parseInt(nftMinted) > 0) ? <strong className="text-[rgba(141,53,37,0.67)] mt-2"> <span> ({nftMinted} Minted) </span> </strong> : ""}
                    </div>

                  </>}

                  {!accessToMint && <p className="text-[rgba(59,35,25,0.53)] pt-8 text-2xl font-semibold "> You are not on the Whitelist. </p>}


                  <div className="flex  items-center justify-center mt-6">


                    <span className="mr-3 text-[#444a4ea1] text-[18px]">{allNftMinted}</span>
                    <div className="rounded-lg  bg-[rgba(141,53,37,0.67)]  border-4 border-[#8d5e25] w-[24rem] h-[1.5rem]  ">


                      <div className={`bg-[#cdc140] h-full flex items-center justify-end rounded-lg text-left `} style={{ width: `${(allNftMinted * 100) / maxSupply}%` }}>
                        {(allNftMinted * 100 / maxSupply).toFixed(0) > 8 && <span className="pr-2 text-white text-sm">{(allNftMinted * 100 / maxSupply).toFixed(0)}%</span>}
                      </div>
                    </div>

                    <span className="ml-3 text-[#444a4ea1] text-[18px]">{maxSupply}</span>
                  </div> </>}



              </div> :
              <div className="relative z-[2] mt-[100px]">



                <span className="text-[rgba(41,25,18,0.69)] text-[36px] mt-3 font-bold  ">{pausedSell ? "The sale is not active" : "Connect your wallet on the polygon network"}</span>

                {!pausedSell && <div className="relative  hover:scale-105  active:90 transition duration-150 ease-out mt-5">
                  <button onClick={connectWallet} className=" text-md font-bold text-[#fff6edd2] relative m-auto inset-0 shadow-[#c76161cb] shadow-xl z-[3]  text-center mb-3" >Connect</button>

                  <img src={boton} alt="boton" className="w-[7rem] z-[1]  rounded-lg absolute m-auto inset-0  " />
                </div>}


              </div>}



          </div>


          <div className="rounded-full overflow-hidden  m-auto md:m-0 relative " >
            <img src={marco} className="relative z-1 w-[15rem] md:w-[20rem] h-[15rem] md:h-[20rem] m-auto " />
            <img className="absolute inset-0 m-auto z-10 w-[8.5rem] md:w-[11rem] rounded-full" src={Gif} alt="gif" />
          </div>


        </div>



      </div>

    </div >
  );
}

export default App;
