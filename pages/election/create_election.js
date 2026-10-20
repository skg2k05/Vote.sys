import React, { Component } from 'react';
import { Button, Form, Header, Icon, Message } from 'semantic-ui-react';
import { getAccounts, sendTx } from '../../Ethereum/web3';
import Election_Factory from '../../Ethereum/election_factory';
import { Router } from '../../routes';
import Cookies from 'js-cookie';
import { Helmet } from 'react-helmet';
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
		<div className="create-election-page">
			<Helmet><title>Create an election | Vote.sys</title></Helmet>
			<a className="create-brand" href="/homepage"><span>✓</span> vote<span>.sys</span></a>
			<main className="create-election-card">
				<section className="create-intro">
					<p className="create-kicker">YOUR ELECTION WORKSPACE</p>
					<h1>Set the stage<br />for every voice.</h1>
					<p>Start with the essentials. You can add candidates and invite voters from your dashboard.</p>
					<div className="create-steps"><div><span>01</span><b>Give your election a name</b></div><div><span>02</span><b>Add a short description</b></div><div><span>03</span><b>Confirm with your wallet</b></div></div>
					<div className="create-orbit" aria-hidden="true"><div className="create-orbit-core"><Icon name="check" /></div><i /><i /><i /></div>
				</section>
				<section className="create-form-panel">
					<div className="create-form-icon"><Icon name="edit outline" /></div>
					<Header as="h2">Create an election</Header>
					<p className="create-subtitle">You can update the details before inviting voters.</p>
					<Form size="large" onSubmit={this.signin} className="create-form">
						<Form.Input fluid label="Election name" iconPosition="left" icon="address card outline" placeholder="e.g. Student Council 2026" value={this.state.election_name} onChange={event => this.setState({ election_name: event.target.value })} required />
						<Form.TextArea label="Description" placeholder="What is this election deciding?" value={this.state.election_description} onChange={event => this.setState({ election_description: event.target.value })} rows={4} required />
						{this.state.errorMess ? <Message negative size="small">{this.state.errorMess}</Message> : null}
						<Button type="submit" primary fluid loading={this.state.loading} className="create-submit">Create election <Icon name="arrow right" /></Button>
						<Message icon info className="wallet-notice"><Icon name="info circle" /><Message.Content>MetaMask will ask you to confirm the transaction that creates your election.</Message.Content></Message>
					</Form>
					<a className="create-back" href="/company_login">← Back to admin sign in</a>
				</section>
			</main>
			<style jsx global>{`
				*{box-sizing:border-box}.create-election-page{min-height:100vh;padding:28px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;overflow:hidden;background:radial-gradient(ellipse at 80% 0,rgba(87,112,237,.1),transparent 32%),#f4f6fb;color:#1c2849;font-family:Inter,'Avenir Next',Avenir,sans-serif}.create-brand{width:100%;max-width:1060px;display:flex;align-items:center;gap:8px;color:#1e2b50!important;text-decoration:none;font-size:17px;font-weight:800}.create-brand>span:first-child{width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;color:#fff;background:#536fe4}.create-brand>span:last-child{margin-left:-8px;color:#7286e5}.create-election-card{width:100%;max-width:1060px;min-height:590px;display:grid;grid-template-columns:1fr 1fr;overflow:hidden;border:1px solid #edf0f6;border-radius:20px;background:#fff;box-shadow:0 25px 70px rgba(37,50,91,.12)}.create-intro{position:relative;overflow:hidden;padding:51px 48px;color:#fff;background:linear-gradient(145deg,#182450,#2d478f 65%,#506de0)}.create-intro:before{content:'';position:absolute;width:470px;height:470px;left:-205px;bottom:-350px;border:1px solid rgba(255,255,255,.12);border-radius:50%;box-shadow:0 0 0 40px rgba(255,255,255,.025),0 0 0 80px rgba(255,255,255,.02)}.create-kicker{position:relative;z-index:1;color:#b8c7ff;font-size:8px;font-weight:800;letter-spacing:1.7px}.create-intro h1{position:relative;z-index:1;margin:22px 0 13px;color:#fff;font-size:41px;line-height:1.1;letter-spacing:-1.5px}.create-intro>p:not(.create-kicker){position:relative;z-index:1;max-width:330px;color:#d5defa;font-size:11px;line-height:1.8}.create-steps{position:relative;z-index:1;margin-top:34px}.create-steps>div{display:flex;align-items:center;gap:11px;margin:14px 0;color:#e7ebfb;font-size:10px}.create-steps span{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.23);border-radius:8px;color:#c4d0ff;font-size:8px;font-weight:800}.create-steps b{font-weight:600}.create-orbit{position:absolute;width:205px;height:205px;right:-5px;bottom:-22px;border:1px solid rgba(255,255,255,.15);border-radius:50%;box-shadow:0 0 0 22px rgba(255,255,255,.025),0 0 0 45px rgba(255,255,255,.02)}.create-orbit-core{position:absolute;left:73px;top:72px;width:58px;height:58px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.7);border-radius:18px;color:#506ad8;background:#fff;box-shadow:0 12px 25px rgba(7,20,59,.22);font-size:18px;animation:orbit-float 4s ease-in-out infinite}.create-orbit>i{position:absolute;width:8px;height:8px;border-radius:50%;background:#82d9c7}.create-orbit>i:nth-child(2){top:27px;left:100px}.create-orbit>i:nth-child(3){right:18px;top:106px;background:#b9c7ff}.create-orbit>i:nth-child(4){bottom:25px;left:48px;background:#e7c276}.create-form-panel{align-self:center;width:100%;max-width:420px;justify-self:center;padding:44px 39px}.create-form-icon{width:39px;height:39px;display:flex;align-items:center;justify-content:center;margin-bottom:17px;border:1px solid #e7ebfd;border-radius:11px;color:#5973e5;background:#f3f5ff}.create-form-panel :global(h2.ui.header){margin:0;color:#1e2948;font-size:25px;letter-spacing:-.6px}.create-subtitle{margin:8px 0 25px;color:#8d96aa;font-size:10px}.create-form :global(.field){margin-bottom:17px}.create-form :global(.field>label){margin-bottom:7px;color:#3c4867;font-size:10px;font-weight:700}.create-form :global(input),.create-form :global(textarea){border-color:#e5e9f2!important;border-radius:8px!important;background:#fcfdff!important;font-family:inherit!important;font-size:11px!important}.create-form :global(input:focus),.create-form :global(textarea:focus){border-color:#7288ef!important;background:#fff!important}.create-form :global(textarea){min-height:100px}.create-submit.ui.button{height:45px;border-radius:8px;background:#536fe4;font-size:10px;font-weight:750}.create-submit i{margin-left:8px}.wallet-notice.ui.message{margin:15px 0 0;padding:11px;border:1px solid #e7edff;border-radius:8px;color:#66728c;background:#f7f9ff;box-shadow:none;font-size:9px}.wallet-notice :global(i){color:#6880e8}.create-back{display:inline-block;margin-top:18px;color:#6679dc!important;text-decoration:none;font-size:9px;font-weight:650}@keyframes orbit-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@media(max-width:760px){.create-election-page{padding:24px;gap:15px;background:#f4f6fb}.create-brand{max-width:560px;height:auto;padding:0 4px}.create-election-card{max-width:560px;min-height:0;grid-template-columns:1fr;border:1px solid #edf0f6;border-radius:18px;box-shadow:0 22px 60px rgba(37,50,91,.11)}.create-intro{display:none}.create-form-panel{max-width:480px;padding:36px 34px}.create-form-icon{margin-top:0}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
			`}</style>
		</div>
	);

	render() {
		return (
			<div>
				<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
				{this.LoginForm()}
			</div>
		);
	}
}

export default LoginForm;
