import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import Cookies from 'js-cookie';
import { Router } from '../routes';

export default class CompanySidebar extends React.Component {
	navigate = path => {
		const address = this.props.address || Cookies.get('address');
		if (!address) {
			Router.pushRoute('/company_login');
			return;
		}
		Router.pushRoute(`/election/${address}/${path}`);
	};

	signOut = () => {
		Cookies.remove('address');
		Cookies.remove('company_email');
		Cookies.remove('company_id');
		alert('Logging out.');
		Router.pushRoute('/homepage');
	};

	render() {
		const { activeItem } = this.props;

		return (
			<Menu
				vertical
				icon="labeled"
				style={{
					width: '100%',
					minHeight: '480px',
					backgroundColor: '#ffffff',
					borderRadius: '8px',
					boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
					border: '1px solid #e2e8f0',
				}}
			>
				<Menu.Item header style={{ color: '#2d3748', textAlign: 'center', padding: '20px 10px' }}>
					<h3 style={{ margin: 0, letterSpacing: '1px', fontWeight: 'bold' }}>MENU</h3>
				</Menu.Item>

				<Menu.Item
					active={activeItem === 'dashboard'}
					onClick={() => this.navigate('company_dashboard')}
					style={{
						cursor: 'pointer',
						color: activeItem === 'dashboard' ? '#2185d0' : '#4a5568',
						fontWeight: activeItem === 'dashboard' ? 'bold' : 'normal',
						backgroundColor: activeItem === 'dashboard' ? '#f0f7fd' : 'transparent',
						padding: '16px 10px',
					}}
				>
					<Icon name="dashboard" size="large" />
					Dashboard
				</Menu.Item>

				<Menu.Item
					active={activeItem === 'candidate_list'}
					onClick={() => this.navigate('candidate_list')}
					style={{
						cursor: 'pointer',
						color: activeItem === 'candidate_list' ? '#2185d0' : '#4a5568',
						fontWeight: activeItem === 'candidate_list' ? 'bold' : 'normal',
						backgroundColor: activeItem === 'candidate_list' ? '#f0f7fd' : 'transparent',
						padding: '16px 10px',
					}}
				>
					<Icon name="user outline" size="large" />
					Candidate List
				</Menu.Item>

				<Menu.Item
					active={activeItem === 'voting_list'}
					onClick={() => this.navigate('voting_list')}
					style={{
						cursor: 'pointer',
						color: activeItem === 'voting_list' ? '#2185d0' : '#4a5568',
						fontWeight: activeItem === 'voting_list' ? 'bold' : 'normal',
						backgroundColor: activeItem === 'voting_list' ? '#f0f7fd' : 'transparent',
						padding: '16px 10px',
					}}
				>
					<Icon name="list" size="large" />
					Voter List
				</Menu.Item>

				<Menu.Item
					onClick={this.signOut}
					style={{
						cursor: 'pointer',
						color: '#e53e3e',
						padding: '16px 10px',
						marginTop: '40px',
						borderTop: '1px solid #edf2f7',
					}}
				>
					<Icon name="sign out" size="large" />
					Sign Out
				</Menu.Item>
			</Menu>
		);
	}
}
