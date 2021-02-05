import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import MockDaiToken from "./contracts/MockDaiToken.json";
import DeXToken from "./contracts/DeXToken.json";
import DeXTokenFarm from "./contracts/DeXTokenFarm.json";
import Navbar from "./Navbar";
import TokenFarmCard from "./TokenFarmCard";
import LoadingSpinner from "./components/LoadingSpinner";
import "./App.css";

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    signedInAccount: "0x0",
    mockDaiToken: {},
    deXToken: {},
    deXTokenFarm: {},
    daiTokenBalance: "0",
    deXTokenBalance: "0",
    stakingBalance: "0",
    loading: true,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      this.setState({
        web3,
        accounts,
        signedInAccount: accounts[0],
      });
      // get network id
      const networkId = await web3.eth.net.getId();

      // Get the mock dai token contract instance.
      const mockDaiTokenData = MockDaiToken.networks[networkId];
      if (mockDaiTokenData) {
        const mockDaiToken = new web3.eth.Contract(
          MockDaiToken.abi,
          mockDaiTokenData.address
        );
        this.setState({ mockDaiToken });
        let daiTokenBalance = await mockDaiToken.methods
          .balanceOf(this.state.signedInAccount)
          .call();
        daiTokenBalance = this.state.web3.utils.fromWei(
          daiTokenBalance.toString(),
          "Ether"
        );
        this.setState({ daiTokenBalance });
      } else {
        window.alert("Mock Dai Token is not deployed on the detected network");
      }

      const deXTokenData = DeXToken.networks[networkId];
      if (deXTokenData) {
        const deXToken = new web3.eth.Contract(
          DeXToken.abi,
          deXTokenData.address
        );
        this.setState({ deXToken });
        let deXTokenBalance = await deXToken.methods
          .balanceOf(this.state.signedInAccount)
          .call();
        deXTokenBalance = this.state.web3.utils.fromWei(
          deXTokenBalance.toString(),
          "Ether"
        );
        this.setState({ deXTokenBalance });
      } else {
        window.alert("DeX Token is not deployed on the detected network");
      }

      const deXFarmData = DeXTokenFarm.networks[networkId];
      if (deXTokenData) {
        const deXTokenFarm = new web3.eth.Contract(
          DeXTokenFarm.abi,
          deXFarmData.address
        );
        this.setState({ deXTokenFarm });
        let stakingBalance = await deXTokenFarm.methods
          .stackingBalance(this.state.signedInAccount)
          .call();
        stakingBalance = this.state.web3.utils.fromWei(
          stakingBalance.toString(),
          "Ether"
        );
        this.setState({ stakingBalance });
      } else {
        window.alert("DeX Token Farm is not deployed on the detected network");
      }
      this.setState({ loading: false });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  stakeTokens = (amount) => {
    amount = this.state.web3.utils.toWei(amount, "Ether");

    this.setState({ loading: true });
    this.state.mockDaiToken.methods
      .approve(this.state.deXTokenFarm._address, amount)
      .send({ from: this.state.signedInAccount })
      .on("transactionHash", (hash) => {
        this.state.deXTokenFarm.methods
          .stackTokens(amount)
          .send({ from: this.state.signedInAccount })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  unstakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.deXTokenFarm.methods
      .unstakeTokens()
      .send({ from: this.state.signedInAccount })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  render() {
    let content;
    if (this.state.loading) {
      return (
        <LoadingSpinner msg="Loading Web3, Accounts and Contract..."></LoadingSpinner>
      );
    } else {
      content = (
        <TokenFarmCard
          daiTokenBalance={this.state.daiTokenBalance}
          deXTokenBalance={this.state.deXTokenBalance}
          stakingBalance={this.state.stakingBalance}
          stakeTokens={this.stakeTokens}
          unstakeTokens={this.unstakeTokens}
        ></TokenFarmCard>
      );
    }
    return (
      <div className="App">
        <Navbar account={this.state.signedInAccount}> </Navbar>

        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">{content}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
