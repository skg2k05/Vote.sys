import React, { Component } from "react";
import {
  Button,
  Divider,
  Transition,
  Form,
  Grid,
  Segment,
  Message
} from "semantic-ui-react";
import {Router} from '../routes'
import Election_Factory from "../Ethereum/election_factory";
import Cookies from 'js-cookie';
import {Helmet} from 'react-helmet'

class DividerExampleVerticalForm extends Component {
  state = { visible: true, email: ''};
  toggleVisibility = () => this.setState({ visible: !this.state.visible });  
  returnBackImage = () => (
    <div className='login-form'>
    <style JSX>{`
        .login-form {
            width:100vw;
            height:100vh;
            position:absolute; 
            background: url('../../static/blockchain.jpg') no-repeat;
            z-index: -1;
        }
      `}</style>
  </div>
  )
  
  signup = async event => {
    const email = document.getElementById('signup_email').value;
    const password = document.getElementById('signup_password').value;
    const repeat_password = document.getElementById('signup_repeat_password').value;
    if(password!=repeat_password){
		alert("Passwords do not match");		
	}
	else {
    const response = await fetch('/company/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password),
    });
    const responseObj = await response.json();
    if(responseObj.status=="success") {
      Cookies.set('company_email', responseObj.data.email || email);
      alert("Added!");
      Router.pushRoute(`/company_login`);
    }
    else {
      alert(responseObj.message);
    }
	}
  }
  signin =  async event => {
      const email = document.getElementById('signin_email').value;
      const password = document.getElementById("signin_password").value;

      if(!Election_Factory) {
        alert('The election factory contract is not deployed. Run "npm run deploy" first.');
        return;
      }

      // Connect MetaMask to this site before making any blockchain call
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (err) {
          alert('MetaMask connection rejected. Please allow access and try again.');
          return;
        }
      }

      const response = await fetch('/company/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password),
      });
      const responseObj = await response.json();
      if(responseObj.status!="success") {
        alert(responseObj.message);
        return;
      }

      this.setState({email: email});
      Cookies.set('company_id', responseObj.data.id);
      Cookies.set('company_email', responseObj.data.email);

      try {
        const summary = await Election_Factory.methods.getDeployedElection(responseObj.data.email).call();
        if(summary[2] == "Create an election.") {
            Router.pushRoute(`/election/create_election`);
        }
        else {
            Cookies.set('address',summary[0]);
            Router.pushRoute(`/election/${summary[0]}/company_dashboard`);
        }
      }
      catch (err) {
          console.log(err.message);
          alert('Could not reach the blockchain. Is Ganache running?\n\nError: ' + err.message);
      }
  }


  render() {
    const { visible } = this.state;
    return (
      <div>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />
        <Helmet>
            <title>Company Login</title>
        </Helmet>
        <div>
          {this.returnBackImage()}

          <Button.Group style={{ marginLeft: "43%" }}>
            <Button
              primary
              content={visible ? "Sign in" : "Sign Up"}
              onClick={this.toggleVisibility}
            />
          </Button.Group>
          <Divider style={{ zIndex: "-10" }} />
          <Grid className="grid1">
            <Grid.Row>
              <Grid.Column
                width={5}
                style={{ marginLeft: "33%", marginTop: "10%" }}
                verticalAlign="middle"
              >
                <Segment placeholder className="segment">
                  <Transition
                    visible={!this.state.visible}
                    animation="scale"
                    duration={300}
                  >
                    <Form size="large">
                      <h3 style={{ textAlign: "center" }}>Sign in</h3>
                      <Form.Input
                        fluid
                        id="signin_email"
                        icon="user"
                        iconPosition="left"
                        placeholder="Email"
                        style={{ padding: 5 }}
                      />
                      <Form.Input
                        style={{ padding: 5 }}
                        fluid
                        id="signin_password"
                        icon="lock"
                        iconPosition="left"
                        placeholder="Password"
                        type="password"
                      />

                      <Button
                        onClick={this.signin}
                        color="blue"
                        fluid
                        size="large"
                        style={{ marginBottom: 15 }}
                      >
                        Submit
                      </Button>
                    </Form>
                  </Transition>

                  <Transition
                    visible={this.state.visible}
                    animation="scale"
                    duration={300}
                  >
                    <Form size="large">
                      <h3 style={{ textAlign: "center" }}>Sign up</h3>
                      <Form.Input
                        fluid
                        id="signup_email"
                        icon="user"
                        iconPosition="left"
                        placeholder="Email"
                        style={{ padding: 5 }}
                      />
                      <Form.Input
                        style={{ padding: 5 }}
                        fluid
                        id="signup_password"
                        icon="lock"
                        iconPosition="left"
                        placeholder="Password"
                        type="password"
                      />
                      <Form.Input
                        style={{ padding: 5 }}
                        fluid
                        id="signup_repeat_password"
                        icon="lock"
                        iconPosition="left"
                        placeholder="Repeat Password"
                        type="password"
                      />
                      <Button
                        onClick={this.signup}
                        color="blue"
                        fluid
                        size="large"
                        style={{ marginBottom: 15 }}
                      >
                        Submit
                      </Button>                      
                    </Form>
                  </Transition>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}
export default DividerExampleVerticalForm;
