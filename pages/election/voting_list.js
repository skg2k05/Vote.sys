import React, { Component } from 'react';
import { Grid, Header, Button, Form, Input, Icon, Modal, Card, Segment, Message } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import CompanySidebar from '../../components/CompanySidebar';
import Cookies from 'js-cookie';
import { Router } from '../../routes';
import Election from '../../Ethereum/election';
import { getAccounts, sendTx } from '../../Ethereum/web3';
import { Helmet } from 'react-helmet';

class VotingList extends Component {
	static async getInitialProps({ query }) {
		return { address: query.address };
	}

	state = {
		election_address: this.props.address || Cookies.get('address'),
		election_name: '',
		election_description: '',
		voters: [],
		item: [],
		reg_email: '',
		reg_wallet: '',
		reg_password: '',
		loading: false,
		fetching: true,
		newVoterCreds: null,
	};

	async componentDidMount() {
		const add = this.props.address || Cookies.get('address');
		if (!add) {
			alert('No election address found. Redirecting to login page...');
			Router.pushRoute('/company_login');
			return;
		}

		Cookies.set('address', add);
		this.setState({ election_address: add });

		try {
			const election = Election(add);
			const summary = await election.methods.getElectionDetails().call();
			this.setState({
				election_name: summary[0],
				election_description: summary[1],
			});
		} catch (err) {
			console.log('Error loading election summary:', err.message);
		}

		this.loadVoters(add);
	}

	loadVoters = async address => {
		try {
			const response = await fetch('/voter/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: 'election_address=' + encodeURIComponent(address),
			});
			const responseObj = await response.json();
			if (responseObj.status === 'success' && responseObj.data && responseObj.data.voters) {
				this.setState({ voters: responseObj.data.voters, fetching: false });
				this.buildItems(responseObj.data.voters);
			} else {
				this.setState({ fetching: false });
			}
		} catch (err) {
			console.log('Error fetching voters:', err.message);
			this.setState({ fetching: false });
		}
	};

	buildItems = voters => {
		const items = voters.map(voter => ({
			header: (
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<span style={{ fontSize: '16px', fontWeight: 'bold' }}>{voter.email}</span>
				</div>
			),
			meta: voter.wallet_address ? (
				<span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#2b6cb0' }}>
					Wallet: {voter.wallet_address}
				</span>
			) : (
				<span style={{ color: '#e53e3e', fontSize: '12px' }}>No wallet address (cannot vote on-chain)</span>
			),
			description: (
				<div style={{ marginTop: '12px' }}>
					<div
						style={{
							backgroundColor: '#f7fafc',
							border: '1px solid #e2e8f0',
							borderRadius: '6px',
							padding: '8px 12px',
							marginBottom: '10px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<div>
							<span style={{ fontSize: '12px', color: '#718096' }}>Login Password: </span>
							<strong style={{ fontFamily: 'monospace', fontSize: '14px', color: '#2d3748' }}>
								{voter.temp_password || '(Click Reset to set)'}
							</strong>
						</div>
						{voter.temp_password && (
							<Button
								size="mini"
								basic
								icon="copy"
								content="Copy"
								onClick={() => {
									navigator.clipboard.writeText(voter.temp_password);
									alert('Password copied to clipboard: ' + voter.temp_password);
								}}
							/>
						)}
					</div>

					<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
						<Button
							size="tiny"
							basic
							color="blue"
							onClick={() => this.promptResetPassword(voter.id, voter.email)}
						>
							<Icon name="key" /> Reset Password
						</Button>

						<Button
							negative
							basic
							size="tiny"
							value={voter.id}
							onClick={this.deleteVoter}
						>
							<Icon name="trash" /> Remove Voter
						</Button>
					</div>
				</div>
			),
		}));
		this.setState({ item: items });
	};

	promptResetPassword = async (voterId, email) => {
		const customPass = prompt(`Enter new password for ${email} (or leave empty to auto-generate):`);
		if (customPass === null) return; // User cancelled

		try {
			const response = await fetch(`/voter/${voterId}/resetPassword`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: 'password=' + encodeURIComponent(customPass),
			});
			const responseObj = await response.json();
			if (responseObj.status === 'success') {
				alert(
					`Password updated successfully!\n\nEmail: ${email}\nNew Password: ${responseObj.data.tempPassword}\n\nPlease save this password for logging in!`
				);
				this.loadVoters(this.state.election_address);
			} else {
				alert(responseObj.message || 'Failed to reset password.');
			}
		} catch (err) {
			alert('Error resetting password: ' + err.message);
		}
	};

	deleteVoter = async event => {
		const id = event.currentTarget.value;
		if (!confirm('Are you sure you want to remove this voter from the election?')) return;

		try {
			const voter = this.state.voters.find(v => v.id === id);
			if (voter && voter.wallet_address) {
				const accounts = await getAccounts();
				const election = Election(this.state.election_address);
				await sendTx(election.methods.removeVoter(voter.wallet_address), { from: accounts[0] });
			}

			const response = await fetch('/voter/' + id, { method: 'DELETE' });
			const responseObj = await response.json();
			alert(responseObj.message || 'Voter removed.');
			this.loadVoters(this.state.election_address);
		} catch (err) {
			alert(err.message);
		}
	};

	register = async event => {
		event.preventDefault();
		const email = this.state.reg_email.trim();
		const wallet = this.state.reg_wallet.trim();
		const password = this.state.reg_password.trim();

		if (!email) {
			alert('Please enter a voter email address.');
			return;
		}

		this.setState({ loading: true });
		try {
			const response = await fetch('/voter/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body:
					'email=' +
					encodeURIComponent(email) +
					'&wallet_address=' +
					encodeURIComponent(wallet) +
					'&password=' +
					encodeURIComponent(password) +
					'&election_address=' +
					encodeURIComponent(this.state.election_address) +
					'&election_name=' +
					encodeURIComponent(this.state.election_name) +
					'&election_description=' +
					encodeURIComponent(this.state.election_description),
			});

			const responseObj = await response.json();
			if (responseObj.status !== 'success') {
				alert(responseObj.message);
				this.setState({ loading: false });
				return;
			}

			const generatedPassword = responseObj.data ? responseObj.data.tempPassword : password;

			if (wallet) {
				const accounts = await getAccounts();
				const election = Election(this.state.election_address);
				await sendTx(election.methods.addVoter(wallet), { from: accounts[0] });
			}

			this.setState({
				newVoterCreds: {
					email: email,
					password: generatedPassword,
					wallet: wallet,
				},
				reg_email: '',
				reg_wallet: '',
				reg_password: '',
				loading: false,
			});

			this.loadVoters(this.state.election_address);
		} catch (err) {
			console.error(err);
			alert(err.message || 'Error registering voter');
			this.setState({ loading: false });
		}
	};

	render() {
		const { election_name, election_description, election_address, item, loading, fetching, newVoterCreds } = this.state;

		return (
			<div>
				<Helmet>
					<title>{election_name ? `${election_name} - Voter List` : 'Voter List'}</title>
					<link rel="shortcut icon" type="image/x-icon" href="../../static/logo3.png" />
				</Helmet>
				<Layout>
					<Grid stackable style={{ marginTop: '1.5em' }}>
						<Grid.Row>
							<Grid.Column width={3}>
								<CompanySidebar activeItem="voting_list" address={election_address} />
							</Grid.Column>

							<Grid.Column width={13}>
								<div style={{ marginBottom: '1.5em' }}>
									<Header as="h2">
										<Icon name="address card" />
										<Header.Content>
											{election_name || 'Voter Management'}
											<Header.Subheader>{election_description}</Header.Subheader>
										</Header.Content>
									</Header>
								</div>

								{newVoterCreds && (
									<Message
										success
										onDismiss={() => this.setState({ newVoterCreds: null })}
										style={{ marginBottom: '1.5em' }}
									>
										<Message.Header>
											<Icon name="check circle" /> Voter Registered & Whitelisted Successfully!
										</Message.Header>
										<div style={{ marginTop: '10px', fontSize: '14px' }}>
											<p>
												<strong>Voter Email:</strong> {newVoterCreds.email}
											</p>
											<p>
												<strong>Voter Password:</strong>{' '}
												<span style={{ fontFamily: 'monospace', fontSize: '16px', color: '#c53030' }}>
													{newVoterCreds.password}
												</span>
											</p>
											{newVoterCreds.wallet && (
												<p>
													<strong>Whitelisted Wallet:</strong> {newVoterCreds.wallet}
												</p>
											)}
											<p style={{ color: '#4a5568', fontStyle: 'italic', marginTop: '8px' }}>
												👉 The voter can now sign in at <strong>http://localhost:3000/voter_login</strong> using this email and password!
											</p>
										</div>
									</Message>
								)}

								<Grid stackable>
									<Grid.Column width={10}>
										<Header as="h3" dividing>
											<Icon name="list" />
											<Header.Content>Registered Voters ({item.length})</Header.Content>
										</Header>

										{fetching ? (
											<div style={{ textAlign: 'center', padding: '3em' }}>
												<Icon name="spinner" loading size="big" />
												<p>Loading voters...</p>
											</div>
										) : item.length > 0 ? (
											<Card.Group itemsPerRow={1} stackable items={item} />
										) : (
											<Segment placeholder textAlign="center" style={{ padding: '3em' }}>
												<Header icon>
													<Icon name="users" />
													No voters registered yet.
												</Header>
												<p style={{ color: '#718096' }}>
													Use the registration form on the right to add and whitelist voters.
												</p>
											</Segment>
										)}
									</Grid.Column>

									<Grid.Column width={6}>
										<Segment style={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
											<Header as="h3" textAlign="center" dividing>
												<Icon name="user plus" />
												<Header.Content>Register Voter</Header.Content>
											</Header>

											<Form size="small">
												<Form.Input
													fluid
													label="Voter Email *"
													placeholder="voter@example.com"
													value={this.state.reg_email}
													onChange={event => this.setState({ reg_email: event.target.value })}
													required
												/>

												<Form.Input
													fluid
													label="MetaMask Wallet Address"
													placeholder="0x... (voter's MetaMask address)"
													value={this.state.reg_wallet}
													onChange={event => this.setState({ reg_wallet: event.target.value })}
												/>

												<Form.Input
													fluid
													label="Custom Password (Optional)"
													placeholder="e.g. voter123 (auto-generated if empty)"
													type="text"
													value={this.state.reg_password}
													onChange={event => this.setState({ reg_password: event.target.value })}
												/>

												<p style={{ fontSize: '11px', color: '#718096', lineHeight: '1.4' }}>
													Whitelists the wallet on the Ethereum smart contract. The voter uses this password to log in at <code>/voter_login</code>.
												</p>

												<Button
													primary
													fluid
													size="medium"
													onClick={this.register}
													loading={loading}
													style={{ marginTop: '15px' }}
												>
													<Icon name="add user" />
													Register & Whitelist
												</Button>
											</Form>
										</Segment>
									</Grid.Column>
								</Grid>
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Layout>
			</div>
		);
	}
}

export default VotingList;