import React, { Component } from 'react';

class Index extends Component {
	static async getInitialProps({ res }) {
		if (res) {
			res.writeHead(302, { Location: '/homepage' });
			res.end();
		}
		return {};
	}

	render() {
		return <div />;
	}
}

export default Index;
