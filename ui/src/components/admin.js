import React, { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import * as Constants from '../constants/index';
import '../style/styles.css';
const { ethers } = require("ethers");
// import Button from './Button';

export const Admin = () => {
  const [sanctuaries, setSanctuaries] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donateToSanctuaryObj, setdonateToSanctuaryObj] = useState({
    id: '',
    amount: '',
  });
  const [balance, setBalance] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [adminWallet, setAdminWallet] = useState('');
  const [provider, setProvider] = useState({});
  const [adminProvider, setAdminProvider] = useState('');
  const [contractERC20, setContractERC20] = useState({});
  const [contractMain, setContractMain] = useState({});
  const [contractERC721, setContractERC721] = useState({})
  const [signer, setSigner] = useState({});
  const [adminSigner, setAdminSigner] = useState('');
  const [newSanctuary, setNewSanctuary] = useState({
    name: '',
    location: '',
  });
  const [ccheckallowance, setCcheckAllowance] = useState('');

  const handleInputChange = (event) => {
    setNewSanctuary({
      ...newSanctuary,
      [event.target.name]: event.target.value,
    });
  };

  const handleInputChangeOfContribute = (event) => {
    setdonateToSanctuaryObj({
      ...donateToSanctuaryObj,
      [event.target.name]: event.target.value,
    });
  };

  const initContract = async () => {
    console.log('init contact');
    let tempproviderUser = new ethers.providers.Web3Provider(window.ethereum);
    let tempproviderAdmin = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:7545/'
    );
    let aw = new ethers.Wallet(
      process.env.REACT_APP_DEPLOYMENT_ADDRESS_PRIVATE_KEY,
      tempproviderAdmin
    );
    setAdminWallet(aw);
    setProvider(tempproviderUser);
    setAdminProvider(tempproviderAdmin);
    let tempsignerUser = tempproviderUser.getSigner();
    let tempsignerAdmin = tempproviderAdmin.getSigner();
    setSigner(tempsignerUser);
    setAdminSigner(tempsignerAdmin);
    let contractAddressERC20 = process.env.REACT_APP_ERC20_ADDRESS;
    let contractAddressERC721 = process.env.REACT_APP_ERC721_ADDRESS;
    let contractAddressMain = process.env.REACT_APP_MAIN_ADDRESS;
    let abi_erc20 = Constants.ABI_ERC20;
    let abi_erc721 = Constants.ABI_ERC721;
    let abi_main = Constants.ABI_MAIN;
    let tempcontractERC20User = new ethers.Contract(
      contractAddressERC20,
      abi_erc20,
      tempsignerUser
    );
    let tempcontractERC721User = new ethers.Contract(
        contractAddressERC721,
        abi_erc721,
        tempsignerUser
      );
    let tempcontractMainUser = new ethers.Contract(
      contractAddressMain,
      abi_main,
      tempsignerUser
    );
    setContractERC20(tempcontractERC20User);
    setContractERC721(tempcontractERC721User);
    setContractERC721(tempcontractMainUser);
  };

  const connectToMM = (event) => {
    initContract();
    async function getWalletAddress() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
      }
    }
    getWalletAddress();
  };

  const setsanctuaries = async (event) => {
    // GET PROJECTS and INVESTMENTS
    setSanctuaries([]);
    let nos = await contractMain.nextSanctuaryId();
    const sancs = [];
    const don = [];
    for (let i = 0; i < nos; i++) {
      const sanc = await contractMain.sanctuaries(i);
      const newsanctuary = {
        id: BigNumber(i).toString(),
        name: sanc.name,
        location: BigNumber(sanc['location']._hex).toString(),
        totalAnimals: BigNumber(sanc['totalAnimals']._hex).toString(),
        totalDonations: BigNumber(sanc['totalDonations']._hex).toString()
      };
      sancs.push(newsanctuary);
    }
    
    await setDonations([...don]);
    await setSanctuaries([...sancs]);
  };

  useEffect(() => {
    setSanctuaries(sanctuaries);
  }, [sanctuaries]);

  const createSanctuary = async (event) => {
    event.preventDefault();
    setSanctuaries([...sanctuaries, newSanctuary]);
    setNewSanctuary({
      name: '',
      location: '',
    });
    const s = await contractMain.createSanctuary(
      newSanctuary.name,
      newSanctuary.location,
    );
    console.log('create sanctuary : ', s);
  };

  const donateToSanctuary = async (event) => {
    event.preventDefault();
    setdonateToSanctuaryObj(donateToSanctuaryObj);
    setdonateToSanctuaryObj({
      id: '',
      amount: '',
    });
    const s = await contractMain.donateToSanctuary(
      donateToSanctuaryObj.id,
      donateToSanctuaryObj.amount
    );
    console.log('donateToSanctuary : ', s);
  };

  const aprroveToken = async (event) => {
    event.preventDefault();
    if (event.target[1].value) {
      const p = await contractERC20
        .connect(signer)
        .approve(event.target[1].value, event.target[0].value);
      console.log('approve token : ', p, ' ', BigNumber(p._hex).toString());
    } else {
      const p = await contractERC20
        .connect(signer)
        .approve(process.env.REACT_APP_Main_ADDRESS, event.target[0].value);
      console.log('approve money : ', p, ' ', BigNumber(p._hex).toString());
    }
  };

  const transfererc20 = async (event) => {
    event.preventDefault();
    const p = await contractERC20
      .connect(adminWallet)
      .transfer(event.target[0].value, event.target[1].value);
    console.log('transfer erc20 : ', p);
  };

  const checkallowance = async (event) => {
    const p = await contractERC20
      .connect(walletAddress)
      .allowance(walletAddress, process.env.REACT_APP_Main_ADDRESS);
    console.log('check allowance : ', p, ' ', BigNumber(p._hex).toString());
    setCcheckAllowance(BigNumber(p._hex).toString());
  };

  const showbalance = async (event) => {
    const p2 = await contractERC20.balanceOf(walletAddress);
    setBalance(BigNumber(p2._hex).toString());
    console.log('show balance : ', BigNumber(p2._hex).toString());
  };

  return (
    <div className='MyContainer'>
      <div className='MyChild'>
        <button
          className='ExpandableButton ExpandableButton--blue .ExpandableButton--blue:hover'
          onClick={connectToMM}
        >
          Connect to Metamask <p>{walletAddress}</p>
        </button>
      </div>
      <div className='MyChild'>
        <button
          className='ExpandableButton ExpandableButton--blue'
          onClick={showbalance}
        >
          show balance <p>{balance}</p>
        </button>
      </div>
      <div className='MyChild'>
        <button
          className='ExpandableButton ExpandableButton--blue'
          onClick={checkallowance}
        >
          Check Allowance <p>{ccheckallowance}</p>
        </button>
      </div>
      <hr />
      <div className='container'>
        <table className='table'>
          <tr>
            <td>
              <h1 className='styled-heading'>Create a Project</h1>
              <form onSubmit={createSanctuary}>
                <label className='style-label'>
                  Name:
                  <input
                    type='text'
                    name='name'
                    value={newSanctuary.name}
                    onChange={handleInputChange}
                  />
                </label>
                <br />
                <label className='style-label'>
                  location:
                  <input
                    type='number'
                    name='location'
                    value={newSanctuary.location}
                    onChange={handleInputChange}
                  />
                </label>
                <br />
                <button type='submit'>Create Sanctuary</button>
              </form>
            </td>
          </tr>
          <tr>
            <td colspan='2'>
              <h1 className='styled-heading'>Trasfer ERC20 from Admin </h1>
              <form onSubmit={transfererc20}>
                <label className='style-label'>
                  to:
                  <input type='text' name='to' />
                </label>
                <br />
                <label>
                  Amount To transfer:
                  <input type='number' name='amount' />
                </label>
                <br />
                <button type='submit'>Transfer</button>
              </form>
            </td>
          </tr>
        </table>
      </div>
      <hr />
      <div className='MyContainer'>
        <button onClick={setsanctuaries}>All Sanctuaries</button>
      </div>
      <div className='container'>
        <table className='table'>
          <td>
            <h1 className='styled-heading'>All Sanctuaries:</h1>
            {sanctuaries.map((sanctuary, index) => (
              <div key={index}>
                <h2>Name: {sanctuary.name}</h2>
                <h2>ID: {sanctuary.id}</h2>
                <p>location: {sanctuary.location}</p>
                <p>totalAnimals: {sanctuary.totalAnimals}</p>
                <p>totalDonations: {sanctuary.totalDonations}</p>
              </div>
            ))}
          </td>
          <td>
            <h1 className='styled-heading'>All Donations:</h1>
            {donations.map((don, index) => (
              <div key={index}>
                <h2>Amount: {don.amount}</h2>
                <p>SanctuaryId: {don.sanctuaryId}</p>
                <p>SanctuaryName: {don.sanctuaryName}</p>
              </div>
            ))}
          </td>
        </table>
      </div>
    </div>
  );
};