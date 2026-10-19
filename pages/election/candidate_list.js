import React, { Component } from 'react';
import { Grid, Button, Form, Image, Header, Icon, Container, Card, Segment, Message } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import CompanySidebar from '../../components/CompanySidebar';
import { getAccounts, sendTx } from '../../Ethereum/web3';
import Cookies from 'js-cookie';
import { Router } from '../../routes';
import Election from '../../Ethereum/election';
import uploadImage from '../../upload';
import { Helmet } from 'react-helmet';

class CandidateList extends Component {
	static async getInitialProps({ query }) {
		return { address: query.address };
	}

	state = {
		election_address: this.props.address || Cookies.get('address'),
		election_name: '',
		election_description: '',
		candidates: [],
		item: [],
		cand_name: '',
		cand_desc: '',
		cand_email: '',
		selectedFile: null,
		fileName: '',
		loading: false,
		fetching: true,
	};

	imageSrc = hash => {
		if (hash && (hash.startsWith('/') || hash.startsWith('http') || hash.startsWith('data:'))) return hash;
		if (hash) return `https://ipfs.io/ipfs/${hash}`;
		return '/static/logo3.png';
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

			const c = await election.methods.getNumOfCandidates().call();
			const count = parseInt(c, 10) || 0;

			const candidates = [];
			for (let i = 0; i < count; i++) {
				candidates.push(await election.methods.getCandidate(i).call());
			}

			const items = candidates.map((candidate, i) => {
				return {
					header: candidate[0],
					meta: candidate[4] || 'No email provided',
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
							<span style={{ fontSize: '11px', color: '#718096' }}>ID: #{i}</span>
						</div>
					),
				};
			});

			this.setState({ item: items, fetching: false });
		} catch (err) {
			console.log('Error loading candidates:', err.message);
			this.setState({ fetching: false });
			alert('Error loading candidates: ' + err.message);
		}
	}

	captureFile = event => {
		event.stopPropagation();
		event.preventDefault();
		const file = event.target.files && event.target.files[0];
		if (file) {
			this.setState({ selectedFile: file, fileName: file.name });
		}
	};

	onSubmit = async event => {
		event.preventDefault();
		const email = this.state.cand_email || (document.getElementById('email') ? document.getElementById('email').value : '');
		const name = this.state.cand_name;

		if (!name || !email) {
			alert('Please fill both the Candidate Name and E-mail fields.');
			return;
		}

		this.setState({ loading: true });
		try {
			const accounts = await getAccounts();
			if (!accounts || !accounts.length) {
				throw new Error('No Ethereum account found. Please connect MetaMask.');
			}
			const add = this.state.election_address || Cookies.get('address');
			const election = Election(add);

			let imgHash = '/static/logo3.png';
			if (this.state.selectedFile) {
				try {
					imgHash = await uploadImage(this.state.selectedFile);
				} catch (uploadErr) {
					console.log('Image upload warning:', uploadErr.message);
					imgHash = '/static/logo3.png';
				}
			}

			await sendTx(
				election.methods.addCandidate(name, this.state.cand_desc || '', imgHash, email),
				{ from: accounts[0] }
			);

			try {
				await fetch('/candidate/registerCandidate', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: 'email=' + encodeURIComponent(email) + '&election_name=' + encodeURIComponent(this.state.election_name),
				});
			} catch (mailErr) {
				console.log('Email notification skipped:', mailErr.message);
			}

			alert('Candidate added successfully to the blockchain!');
			window.location.reload();
		} catch (err) {
			console.log('Candidate registration error:', err);
			alert(err.message || 'Failed to add candidate.');
		}
		this.setState({ loading: false });
	};

	render() {
		const { election_name, election_description, election_address, item, loading, fetching, fileName } = this.state;

		return (
			<div>
				<Helmet>
					<title>{election_name ? `${election_name} - Candidates` : 'Candidate List'}</title>
					<link rel="shortcut icon" type="image/x-icon" href="../../static/logo3.png" />
				</Helmet>
				<Layout>
					<Grid stackable style={{ marginTop: '1.5em' }}>
						<Grid.Row>
							<Grid.Column width={3}>
								<CompanySidebar activeItem="candidate_list" address={election_address} />
							</Grid.Column>

							<Grid.Column width={13}>
								<div style={{ marginBottom: '1.5em' }}>
									<Header as="h2">
										<Icon name="address card" />
										<Header.Content>
											{election_name || 'Candidate Management'}
											<Header.Subheader>{election_description}</Header.Subheader>
										</Header.Content>
									</Header>
								</div>

								<Grid stackable>
									<Grid.Column width={10}>
										<Header as="h3" dividing>
											<Icon name="users" />
											<Header.Content>
												Candidate List ({item.length})
											</Header.Content>
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
												<p style={{ color: '#718096' }}>
													Fill out the "Add Candidate" form on the right to register your first candidate.
												</p>
											</Segment>
										)}
									</Grid.Column>

									<Grid.Column width={6}>
										<Segment style={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
											<Header as="h3" textAlign="center" dividing>
												<Icon name="user plus" />
												<Header.Content>Add Candidate</Header.Content>
											</Header>

											<Form size="small">
												<Form.Input
													fluid
													label="Full Name *"
													placeholder="Candidate's full name"
													value={this.state.cand_name}
													onChange={event => this.setState({ cand_name: event.target.value })}
													required
												/>

												<Form.Input
													fluid
													id="email"
													label="E-mail Address *"
													placeholder="candidate@example.com"
													value={this.state.cand_email}
													onChange={event => this.setState({ cand_email: event.target.value })}
													required
												/>

												<Form.TextArea
													label="Description / Manifesto"
													placeholder="Party role, manifesto, key agenda..."
													value={this.state.cand_desc}
													onChange={event => this.setState({ cand_desc: event.target.value })}
													rows={3}
												/>

												<Form.Field>
													<label>Candidate Photo</label>
													<div style={{ marginBottom: '10px' }}>
														<input
															type="file"
															id="candidate_photo_input"
															accept="image/*"
															onChange={this.captureFile}
															style={{ display: 'none' }}
														/>
														<label
															htmlFor="candidate_photo_input"
															className="ui button fluid basic blue"
															style={{ cursor: 'pointer', textAlign: 'center' }}
														>
															<Icon name="upload" />
															{fileName ? fileName : 'Select Photo (Optional)'}
														</label>
													</div>
												</Form.Field>

												<Button
													primary
													fluid
													size="medium"
													onClick={this.onSubmit}
													loading={loading}
													style={{ marginTop: '15px' }}
												>
													<Icon name="plus circle" />
													Register Candidate On Blockchain
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

export default CandidateList;