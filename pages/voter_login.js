import React, { Component } from 'react';
import { Button, Form, Grid, Header, Segment, Icon, Message } from 'semantic-ui-react';
import Cookies from 'js-cookie';
import { Router } from '../routes';
import { Helmet } from 'react-helmet';

class LoginForm extends Component {
	state = {
		email: '',
		password: '',
		loading: false,
		error: '',
	};

	signin = async event => {
		event.preventDefault();
		const { email, password } = this.state;
		if (!email || !password) {
			this.setState({ error: 'Please enter both email and password.' });
			return;
		}

		this.setState({ loading: true, error: '' });

		// Prompt MetaMask connection if available
		if (typeof window !== 'undefined' && window.ethereum) {
			try {
				await window.ethereum.request({ method: 'eth_requestAccounts' });
			} catch (mmErr) {
				console.log('MetaMask connect warning:', mmErr.message);
			}
		}

		try {
			const response = await fetch('/voter/authenticate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: 'email=' + encodeURIComponent(email.trim()) + '&password=' + encodeURIComponent(password.trim()),
			});

			const responseObj = await response.json();
			if (responseObj.status === 'success') {
				const voterEmail = responseObj.data.email || email.trim();
				const electionAddress = responseObj.data.election_address;

				Cookies.set('voter_email', voterEmail);
				Cookies.set('address', electionAddress);

				Router.pushRoute(`/election/${electionAddress}/vote`);
			} else {
				this.setState({ error: responseObj.message || 'Invalid email or password.' });
			}
		} catch (err) {
			this.setState({ error: 'Network error: ' + err.message });
		}
		this.setState({ loading: false });
	};

	render() {
		return (
			<div>
				<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
				<Helmet>
					<title>Voter Login</title>
					<link rel="shortcut icon" type="image/x-icon" href="../../static/logo3.png" />
				</Helmet>

				<div
					style={{
						width: '100vw',
						minHeight: '100vh',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#f7fafc',
						padding: '20px',
					}}
				>
					<Grid textAlign="center" style={{ width: '100%', maxWidth: '420px' }}>
						<Grid.Column>
							<Segment style={{ padding: '30px 25px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
								<div style={{ textAlign: 'center', marginBottom: '20px' }}>
									<Icon name="check square outline" size="huge" color="blue" />
									<Header as="h2" color="black" style={{ marginTop: '10px' }}>
										Voter Sign In
										<Header.Subheader>Enter your credentials to cast your vote</Header.Subheader>
									</Header>
								</div>

								{this.state.error && (
									<Message negative size="small">
										<p>{this.state.error}</p>
									</Message>
								)}

								<Form size="large">
									<Form.Input
										fluid
										icon="user"
										iconPosition="left"
										placeholder="Voter Email"
										value={this.state.email}
										onChange={e => this.setState({ email: e.target.value })}
									/>
									<Form.Input
										fluid
										icon="lock"
										iconPosition="left"
										placeholder="Password"
										type="password"
										value={this.state.password}
										onChange={e => this.setState({ password: e.target.value })}
									/>

									<Button
										color="blue"
										fluid
										size="large"
										onClick={this.signin}
										loading={this.state.loading}
										style={{ marginTop: '15px' }}
									>
										Sign In to Vote
									</Button>
								</Form>

								<div style={{ marginTop: '20px', fontSize: '12px', color: '#718096', textAlign: 'center' }}>
									<p>Need your password? Check with the election authority or view the Voter List dashboard.</p>
								</div>
							</Segment>
						</Grid.Column>
					</Grid>
				</div>
			</div>
		);
	}
}

export default LoginForm;
