import React, { Component } from 'react';
import { Grid, Button, Header, Icon, Image, Card, Segment, Menu, Message } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import { getAccounts, sendTx } from '../../Ethereum/web3';
import Election from '../../Ethereum/election';
import Cookies from 'js-cookie';
import { Router } from '../../routes';
import { Helmet } from 'react-helmet';

class VotePage extends Component {
	static async getInitialProps({ query }) {
		return { address: query.address };
	}

	state = {
		election_address: this.props.address || Cookies.get('address'),
		election_name: '',
		election_description: '',
		candidates: [],
		item: [],
		loading: false,
		fetching: true,
		hasVoted: false,
		isRegistered: null,
		connectedAccount: '',
	};

	imageSrc = hash => {
		if (hash && (hash.startsWith('/') || hash.startsWith('http') || hash.startsWith('data:'))) return hash;
		if (hash) return `https://ipfs.io/ipfs/${hash}`;
		return '/static/logo3.png';
	};

	signOut = () => {
		Cookies.remove('address');
		Cookies.remove('voter_email');
		alert('Logging out.');
		Router.pushRoute('/homepage');
	};

	checkAccountStatus = async account => {
		if (!account) return;
		try {
			const add = this.state.election_address || Cookies.get('address');
			const election = Election(add);
			const isReg = await election.methods.registeredVoters(account).call();
			const voterInfo = await election.methods.voters(account).call();
			this.setState({
				connectedAccount: account,
				isRegistered: isReg,
				hasVoted: voterInfo.voted,
			});
		} catch (err) {
			console.log('Status check error:', err.message);
		}
	};

	switchAccount = async () => {
		if (typeof window !== 'undefined' && window.ethereum) {
			try {
				await window.ethereum.request({
					method: 'wallet_requestPermissions',
					params: [{ eth_accounts: {} }],
				});
				const accounts = await getAccounts();
				if (accounts && accounts.length) {
					this.checkAccountStatus(accounts[0]);
				}
			} catch (err) {
				console.log('Account switch cancelled/failed:', err.message);
			}
		}
	};

	async componentDidMount() {
		const add = this.props.address || Cookies.get('address');
		if (!add) {
			alert('Session expired. Redirecting to login page...');
			Router.pushRoute('/voter_login');
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

			const accounts = await getAccounts();
			if (accounts && accounts.length) {
				await this.checkAccountStatus(accounts[0]);
			}

			if (typeof window !== 'undefined' && window.ethereum) {
				window.ethereum.on('accountsChanged', accounts => {
					if (accounts && accounts.length) {
						this.checkAccountStatus(accounts[0]);
					}
				});
			}

			const c = await election.methods.getNumOfCandidates().call();
			const count = parseInt(c, 10) || 0;

			const candidates = [];
			for (let i = 0; i < count; i++) {
				candidates.push(await election.methods.getCandidate(i).call());
			}

			const items = candidates.map((candidate, i) => {
				return {
					header: candidate[0],
					meta: candidate[4] || 'Candidate',
					description: candidate[1] || 'No description provided',
					image: (
						<div style={{ textAlign: 'center', padding: '10px' }}>
							<Image
								id={i}
								src={this.imageSrc(candidate[2])}
								style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }}
							/>
						</div>
					),
					extra: (
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<div>
								<Icon name="chart bar" color="blue" />
								<strong>{candidate[3].toString()}</strong> votes
							</div>
							<Button
								id={i}
								primary
								size="small"
								onClick={this.vote}
								loading={this.state.loading}
								disabled={this.state.hasVoted}
							>
								{this.state.hasVoted ? 'Voted' : 'Vote!'}
							</Button>
						</div>
					),
				};
			});

			this.setState({ item: items, fetching: false });
		} catch (err) {
			console.log(err.message);
			this.setState({ fetching: false });
			alert('Session error. Redirecting to login page...');
			Router.pushRoute('/voter_login');
		}
	}

	vote = async event => {
		const candidateId = parseInt(event.currentTarget.id, 10);
		try {
			this.setState({ loading: true });
			const accounts = await getAccounts();
			if (!accounts || !accounts.length) {
				alert('No Ethereum account found. Please connect MetaMask.');
				this.setState({ loading: false });
				return;
			}

			const currentAccount = accounts[0];
			const add = this.state.election_address || Cookies.get('address');
			const election = Election(add);

			const isRegistered = await election.methods.registeredVoters(currentAccount).call();
			if (!isRegistered) {
				alert(
					`This MetaMask account (${currentAccount}) is not registered for this election.\n\n` +
					`Please switch to your registered voter account in MetaMask, or ask the company to whitelist this account.`
				);
				this.setState({ loading: false });
				return;
			}

			const voterInfo = await election.methods.voters(currentAccount).call();
			if (voterInfo.voted) {
				alert('You have already cast your vote in this election!');
				this.setState({ loading: false });
				return;
			}

			const receipt = await sendTx(election.methods.vote(candidateId), { from: currentAccount });
			alert('Vote successfully recorded on the blockchain!\nTransaction hash: ' + receipt.transactionHash);
			window.location.reload();
		} catch (err) {
			alert(err.message || 'Transaction failed');
		}
		this.setState({ loading: false });
	};

	render() {
		const { election_name, election_description, item, fetching, hasVoted, isRegistered, connectedAccount } = this.state;

		return (
			<div>
				<Helmet>
					<title>{election_name ? `${election_name} - Voting Booth` : 'Voting Booth'}</title>
					<link rel="shortcut icon" type="image/x-icon" href="../../static/logo3.png" />
				</Helmet>
				<Layout>
					<Grid stackable style={{ marginTop: '1.5em' }}>
						<Grid.Row>
							<Grid.Column width={3}>
								<Menu vertical className="workspace-sidebar voter-sidebar">
									<Menu.Item header className="sidebar-heading"><span>VOTER WORKSPACE</span><small>Election participation</small></Menu.Item>
									<Menu.Item
										active
										className="sidebar-link active"
									>
										<Icon name="check square outline" size="large" />
										Cast Vote
									</Menu.Item>
									<Menu.Item
										onClick={this.signOut}
										className="sidebar-link sidebar-signout"
									>
										<Icon name="sign out" size="large" />
										Sign Out
									</Menu.Item>
								</Menu>
							</Grid.Column>

							<Grid.Column width={13}>
								<div style={{ marginBottom: '1.5em' }}>
									<Header as="h2">
										<Icon name="check square" />
										<Header.Content>
											{election_name || 'Election Voting Booth'}
											<Header.Subheader>{election_description}</Header.Subheader>
										</Header.Content>
									</Header>
								</div>

								{/* Wallet connection status bar */}
								<Segment style={{ borderRadius: '8px', marginBottom: '1.5em', backgroundColor: '#f8fafc', padding: '15px' }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
										<div>
											<div style={{ fontSize: '13px', color: '#4a5568' }}>
												<strong>Logged in voter:</strong> {Cookies.get('voter_email') || 'Voter'}
											</div>
											<div style={{ fontSize: '13px', marginTop: '6px' }}>
												<strong>MetaMask Account:</strong>{' '}
												<span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
													{connectedAccount || 'Detecting account...'}
												</span>{' '}
												{isRegistered ? (
													<span style={{ color: '#2f855a', fontWeight: 'bold', marginLeft: '8px' }}>
														<Icon name="check circle" color="green" /> Whitelisted (Ready to Vote)
													</span>
												) : (
													<span style={{ color: '#c53030', fontWeight: 'bold', marginLeft: '8px' }}>
														<Icon name="warning sign" color="red" /> Not Whitelisted for this election
													</span>
												)}
											</div>
										</div>
										<Button size="small" basic color="blue" onClick={this.switchAccount}>
											<Icon name="exchange" /> Switch Account
										</Button>
									</div>
								</Segment>

								{hasVoted && (
									<Segment color="green" style={{ marginBottom: '1.5em' }}>
										<Header as="h4" color="green">
											<Icon name="check circle" />
											<Header.Content>You have already voted in this election!</Header.Content>
										</Header>
										<p>Thank you for participating. Your vote is immutably recorded on the Ethereum blockchain.</p>
									</Segment>
								)}

								<Header as="h3" dividing>
									Candidates ({item.length})
								</Header>

								{fetching ? (
									<div style={{ textAlign: 'center', padding: '3em' }}>
										<Icon name="spinner" loading size="big" />
										<p>Loading candidates from the blockchain...</p>
									</div>
								) : item.length > 0 ? (
									<Card.Group itemsPerRow={2} stackable items={item} />
								) : (
									<Segment placeholder textAlign="center" style={{ padding: '3em' }}>
										<Header icon>
											<Icon name="user outline" />
											No candidates registered yet.
										</Header>
										<p style={{ color: '#718096' }}>The election authority has not registered candidates yet.</p>
									</Segment>
								)}
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Layout>
			</div>
		);
	}
}

export default VotePage;
