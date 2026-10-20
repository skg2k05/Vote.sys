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
		Router.pushRoute('/homepage');
	};

	render() {
		const { activeItem } = this.props;

		return (
			<Menu vertical className="workspace-sidebar">
				<Menu.Item header className="sidebar-heading"><span>WORKSPACE</span><small>Manage your election</small></Menu.Item>

				<Menu.Item
					active={activeItem === 'dashboard'}
					onClick={() => this.navigate('company_dashboard')}
					className={activeItem === 'dashboard' ? 'sidebar-link active' : 'sidebar-link'}
				>
					<Icon name="dashboard" size="large" />
					Dashboard
				</Menu.Item>

				<Menu.Item
					active={activeItem === 'candidate_list'}
					onClick={() => this.navigate('candidate_list')}
					className={activeItem === 'candidate_list' ? 'sidebar-link active' : 'sidebar-link'}
				>
					<Icon name="user outline" size="large" />
					Candidate List
				</Menu.Item>

				<Menu.Item
					active={activeItem === 'voting_list'}
					onClick={() => this.navigate('voting_list')}
					className={activeItem === 'voting_list' ? 'sidebar-link active' : 'sidebar-link'}
				>
					<Icon name="list" size="large" />
					Voter List
				</Menu.Item>

				<Menu.Item
					onClick={this.signOut}
					className="sidebar-link sidebar-signout"
				>
					<Icon name="sign out" size="large" />
					Sign Out
				</Menu.Item>
			</Menu>
		);
	}
}
