import React, { Component } from 'react';
import { Button, Form, Grid, Header, Segment, Icon, Message } from 'semantic-ui-react';
import { getAccounts, sendTx } from '../../Ethereum/web3';
import Election_Factory from '../../Ethereum/election_factory';
import { Router } from '../../routes';
import Cookies from 'js-cookie';
class LoginForm extends Component {
	state = {
		//retrieve the company's email via cookie
		election_name: '',
		election_description: '',
		loading: false,
		errorMess: '',
	};

	signin = async event => {
		event.preventDefault();
		if (!Election_Factory) {
			this.setState({ errorMess: 'The election factory contract is not deployed. Run "npm run deploy" first.' });
			return;
		}
		this.setState({ loading: true, errorMess: '' });
		try {
			const email = Cookies.get('company_email');
			const accounts = await getAccounts();
			if (!accounts || !accounts.length) {
				throw new Error('No Ethereum account found. Please connect MetaMask.');
			}
			await sendTx(
				Election_Factory.methods.createElection(email, this.state.election_name, this.state.election_description),
				{ from: accounts[0] }
			);

			const summary = await Election_Factory.methods.getDeployedElection(email).call();
			this.setState({ loading: false });
			Cookies.set('address', summary[0]);
			Router.pushRoute(`/election/${summary[0]}/company_dashboard`);
		} catch (err) {
			this.setState({ errorMess: err.message, loading: false });
		}
	};

	LoginForm = () => (
		<div className="login-form">
			<style JSX>{`
                .login-form {
                    width:100%;
                    height:100%;
                    position:absolute;
                    background: url('../../static/blockchain.jpg') no-repeat;
                } 
              `}</style>

			<Grid textAlign="center" style={{ height: '100%' }} verticalAlign="middle">
				<Grid.Column style={{ maxWidth: 380 }}>
					<Form size="large">
						<Segment>
							<Header as="h2" color="black" textAlign="center" style={{ marginTop: 10 }}>
								Create an election!
							</Header>
							<Form.Input
								fluid
								iconPosition="left"
								icon="address card outline"
								placeholder="Election Name"
								style={{ padding: 5 }}
								value={this.state.election_name}
								onChange={event => this.setState({ election_name: event.target.value })}
								required={true}
							/>
							<Form.Input
								as="TextArea"
								required={true}
								style={{
									maxHeight: '30px',
									maxWidth: '96%',
									marginBottom: '10px',
								}}
								fluid
								placeholder="Election Description"
								value={this.state.election_description}
								onChange={event => this.setState({ election_description: event.target.value })}
							/>

							<Button
								color="blue"
								fluid
								size="large"
								style={{ marginBottom: 15 }}
								onClick={this.signin}
								loading={this.state.loading}
							>
								Submit
							</Button>
							{this.state.errorMess ? <Message negative>{this.state.errorMess}</Message> : null}
							<Message icon info>
								<Icon name="exclamation circle" />
								<Message.Header>Note: </Message.Header>
								<Message.Content>Confirm the transaction in MetaMask to create your election.</Message.Content>
							</Message>
						</Segment>
					</Form>
				</Grid.Column>
			</Grid>
		</div>
	);

	render() {
		return (
			<div>
				<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
				{/* <link href="../css/paper-dashboard.css?v=2.0.0" rel="stylesheet" /> */}
				{this.LoginForm()}
			</div>
		);
	}
}

export default LoginForm;
