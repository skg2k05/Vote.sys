import React, { Component } from 'react';
import { Button, Form, Header, Icon, Message } from 'semantic-ui-react';
import { Router } from '../routes';
import Election_Factory from '../Ethereum/election_factory';
import Cookies from 'js-cookie';
import { Helmet } from 'react-helmet';

class CompanyLogin extends Component {
	state = { mode: 'signin', email: '', password: '', repeatPassword: '', loading: false, error: '' };

	signup = async event => {
		event.preventDefault();
		const { email, password, repeatPassword } = this.state;
		if (!email || !password) return this.setState({ error: 'Enter your email and password to create an account.' });
		if (password !== repeatPassword) return this.setState({ error: 'Those passwords do not match. Try again.' });
		this.setState({ loading: true, error: '' });
		try {
			const response = await fetch('/company/register', {
				method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: 'email=' + encodeURIComponent(email.trim()) + '&password=' + encodeURIComponent(password),
			});
			const responseObj = await response.json();
			if (responseObj.status === 'success') {
				Cookies.set('company_email', responseObj.data.email || email.trim());
				this.setState({ mode: 'signin', password: '', repeatPassword: '', loading: false, error: 'Account created. Sign in to continue.' });
			} else this.setState({ error: responseObj.message || 'Could not create your account.', loading: false });
		} catch (err) { this.setState({ error: 'Could not reach the server. Please try again.', loading: false }); }
	};

	signin = async event => {
		event.preventDefault();
		const { email, password } = this.state;
		if (!email || !password) return this.setState({ error: 'Enter your email and password to sign in.' });
		if (!Election_Factory) return this.setState({ error: 'The election contract is not deployed. Please contact your administrator.' });
		this.setState({ loading: true, error: '' });
		try {
			if (typeof window !== 'undefined' && window.ethereum) {
				await window.ethereum.request({ method: 'eth_requestAccounts' });
			}
			const response = await fetch('/company/authenticate', {
				method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: 'email=' + encodeURIComponent(email.trim()) + '&password=' + encodeURIComponent(password),
			});
			const responseObj = await response.json();
			if (responseObj.status !== 'success') throw new Error(responseObj.message || 'Email or password not recognized.');
			Cookies.set('company_id', responseObj.data.id);
			Cookies.set('company_email', responseObj.data.email || email.trim());
			const summary = await Election_Factory.methods.getDeployedElection(responseObj.data.email || email.trim()).call();
			this.setState({ loading: false });
			if (summary[2] === 'Create an election.') Router.pushRoute('/election/create_election');
			else { Cookies.set('address', summary[0]); Router.pushRoute(`/election/${summary[0]}/company_dashboard`); }
		} catch (err) {
			const message = err && err.code === 4001 ? 'MetaMask access was declined. Connect your wallet to continue.' : (err.message || 'Could not sign in. Please try again.');
			this.setState({ error: message, loading: false });
		}
	};

	switchMode = mode => this.setState({ mode, error: '' });

	render() {
		const { mode, email, password, repeatPassword, loading, error } = this.state;
		const isSignup = mode === 'signup';
		return (
			<div className="company-page">
				<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
				<Helmet><title>Election admin | Vote.sys</title><link rel="shortcut icon" type="image/x-icon" href="../../static/logo3.png" /></Helmet>
				<div className="company-orb orb-a" /><div className="company-orb orb-b" />
				<main className="company-shell">
					<section className="company-visual">
						<a className="company-brand" href="/homepage"><span className="company-mark"><Icon name="check" /></span> vote<span>.sys</span></a>
						<div className="company-message"><p className="company-kicker">ELECTION ADMINISTRATION</p><h1>Make every<br /><span>decision count.</span></h1><p>Everything you need to run a clear, trusted election from one place.</p></div>
						<div className="admin-art" aria-hidden="true"><div className="admin-art-circle" /><div className="admin-window"><div className="window-dots"><i /><i /><i /><span>Election overview</span></div><div className="window-title">Participation at a glance</div><div className="window-chart"><i /><i /><i /><i /><i /><i /><i /><span /></div><div className="window-stats"><b>Election active</b><span><i /> Live status</span></div></div><div className="admin-float"><span><Icon name="shield alternate" /></span><b>Securely managed</b></div></div>
						<div className="company-footnote"><Icon name="lock" /> PRIVATE ADMIN ACCESS</div>
					</section>
					<section className="company-form-panel">
						<div className="company-form-wrap">
							<a className="company-mobile-brand" href="/homepage"><span>✓</span> vote<span>.sys</span></a>
							<div className="admin-mobile-strip" aria-hidden="true"><span className="strip-lock"><Icon name="lock" /></span><span><b>Election workspace</b><small>Secure administration</small></span><i /><i /><i /><i /></div>
							<div className="company-form-icon"><Icon name="building outline" /></div>
							<p className="company-form-kicker">ELECTION WORKSPACE</p>
							<Header as="h2">{isSignup ? 'Create your account' : 'Welcome back'}<span>.</span></Header>
							<p className="company-form-subtitle">{isSignup ? 'Set up your admin access to get started.' : 'Sign in to manage your election.'}</p>
							<div className="company-tabs"><button type="button" className={!isSignup ? 'active' : ''} onClick={() => this.switchMode('signin')}>Sign in</button><button type="button" className={isSignup ? 'active' : ''} onClick={() => this.switchMode('signup')}>Create account</button></div>
							{error && <Message className={error.indexOf('Account created') === 0 ? 'positive' : 'negative'} size="small" role="alert">{error}</Message>}
							<Form onSubmit={isSignup ? this.signup : this.signin} className="company-form">
								<label htmlFor="admin-email">Work email</label><div className="company-input"><Icon name="envelope outline" /><input id="admin-email" type="email" autoComplete="email" placeholder="you@organization.com" value={email} onChange={e => this.setState({ email: e.target.value })} required /></div>
								<label htmlFor="admin-password">Password</label><div className="company-input"><Icon name="lock" /><input id="admin-password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder="Enter your password" value={password} onChange={e => this.setState({ password: e.target.value })} required /></div>
								{isSignup && <><label htmlFor="admin-repeat-password">Confirm password</label><div className="company-input"><Icon name="lock" /><input id="admin-repeat-password" type="password" autoComplete="new-password" placeholder="Enter your password again" value={repeatPassword} onChange={e => this.setState({ repeatPassword: e.target.value })} required /></div></>}
								<Button type="submit" className="company-submit" loading={loading}>{isSignup ? 'Create admin account' : 'Sign in to workspace'} <Icon name="arrow right" /></Button>
							</Form>
							<div className="admin-security"><Icon name="shield alternate" /> Admin access is protected by your account and wallet.</div>
						</div>
						<footer className="company-form-footer"><a href="/homepage">← Back to Vote.sys</a><span>Authorized election administrators only</span></footer>
					</section>
				</main>
				<style jsx global>{`
					*{box-sizing:border-box}body{margin:0;background:#f4f6fb}.company-page{min-height:100vh;padding:28px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(ellipse at 78% 3%,rgba(89,115,241,.1),transparent 33%),#f4f6fb;color:#1c2849;font-family:Inter,'Avenir Next',Avenir,sans-serif}.company-orb{position:absolute;border-radius:50%;pointer-events:none}.orb-a{width:310px;height:310px;right:-170px;top:-165px;background:rgba(82,108,237,.08);animation:admin-drift 11s ease-in-out infinite alternate}.orb-b{width:250px;height:250px;left:-155px;bottom:-140px;background:rgba(40,183,157,.1);animation:admin-drift 9s ease-in-out infinite alternate-reverse}.company-shell{width:100%;max-width:1080px;min-height:640px;position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;overflow:hidden;border-radius:22px;background:#fff;box-shadow:0 28px 80px rgba(37,50,91,.14),0 4px 14px rgba(37,50,91,.05);animation:admin-in .7s both}.company-visual{min-height:640px;position:relative;overflow:hidden;padding:36px 43px;color:white;background:linear-gradient(145deg,#17234e,#2b438e 60%,#4d68d7)}.company-visual:before{content:'';position:absolute;width:560px;height:560px;left:-245px;bottom:-395px;border:1px solid rgba(255,255,255,.1);border-radius:50%;box-shadow:0 0 0 45px rgba(255,255,255,.025),0 0 0 90px rgba(255,255,255,.018)}.company-brand{position:relative;z-index:1;display:inline-flex;align-items:center;gap:9px;color:#fff!important;text-decoration:none;font-size:18px;font-weight:800;letter-spacing:-.6px}.company-brand>span:last-child{color:#a9bcff;margin-left:-9px}.company-mark{width:29px;height:29px;display:inline-flex;align-items:center;justify-content:center;border-radius:9px;color:#253c8b;background:white;font-size:12px}.company-message{position:relative;z-index:2;margin-top:57px;animation:admin-in .8s .1s both}.company-kicker,.company-form-kicker{margin:0 0 12px;color:#b6c5ff;font-size:9px;font-weight:800;letter-spacing:1.8px}.company-message h1{margin:0;color:#fff;font-size:43px;line-height:1.06;letter-spacing:-1.8px}.company-message h1 span{color:#aabaff}.company-message>p:last-child{max-width:300px;margin:14px 0 0;color:#d5defa;font-size:11px;line-height:1.8}.admin-art{height:300px;position:absolute;right:22px;bottom:54px;width:390px}.admin-art-circle{position:absolute;width:270px;height:270px;left:55px;top:7px;border:1px solid rgba(215,225,255,.19);border-radius:50%;box-shadow:0 0 0 25px rgba(255,255,255,.025)}.admin-window{position:absolute;z-index:1;width:270px;left:77px;top:22px;padding:14px 15px;border:1px solid rgba(255,255,255,.75);border-radius:12px;color:#34415f;background:rgba(255,255,255,.96);box-shadow:0 20px 45px rgba(10,20,56,.25);transform:rotate(-4deg);animation:admin-float 5s ease-in-out infinite}.window-dots{display:flex;align-items:center;gap:4px;color:#8792ad;font-size:7px}.window-dots i{width:5px;height:5px;border-radius:50%;background:#ea8e95}.window-dots i:nth-child(2){background:#eac46a}.window-dots i:nth-child(3){background:#68c8ac}.window-dots span{margin-left:6px}.window-title{margin-top:16px;font-size:10px;font-weight:750}.window-chart{height:95px;position:relative;display:flex;align-items:flex-end;gap:9px;padding:12px 13px;border-bottom:1px solid #edf0f6;background:repeating-linear-gradient(to bottom,transparent,transparent 23px,#f0f2f8 24px)}.window-chart i{flex:1;height:35%;border-radius:4px 4px 0 0;background:#a9b8fa}.window-chart i:nth-child(2){height:54%;background:#8fa3f5}.window-chart i:nth-child(3){height:42%}.window-chart i:nth-child(4){height:74%;background:#5f7ce9}.window-chart i:nth-child(5){height:57%}.window-chart i:nth-child(6){height:88%;background:#5f7ce9}.window-chart i:nth-child(7){height:70%}.window-chart span{position:absolute;width:30px;height:30px;top:7px;right:19px;border:6px solid #e9edff;border-top-color:#28b79a;border-right-color:#5d78e9;border-radius:50%}.window-stats{display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:8px}.window-stats b{color:#425173}.window-stats span{color:#8c97b0}.window-stats span i{display:inline-block;width:5px;height:5px;margin-right:4px;border-radius:50%;background:#28b79a}.admin-float{position:absolute;z-index:2;right:0;bottom:21px;display:flex;align-items:center;gap:8px;padding:10px 13px;border:1px solid #e9edfa;border-radius:11px;color:#425071;background:#fff;box-shadow:0 12px 30px rgba(13,26,65,.17);font-size:8px;animation:admin-float 4s .4s ease-in-out infinite}.admin-float span{width:23px;height:23px;display:flex;align-items:center;justify-content:center;border-radius:7px;color:#fff;background:#28b79a}.company-footnote{position:absolute;bottom:25px;left:43px;color:#c0cdf8;font-size:8px;font-weight:750;letter-spacing:1px}.company-footnote :global(i){margin-right:5px}.company-form-panel{min-height:640px;padding:55px 64px 25px;display:flex;flex-direction:column;justify-content:center}.company-form-wrap{width:100%;max-width:350px;margin:auto;animation:admin-in .7s .15s both}.company-form-icon{width:42px;height:42px;display:flex;align-items:center;justify-content:center;margin-bottom:23px;border:1px solid #e8ebfc;border-radius:12px;color:#5973e5;background:#f4f5ff;font-size:16px}.company-form-kicker{margin-bottom:8px;color:#6279e4;font-size:8px}.company-form-wrap :global(h2.ui.header){margin:0;color:#1f2b4c;font-size:29px;letter-spacing:-.8px}.company-form-wrap :global(h2 span){color:#5b75e8}.company-form-subtitle{margin:7px 0 22px;color:#8c95aa;font-size:11px}.company-tabs{height:39px;display:flex;gap:4px;margin-bottom:19px;padding:4px;border-radius:8px;background:#f4f5fa}.company-tabs button{flex:1;border:0;border-radius:6px;color:#8b94a9;background:transparent;font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;transition:all .18s}.company-tabs button.active{color:#4d67d9;background:white;box-shadow:0 2px 7px rgba(38,51,91,.08)}.company-form :global(label){display:block;margin:0 0 7px;color:#34405f;font-size:10px;font-weight:700}.company-input{height:45px;display:flex;align-items:center;gap:10px;margin-bottom:16px;padding:0 12px;border:1px solid #e6eaf2;border-radius:8px;background:#fbfcfe;transition:border-color .2s,box-shadow .2s}.company-input:focus-within{border-color:#7388f1;background:#fff;box-shadow:0 0 0 3px rgba(92,113,237,.1)}.company-input :global(i){margin:0;color:#9aa4b9;font-size:12px}.company-input input{width:100%;height:100%;border:0;outline:0;color:#28324e;background:transparent;font-family:inherit;font-size:11px}.company-input input::placeholder{color:#b2b8c7}.company-form :global(.ui.button.company-submit){width:100%;height:46px;margin-top:3px;border-radius:8px;color:#fff;background:linear-gradient(100deg,#5a74e8,#4763d8);box-shadow:0 8px 16px rgba(76,99,220,.2);font-family:inherit;font-size:10px;font-weight:750;transition:all .2s}.company-form :global(.ui.button.company-submit:hover){color:#fff;background:#405ed5;transform:translateY(-2px);box-shadow:0 11px 20px rgba(76,99,220,.26)}.company-submit :global(i){margin-left:7px}.admin-security{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:17px;color:#99a2b6;font-size:9px}.admin-security :global(i){color:#3daf98}.company-form-footer{display:flex;justify-content:space-between;padding-top:20px;color:#a0a7b8;font-size:8px}.company-form-footer a{color:#6277db!important;text-decoration:none}.company-form-footer span{text-align:right}.company-form-wrap :global(.ui.message){font-size:10px}.company-form-wrap :global(.ui.message p){margin:0}@keyframes admin-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes admin-float{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-7px) rotate(-2deg)}}@keyframes admin-drift{to{transform:translate(15px,20px) scale(1.08)}}@media(max-width:780px){.company-page{padding:18px}.company-shell{max-width:540px;min-height:580px;grid-template-columns:1fr}.company-visual{display:none}.company-form-panel{min-height:580px;padding:34px 45px 22px}}@media(max-width:480px){.company-page{padding:0;background:#fff}.company-shell{min-height:100vh;border-radius:0;box-shadow:none}.company-form-panel{min-height:100vh;padding:27px 24px 20px}.company-form-wrap{margin:auto}.company-form-footer{margin-top:auto;gap:10px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
				`}</style>
				<style jsx global>{`
					.company-mobile-brand{display:none}.admin-mobile-strip{display:none}.company-input input{border:0!important;background:transparent!important;box-shadow:none!important;outline:0!important}
					@media(max-width:780px){.company-form-wrap{max-width:360px}.company-mobile-brand{display:flex;align-items:center;gap:8px;margin-bottom:22px;color:#1d2b50;text-decoration:none;font-size:17px;font-weight:800}.company-mobile-brand>span:first-child{width:27px;height:27px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;color:#fff;background:#536fe4}.company-mobile-brand>span:last-child{color:#7084e5;margin-left:-8px}.admin-mobile-strip{height:47px;display:flex;align-items:center;gap:9px;margin-bottom:23px;padding:0 11px;border:1px solid #e9edfa;border-radius:9px;background:linear-gradient(100deg,#f5f7ff,#f0faf8)}.admin-mobile-strip .strip-lock{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:7px;color:#fff;background:#5d77e6;font-size:10px}.admin-mobile-strip b,.admin-mobile-strip small{display:block}.admin-mobile-strip b{color:#405071;font-size:8px}.admin-mobile-strip small{margin-top:2px;color:#929cb2;font-size:7px}.admin-mobile-strip>i{width:5px;height:5px;margin-left:auto;border-radius:50%;background:#96a8ef}.admin-mobile-strip>i:nth-last-child(2){background:#4d71e3}.admin-mobile-strip>i:last-child{margin-right:4px;background:#45b89e}.company-form-icon{display:none}}
					@media(max-width:480px){.company-mobile-brand{margin-bottom:25px}.admin-mobile-strip{margin-bottom:25px}}
				`}</style>
			</div>
		);
	}
}

export default CompanyLogin;
