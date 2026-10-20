import React, { Component } from 'react';
import { Button, Form, Header, Icon, Message } from 'semantic-ui-react';
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
			<div className="voter-page">
				<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
				<Helmet>
					<title>Voter Login | Vote.sys</title>
					<link rel="shortcut icon" type="image/x-icon" href="../../static/logo3.png" />
				</Helmet>

				<div className="ambient ambient-one" />
				<div className="ambient ambient-two" />

				<main className="login-shell">
					<section className="visual-panel" aria-label="Vote.sys secure voting">
						<div className="brand"><span className="brand-mark"><Icon name="check" /></span> vote<span>.sys</span></div>
						<div className="visual-copy">
							<p className="eyebrow">YOUR VOICE. YOUR FUTURE.</p>
							<h1>Every vote<br /><span>moves us forward.</span></h1>
							<p className="visual-description">A secure, transparent way to make your choice count.</p>
						</div>
						<div className="vote-art" aria-hidden="true">
							<div className="art-orbit orbit-large" />
							<div className="art-orbit orbit-small" />
							<div className="art-star star-one">✦</div>
							<div className="art-star star-two">✧</div>
							<div className="ballot-card">
								<div className="ballot-top"><span>YOUR BALLOT</span><span className="ballot-dot" /></div>
								<div className="ballot-line"><i /><span /></div>
								<div className="ballot-line"><i /><span /></div>
								<div className="ballot-line selected"><i><Icon name="check" /></i><span /></div>
								<div className="ballot-line"><i /><span /></div>
								<div className="ballot-footer"><Icon name="lock" /> SECURELY RECORDED</div>
							</div>
							<div className="verified-pill"><span><Icon name="check" /></span> Vote verified</div>
							<div className="art-glow" />
						</div>
						<div className="panel-footer"><span><Icon name="shield alternate" /> Protected by blockchain</span><span>01 / 02</span></div>
					</section>

					<section className="form-panel">
						<div className="mobile-brand"><span className="brand-mark"><Icon name="check" /></span> vote<span>.sys</span></div>
						<div className="mobile-illustration" aria-hidden="true"><span className="mini-ballot"><Icon name="check" /></span><span className="mini-lines"><i /><i /><i /></span><span className="mini-shield"><Icon name="shield alternate" /></span></div>
						<div className="form-content">
							<div className="form-icon"><Icon name="user outline" /></div>
							<p className="eyebrow form-eyebrow">VOTER PORTAL</p>
							<Header as="h2">Welcome back<span className="heading-period">.</span></Header>
							<p className="form-subtitle">Sign in to access your secure voting booth.</p>

							{this.state.error && (
								<Message negative size="small" role="alert">
									<p>{this.state.error}</p>
								</Message>
							)}

							<Form onSubmit={this.signin} className="login-form">
								<label htmlFor="voter-email">Email address</label>
								<div className="input-wrap">
									<Icon name="envelope outline" />
									<input
										id="voter-email"
										type="email"
										autoComplete="email"
										placeholder="you@example.com"
										value={this.state.email}
										onChange={e => this.setState({ email: e.target.value })}
										required
									/>
								</div>

								<div className="password-label"><label htmlFor="voter-password">Password</label><span><Icon name="lock" /> PRIVATE &amp; SECURE</span></div>
								<div className="input-wrap">
									<Icon name="lock" />
									<input
										id="voter-password"
										type="password"
										autoComplete="current-password"
										placeholder="Enter your password"
										value={this.state.password}
										onChange={e => this.setState({ password: e.target.value })}
										required
									/>
								</div>

								<Button type="submit" className="signin-button" loading={this.state.loading}>
									Continue to vote <Icon name="arrow right" />
								</Button>
							</Form>

							<div className="privacy-note"><Icon name="shield alternate" /><span>Your credentials are encrypted and kept private.</span></div>
						</div>
						<footer className="form-footer">Need help signing in? <strong>Contact your election authority.</strong></footer>
					</section>
				</main>

				<style jsx global>{`
					* { box-sizing: border-box; }
					body { margin: 0; background: #f4f6fb; }
					.voter-page { min-height: 100vh; padding: 32px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: radial-gradient(ellipse at 75% 8%, rgba(85, 108, 245, .10), transparent 31%), #f4f6fb; color: #17213f; font-family: 'Inter', 'Avenir Next', Avenir, sans-serif; }
					.ambient { position: absolute; border-radius: 50%; filter: blur(1px); pointer-events: none; }
					.ambient-one { width: 340px; height: 340px; right: -170px; top: -180px; background: rgba(94, 116, 255, .1); animation: drift 12s ease-in-out infinite alternate; }
					.ambient-two { width: 220px; height: 220px; left: -130px; bottom: -120px; background: rgba(38, 197, 169, .12); animation: drift 10s ease-in-out infinite alternate-reverse; }
					.login-shell { width: 100%; max-width: 1100px; min-height: 650px; display: grid; grid-template-columns: 1fr 1fr; position: relative; z-index: 1; overflow: hidden; border-radius: 24px; background: #fff; box-shadow: 0 28px 80px rgba(37, 50, 91, .14), 0 4px 14px rgba(37, 50, 91, .05); animation: shell-in .7s cubic-bezier(.2,.8,.2,1) both; }
					.visual-panel { min-height: 650px; position: relative; overflow: hidden; padding: 38px 44px 28px; display: flex; flex-direction: column; color: #fff; background: linear-gradient(145deg, #182454 0%, #233b87 51%, #4267db 100%); }
					.visual-panel:before { content: ''; position: absolute; width: 580px; height: 580px; border: 1px solid rgba(255,255,255,.08); border-radius: 50%; left: -240px; bottom: -370px; box-shadow: 0 0 0 45px rgba(255,255,255,.025), 0 0 0 90px rgba(255,255,255,.02); }
					.brand, .mobile-brand { display: flex; align-items: center; gap: 9px; color: #fff; font-size: 19px; font-weight: 750; letter-spacing: -.7px; }
					.brand > span:last-child, .mobile-brand > span:last-child { color: #9db4ff; margin-left: -9px; }
					.brand-mark { width: 29px; height: 29px; display: inline-flex; align-items: center; justify-content: center; border-radius: 9px; color: #223b8a; background: #fff; font-size: 13px; }
					.visual-copy { z-index: 1; margin-top: 64px; animation: rise-in .8s .1s both; }
					.eyebrow { margin: 0 0 13px; color: #a9bdff; font-size: 10px; font-weight: 750; letter-spacing: 2.2px; }
					.visual-copy h1 { margin: 0; font-size: clamp(32px, 3.3vw, 44px); line-height: 1.13; font-weight: 650; letter-spacing: -1.8px; }
					.visual-copy h1 span { color: #a8bbff; }
					.visual-description { margin: 15px 0 0; color: #d0d9fa; font-size: 13px; line-height: 1.7; }
					.vote-art { position: absolute; width: 365px; height: 300px; right: 13px; bottom: 75px; }
					.art-glow { position: absolute; width: 205px; height: 205px; border-radius: 50%; left: 77px; top: 49px; background: rgba(117, 155, 255, .24); filter: blur(35px); }
					.art-orbit { position: absolute; border: 1px solid rgba(207,221,255,.22); border-radius: 50%; transform: rotate(-28deg); }
					.orbit-large { width: 350px; height: 150px; left: 5px; top: 77px; }
					.orbit-small { width: 290px; height: 115px; left: 38px; top: 99px; transform: rotate(29deg); }
					.ballot-card { position: absolute; z-index: 2; width: 205px; height: 238px; left: 84px; top: 20px; padding: 18px 19px; border: 1px solid rgba(255,255,255,.75); border-radius: 13px; background: linear-gradient(145deg, rgba(255,255,255,.97), rgba(239,244,255,.94)); box-shadow: 0 20px 45px rgba(9,20,60,.25); transform: rotate(-5deg); animation: card-float 5s ease-in-out infinite; }
					.ballot-top { display: flex; justify-content: space-between; align-items: center; color: #7380a4; font-size: 8px; font-weight: 800; letter-spacing: 1.2px; }
					.ballot-dot { width: 6px; height: 6px; border-radius: 50%; background: #29c5a8; box-shadow: 0 0 0 4px rgba(41,197,168,.12); }
					.ballot-line { height: 35px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #edf0f7; }
					.ballot-line i { width: 15px; height: 15px; display: flex; justify-content: center; align-items: center; border: 1px solid #cbd2e4; border-radius: 5px; color: white; font-size: 8px; font-style: normal; }
					.ballot-line > span { width: 95px; height: 5px; border-radius: 8px; background: #dce2f0; }
					.ballot-line:nth-of-type(3) > span { width: 69px; }
					.ballot-line.selected i { border-color: #4f6bed; background: #4f6bed; }
					.ballot-line.selected > span { background: #8499fa; }
					.ballot-footer { margin-top: 13px; color: #4b64cf; font-size: 7px; font-weight: 800; letter-spacing: .8px; }
					.ballot-footer :global(i) { margin-right: 4px; }
					.verified-pill { position: absolute; z-index: 3; right: 5px; bottom: 40px; padding: 9px 13px 9px 9px; border: 1px solid rgba(255,255,255,.65); border-radius: 30px; color: #243768; background: rgba(255,255,255,.95); box-shadow: 0 12px 28px rgba(9,20,60,.2); font-size: 10px; font-weight: 750; animation: pill-float 4s ease-in-out infinite; }
					.verified-pill span { display: inline-flex; width: 19px; height: 19px; align-items: center; justify-content: center; margin-right: 5px; border-radius: 50%; color: #fff; background: #26b99e; font-size: 9px; }
					.art-star { position: absolute; z-index: 1; color: #b8caff; animation: twinkle 2.5s ease-in-out infinite alternate; }
					.star-one { left: 51px; top: 73px; font-size: 22px; }.star-two { right: 39px; top: 91px; font-size: 26px; animation-delay: .8s; }
					.panel-footer { z-index: 1; margin-top: auto; display: flex; justify-content: space-between; color: #bdcafa; font-size: 9px; letter-spacing: .8px; text-transform: uppercase; }
					.panel-footer :global(i) { margin-right: 5px; }
					.form-panel { min-height: 650px; padding: 56px 66px 28px; display: flex; flex-direction: column; justify-content: center; background: #fff; }
					.form-content { width: 100%; max-width: 345px; margin: auto; animation: rise-in .7s .15s both; }
					.form-icon { width: 43px; height: 43px; display: flex; align-items: center; justify-content: center; margin-bottom: 27px; border: 1px solid #e7eaff; border-radius: 13px; color: #4d68df; background: #f5f6ff; font-size: 17px; }
					.form-eyebrow { margin-bottom: 9px; color: #6175df; font-size: 9px; }
					.form-content :global(h2.ui.header) { margin: 0; color: #1e2746; font-size: 31px; font-weight: 700; letter-spacing: -1px; }
					.heading-period { color: #5470ed; }
					.form-subtitle { margin: 9px 0 29px; color: #8991a8; font-size: 12px; }
					.login-form :global(label) { display: block; margin-bottom: 8px; color: #303a5a; font-size: 11px; font-weight: 700; }
					.input-wrap { height: 48px; display: flex; align-items: center; gap: 11px; margin-bottom: 21px; padding: 0 14px; border: 1px solid #e7eaf2; border-radius: 9px; background: #fbfcfe; transition: border-color .2s ease, box-shadow .2s ease, background .2s ease; }
					.input-wrap:focus-within { border-color: #7388f1; background: #fff; box-shadow: 0 0 0 3px rgba(92,113,237,.1); }
					.input-wrap :global(i.icon) { margin: 0; color: #9ba4ba; font-size: 13px; }
					.input-wrap input { width: 100%; height: 100%; border: 0 !important; outline: 0; box-shadow: none !important; color: #28324e; background: transparent !important; font-family: inherit; font-size: 12px; }
					.input-wrap input::placeholder { color: #b0b6c6; }
					.password-label { display: flex; justify-content: space-between; align-items: center; }
					.password-label span { margin-bottom: 8px; color: #a0a8bb; font-size: 8px; font-weight: 750; letter-spacing: .7px; }
					.password-label span :global(i) { margin-right: 3px; }
					.login-form :global(.ui.button.signin-button) { width: 100%; height: 49px; margin-top: 3px; border: 0; border-radius: 9px; color: #fff; background: linear-gradient(100deg, #536de5, #4664dc); box-shadow: 0 9px 18px rgba(76,99,220,.22); font-family: inherit; font-size: 12px; font-weight: 700; transition: transform .2s ease, box-shadow .2s ease, filter .2s ease; }
					.login-form :global(.ui.button.signin-button:hover) { color: #fff; transform: translateY(-2px); box-shadow: 0 13px 23px rgba(76,99,220,.29); filter: brightness(1.04); }
					.login-form :global(.ui.button.signin-button i) { margin-left: 8px; }
					.privacy-note { display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 20px; color: #9aa2b5; font-size: 10px; }
					.privacy-note :global(i) { color: #48b8a1; }
					.form-footer { padding-top: 23px; color: #9aa2b5; text-align: center; font-size: 9px; }
					.form-footer strong { color: #58637d; }
					.mobile-brand { display: none; color: #24366f; }
					.mobile-brand .brand-mark { color: #fff; background: #536de5; }
					.mobile-brand > span:last-child { color: #7286e5; }
					.mobile-illustration { display: none; }
					@keyframes shell-in { from { opacity: 0; transform: translateY(18px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
					@keyframes rise-in { from { opacity: 0; transform: translateY(13px); } to { opacity: 1; transform: translateY(0); } }
					@keyframes card-float { 0%,100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-9px) rotate(-3deg); } }
					@keyframes pill-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
					@keyframes drift { to { transform: translate(18px, 20px) scale(1.08); } }
					@keyframes twinkle { from { opacity: .45; transform: scale(.8) rotate(-12deg); } to { opacity: 1; transform: scale(1.15) rotate(12deg); } }
					@media (max-width: 800px) { .voter-page { padding: 20px; } .login-shell { max-width: 530px; min-height: 590px; grid-template-columns: 1fr; } .visual-panel { display: none; } .form-panel { min-height: 590px; padding: 34px 48px 24px; } .mobile-brand { display: flex; margin-bottom: 22px; } .mobile-illustration { height: 50px; display: flex; align-items: center; gap: 11px; margin-bottom: 22px; padding: 0 13px; overflow: hidden; border: 1px solid #e9edff; border-radius: 11px; background: linear-gradient(100deg,#f6f7ff,#f0fbf9); animation: rise-in .7s .1s both; } .mini-ballot { width: 29px; height: 29px; display:flex; align-items:center; justify-content:center; border-radius:8px; color:#fff; background:#5872e8; font-size:11px; box-shadow:0 5px 12px rgba(80,104,220,.22); } .mini-lines { display:flex; flex:1; gap:5px; flex-direction:column; } .mini-lines i { width:78%; height:4px; border-radius:5px; background:#c7d1fa; } .mini-lines i:nth-child(2) { width:58%; }.mini-lines i:nth-child(3) { width:69%; } .mini-shield { width:31px; height:31px; display:flex; align-items:center; justify-content:center; border-radius:50%; color:#27ae96; background:#e4f7f2; animation: pill-float 4s ease-in-out infinite; } .form-content { margin: 0 auto auto; } .form-footer { margin-top: auto; } }
					@media (max-width: 480px) { .voter-page { padding: 0; align-items: stretch; background: #fff; } .login-shell { min-height: 100vh; border-radius: 0; box-shadow: none; } .form-panel { min-height: 100vh; padding: 26px 25px 20px; } .mobile-brand { margin-bottom: 23px; } .form-content :global(h2.ui.header) { font-size: 29px; } .form-subtitle { margin-bottom: 26px; } }
					@media (prefers-reduced-motion: reduce) { *, *:before, *:after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; } }
				`}</style>
			</div>
		);
	}
}

export default LoginForm;
