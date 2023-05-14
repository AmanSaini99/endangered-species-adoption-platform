import React, { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import * as Constants from '../constants/index';
import '../style/styles.css';
const { ethers } = require("ethers");
// import Button from './Button';

export const User = () => {
  const [sanctuaries, setSanctuaries] = useState([]);
  const [animalsToSanctury, setAnimalsToSanctuary] = useState([]);
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
  const [contractGuardian, setContractGuardian] = useState({});
  const [contractDonation, setContractDonation] = useState({});
  const [signer, setSigner] = useState({});
  const [adminSigner, setAdminSigner] = useState('');
  const [newSanctuary, setNewSanctuary] = useState({
    name: '',
    location: '',
  });
  const [newAnimal, setNewAnimal] = useState({
    name: '',
    species: '',
    description: '',
    birthday: '',
    sanctuaryId: 0,
  });
  const [ccheckallowance, setCcheckAllowance] = useState('');

  const handleInputChange = (event) => {
    setNewSanctuary({
      ...newSanctuary,
      [event.target.name]: event.target.value,
    });
  };

  const handleChange = (event) => {
    setNewAnimal({
      ...newAnimal,
      [event.target.name]: event.target.value,
    });
  }

  const handleInputChangeOfDonate = (event) => {
    setdonateToSanctuaryObj({
      ...donateToSanctuaryObj,
      [event.target.name]: event.target.value,
    });
  };

  const initContract = async () => {
    try {
      console.log('init contact');
      let tempproviderUser = new ethers.providers.Web3Provider(window.ethereum);
      let tempproviderAdmin = new ethers.providers.JsonRpcProvider(
        process.env.REACT_APP_DEPLOYEMENT_RPC_URL
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
      let contractAddressGuardian = process.env.REACT_APP_GUARDIAN_ADDRESS;
      let contractAddressDonation = process.env.REACT_APP_DONATION_ADDRESS;
      let contractAddressMain = process.env.REACT_APP_MAIN_ADDRESS;
      let abi_erc20 = Constants.ABI_ERC20;
      let abi_guardian = Constants.ABI_GUARDIAN;
      let abi_donation = Constants.ABI_DONATION;
      let abi_main = Constants.ABI_MAIN;
      let tempcontractERC20User = new ethers.Contract(
        contractAddressERC20,
        abi_erc20,
        tempsignerUser
      );
      let tempcontractGuardianUser = new ethers.Contract(
        contractAddressGuardian,
        abi_guardian,
        tempsignerUser
      );
      let tempcontractDonationUser = new ethers.Contract(
        contractAddressDonation,
        abi_donation,
        tempsignerUser
      );
      let tempcontractMainUser = new ethers.Contract(
        contractAddressMain,
        abi_main,
        tempsignerUser
      );
      setContractERC20(tempcontractERC20User);
      setContractGuardian(tempcontractGuardianUser);
      setContractDonation(tempcontractDonationUser);
      setContractMain(tempcontractMainUser);
    }
    catch (e) {
      console.error(e);
    }
  };

  const connectToMM = (event) => {
    try {
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
    }
    catch (e) {
      console.error(e);
    }
  };

  const setsanctuaries = async (event) => {
    try {
      // GET PROJECTS and INVESTMENTS
      setSanctuaries([]);
      let nos = await contractMain.getSanctuariesCount();
      const sancs = [];
      for (let i = 1; i < nos; i++) {
        const totAnimals = await contractMain.getToatalAnimalCountInSanctuary(i);
        const { name, location, donations, animalIds } = await contractMain.getSanctuary(i);
        const newsanctuary = {
          id: i.toString(),
          name: name,
          location: location,
          totalAnimals: BigNumber(totAnimals._hex).toString(),
          totalDonations: BigNumber(donations._hex).toString()
        };

        sancs.push(newsanctuary);
      }

      await setSanctuaries([...sancs]);
    }
    catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setSanctuaries(sanctuaries);
  }, [sanctuaries]);

  const createSanctuary = async (event) => {
    try {
      event.preventDefault();
      // setSanctuaries([...sanctuaries, newSanctuary]);
      setNewSanctuary({
        name: '',
        location: '',
      });
      const s = await contractMain.newSanctuary(
        newSanctuary.name,
        newSanctuary.location,
      );
      setSanctuaries();
      console.log('create sanctuary : ', s);
    }
    catch (e) {
      console.error(e);
    }
  };

  const addAnimal = async (event) => {
    try {
      event.preventDefault();
      setNewAnimal({
        name: '',
        species: '',
        description: '',
        birthday: '',
        sanctuaryId: 0,
      });
      const s = await contractMain.newAnimal(
        newAnimal.name,
        newAnimal.species,
        newAnimal.description,
        newAnimal.birthday,
        newAnimal.sanctuaryId,
      );
      console.log('create animal: ', newAnimal);
    }
    catch (e) {
      console.error(e);
    }
  };

  const donateToSanctuary = async (event) => {
    try {
      event.preventDefault();
      setdonateToSanctuaryObj(donateToSanctuaryObj);
      setdonateToSanctuaryObj({
        id: '',
        amount: '',
      });
      await contractERC20.approve(process.env.REACT_APP_ERC20_ADDRESS, donateToSanctuaryObj.amount);
      const s = await contractMain.donateToSanctuary(
        donateToSanctuaryObj.id,
        donateToSanctuaryObj.amount
      );
      console.log('donateToSanctuary : ', s);
    }
    catch (e) {
      console.error(e);
    }
  };

  const aprroveToken = async (event) => {
    try {
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
    }
    catch (e) {
      console.error(e);
    }
  };

  const transfererc20 = async (event) => {
    try {
      event.preventDefault();
      const p = await contractERC20
        .connect(adminWallet)
        .transfer(event.target[0].value, event.target[1].value);
      console.log('transfer erc20 : ', p);
    }
    catch (e) {
      console.error(e);
    }
  };

  const showAnimalsToSanctuary = async (event) => {
    try {
      event.preventDefault();
      const anms = [];
      const animals = await contractMain.getAnimalIdsInSanctuary(event.target[0].value);
      for (let i = 0; i < animals.length; i++) {
        if (animals[i] == 0) continue;
        const animal = await contractMain.getAnimal(animals[i]);
        const newanimal = {
          id: BigNumber(animals[i]._hex).toString(),
          name: animal.name,
          species: animal.species,
          description: animal.description,
          birthday: animal.birthday,
          sanctuaryId: BigNumber(animal.sanctuaryId._hex).toString(),
          guardian: animal['gaurdian'],
          gardianshipExpiry: BigNumber(animal['gardianshipExpiry']._hex).toString(),
          gaurdianshipTokenId: BigNumber(animal['gaurdianshipTokenId']._hex).toString(),
        };
        anms.push(newanimal);
      }

      await setAnimalsToSanctuary([...anms]);
    }
    catch (e) {
      console.error(e);
    }
  };

  const checkallowance = async (event) => {
    try {
      const p = await contractERC20
        .allowance(walletAddress, process.env.REACT_APP_MAIN_ADDRESS);
      console.log('check allowance : ', p, ' ', BigNumber(p._hex).toString());
      setCcheckAllowance(BigNumber(p._hex).toString());
    }
    catch (e) {
      console.error(e);
    }

  };

  const showbalance = async (event) => {
    try {
      const p2 = await contractERC20.balanceOf(walletAddress);
      setBalance(BigNumber(p2._hex).toString());
      console.log('show balance : ', BigNumber(p2._hex).toString());
    }
    catch (e) {
      console.error(e);
    }
  };

  const burnNFTs = async (event) => {
    try {
      await contractMain.burnExpiredTokens();
      console.log("Expired Tokens Burned");
    }
    catch (e) {
      console.error(e);
    }
  }

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
          <tbody>
            <tr>
              <td>
                <h1 className='styled-heading'>Donate to Sanctuary</h1>
                <form onSubmit={donateToSanctuary}>
                  <label className='style-label'>
                    Id:
                    <input
                      type='number'
                      name='id'
                      value={donateToSanctuaryObj.id}
                      onChange={handleInputChangeOfDonate}
                    />
                  </label>
                  <br />
                  <label className='style-label'>
                    Amount:
                    <input
                      type='number'
                      name='amount'
                      value={donateToSanctuaryObj.amount}
                      onChange={handleInputChangeOfDonate}
                    />
                  </label>
                  <br />
                  <button type='submit'>Donate Amount</button>
                </form>
              </td>
            </tr>
            <tr>
              <td>
                <h1 className='styled-heading'>Add Animal to Sanctuary</h1>
                <form onSubmit={addAnimal}>
                  <label className='style-label'>
                    Name:
                    <input
                      type='text'
                      name='name'
                      value={newAnimal.name}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <label className='style-label'>
                    Species:
                    <input
                      type='text'
                      name='species'
                      value={newAnimal.species}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <label className='style-label'>
                    description:
                    <input
                      type='text'
                      name='description'
                      value={newAnimal.description}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <label className='style-label'>
                    Birthday:
                    <input
                      type='text'
                      name='birthday'
                      value={newAnimal.birthday}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <label className='style-label'>
                    SanctuaryId:
                    <input
                      type='number'
                      name='sanctuaryId'
                      value={newAnimal.sanctuaryId}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <button type='submit'>Add Animal</button>
                </form>
              </td>
            </tr>
            <tr>
              <td colSpan='2'>
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
          </tbody>
        </table>
      </div>
      <hr />
      <div className='MyContainer'>
        <button onClick={setsanctuaries}>Show Sanctuaries</button>
      </div>
      <div className='container'>
        <table className='table'>
          <tbody>
            <tr>
              <td>
                <h1 className='styled-heading'>All Sanctuaries</h1>
                {sanctuaries.map((sanctuary, index) => (
                  <div key={index}>
                    <h3>Name: {sanctuary.name}</h3>
                    <h3>ID: {sanctuary.id}</h3>
                    <p>location: {sanctuary.location}</p>
                    <p>totalAnimals: {sanctuary.totalAnimals}</p>
                    <p>totalDonations: {sanctuary.totalDonations}</p>
                  </div>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>
                <h1 className='styled-heading'>Show Animals In Sanctuary</h1>
                <form onSubmit={showAnimalsToSanctuary}>
                  <label className='style-label'>
                    SanctuaryId:
                    <input type='text' name='sanctuaryId' />
                  </label>
                  <br />
                  <button type='submit'>Show Animals</button>
                </form>
              </td>
              <td >
                <h1 className='styled-heading'>All Animals In this Sanctuary</h1>
                {animalsToSanctury.map((animal, index) => (
                  <div key={index}>
                    <h3>Name: {animal.name}</h3>
                    <h3>ID: {animal.id}</h3>
                    <p>Species: {animal.species}</p>
                    <p>Description: {animal.description}</p>
                    <p>Birthday: {animal.birthday}</p>
                    <p>SanctuaryId: {animal.sanctuaryId}</p>
                    <p>Guardian: {animal.guardian}</p>
                    <p>GardianshipExpiry: {animal.gardianshipExpiry}</p>
                    <p>GaurdianshipTokenId: {animal.gaurdianshipTokenId}</p>
                  </div>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};