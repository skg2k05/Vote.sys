import React, { Component } from 'react';
import { Grid, Step, Icon, Header, Button, Segment } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import CompanySidebar from '../../components/CompanySidebar';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import Election from '../../Ethereum/election';
import Cookies from 'js-cookie';
import { getAccounts, sendTx } from '../../Ethereum/web3';
import { Router } from '../../routes';
import { Helmet } from 'react-helmet';

const options = {
	maintainAspectRatio: true,
	responsive: true,
	scales: {
		yAxes: [
			{
				height: '500px',
				stacked: true,
				gridLines: {
					display: true,
					color: 'rgba(255,99,132,0.2)',
				},
			},
		],
		xAxes: [
			{
				width: '500px',
				gridLines: {
					display: false,
				},
			},
		],
	},
};

class ContainerExampleContainer extends Component {
	static async getInitialProps({ query }) {
		return { address: query.address };
	}

	state = {
		election_address: this.props.address || Cookies.get('address'),
		election_name: '',
		election_desc: '',
		voters: 0,
		candidates: 0,
		isActive: true,
		loading: false,
		b: 0,
		graphLabels: [],
		graphVotes: [],
	};

	async componentDidMount() {
		const add = this.props.address || Cookies.get('address');
		if (!add) {
			Router.pushRoute('/company_login');
			return;
		}

		Cookies.set('address', add);
		this.setState({ election_address: add });

		try {
			const response = await fetch('/voter/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: 'election_address=' + encodeURIComponent(add),
			});
			const responseObj = await response.json();
			if (responseObj.status === 'success') {
				this.setState({ b: responseObj.count });
			}
		} catch (err) {
			console.log('Error fetching voter count:', err.message);
		}

		try {
			const election = Election(add);
			const summary = await election.methods.getElectionDetails().call();
			const v = await election.methods.getNumOfVoters().call();
			const c = await election.methods.getNumOfCandidates().call();
			const isActive = await election.methods.status().call();

			const count = parseInt(c, 10) || 0;
			const graphLabels = [];
			const graphVotes = [];

			for (let i = 0; i < count; i++) {
				const tp = await election.methods.getCandidate(i).call();
				graphLabels.push(tp[0]);
				graphVotes.push(parseInt(tp[3], 10));
			}

			this.setState({
				voters: v.toString(),
				candidates: count.toString(),
				election_name: summary[0],
				election_desc: summary[1],
				isActive: isActive,
				graphLabels: graphLabels,
				graphVotes: graphVotes,
			});
		} catch (err) {
			console.log('Error loading election:', err.message);
			alert('Redirecting you to login page...');
			Router.pushRoute('/company_login');
		}
	}

	endElection = async event => {
		try {
			this.setState({ loading: true });
			const add = this.state.election_address || Cookies.get('address');
			const election = Election(add);
			const accounts = await getAccounts();
			if (!accounts || !accounts.length) {
				throw new Error('No Ethereum account found. Please connect MetaMask.');
			}
			await sendTx(election.methods.endElection(), { from: accounts[0] });
			const candidateID = await election.methods.winnerCandidate().call();
			const cand = await election.methods.getCandidate(candidateID).call();
			this.setState({ isActive: false });

			const params =
				'election_address=' +
				encodeURIComponent(add) +
				'&election_name=' +
				encodeURIComponent(this.state.election_name) +
				'&candidate_email=' +
				encodeURIComponent(cand[4]) +
				'&winner_candidate=' +
				encodeURIComponent(cand[0]);

			await fetch('/voter/resultMail', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: params,
			});

			alert('Election ended! Winner: ' + cand[0]);
			this.setState({ loading: false });
		} catch (err) {
			console.log(err.message);
			alert(err.message);
			this.setState({ loading: false });
		}
	};

	returnGraph = () => {
		const data = {
			labels: this.state.graphLabels,
			datasets: [
				{
					label: 'Vote Counts',
					backgroundColor: 'rgba(255,99,132,0.2)',
					borderColor: 'rgba(255,99,132,1)',
					borderWidth: 2,
					hoverBackgroundColor: 'rgba(255,99,132,0.4)',
					hoverBorderColor: 'rgba(255,99,132,1)',
					data: this.state.graphVotes,
				},
			],
		};
		return <Bar data={data} width={120} height={50} options={options} />;
	};

	render() {
		const { election_name, election_desc, election_address, b, candidates, voters, isActive, loading, graphLabels } = this.state;

		return (
			<div>
				<Helmet>
					<title>{election_name ? `${election_name} - Dashboard` : 'Dashboard'}</title>
					<link rel="shortcut icon" type="image/x-icon" href="../../static/logo3.png" />
				</Helmet>
				<Layout>
					<Grid stackable style={{ marginTop: '1.5em' }}>
						<Grid.Row>
							<Grid.Column width={3}>
								<CompanySidebar activeItem="dashboard" address={election_address} />
							</Grid.Column>

							<Grid.Column width={13}>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										marginBottom: '1.5em',
										flexWrap: 'wrap',
										gap: '15px',
									}}
								>
									<div>
										<Header as="h2" style={{ margin: 0 }}>
											<Icon name="address card" />
											<Header.Content>
												{election_name || 'Loading Election...'}
												<Header.Subheader>{election_desc}</Header.Subheader>
											</Header.Content>
										</Header>
									</div>

									<Button
										negative
										onClick={this.endElection}
										loading={loading}
										disabled={!isActive}
										size="medium"
									>
										{isActive ? 'End election' : 'Election ended'}
									</Button>
								</div>

								<Step.Group fluid widths={4} style={{ marginBottom: '2em' }}>
									<Step icon="users" title="Voters" description={b} />
									<Step icon="user outline" title="Candidates" description={candidates} />
									<Step
										icon="chart bar outline"
										title="Total Votes"
										description={voters}
									/>
									<Step
										icon="flag"
										title="Status"
										description={isActive ? 'Active' : 'Ended'}
									/>
								</Step.Group>

								<Segment style={{ padding: '1.5em', borderRadius: '8px', minHeight: '350px' }}>
									<Header as="h3" dividing>
										<Icon name="chart bar" />
										<Header.Content>Election Live Results</Header.Content>
									</Header>

									{graphLabels && graphLabels.length > 0 ? (
										<div style={{ marginTop: '1.5em' }}>
											{this.returnGraph()}
										</div>
									) : (
										<div style={{ textAlign: 'center', padding: '3em 1em', color: '#718096' }}>
											<Icon name="users" size="huge" style={{ color: '#cbd5e0', marginBottom: '15px' }} />
											<h4>No candidates registered yet.</h4>
											<p>Go to the <strong>Candidate List</strong> tab to register election candidates.</p>
										</div>
									)}
								</Segment>
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Layout>
			</div>
		);
	}
}

export default ContainerExampleContainer;
