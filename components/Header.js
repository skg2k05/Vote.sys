import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import Cookies from 'js-cookie';
import { Router } from '../routes';

export default class Header extends Component {
	state = { identity: '', role: 'Election workspace' };

	componentDidMount() {
		const company = Cookies.get('company_email');
		const voter = Cookies.get('voter_email');
		this.setState({ identity: company || voter || '', role: company ? 'Election administrator' : voter ? 'Verified voter' : 'Election workspace' });
	}

	signOut = () => {
		['address', 'company_email', 'company_id', 'voter_email'].forEach(name => Cookies.remove(name));
		Router.pushRoute('/homepage');
	};

	render() {
		const { identity, role } = this.state;
		return (
			<header className="workspace-header">
				<div className="workspace-header-inner">
					<a href="/homepage" className="workspace-brand"><span className="workspace-mark"><Icon name="check" /></span><span>vote<span>.sys</span></span></a>
					<div className="workspace-header-right">
						<span className="workspace-secure"><Icon name="lock" /> Secure workspace</span>
						{identity && <div className="workspace-identity"><span className="identity-avatar"><Icon name="user" /></span><span><b>{identity}</b><small>{role}</small></span></div>}
						<button type="button" className="workspace-exit" onClick={this.signOut} aria-label="Sign out"><Icon name="sign out" /></button>
					</div>
				</div>
				<style jsx global>{`
					.workspace-header{height:68px;position:relative;z-index:5;background:#fff;border-bottom:1px solid #edf0f6}.workspace-header-inner{height:100%;max-width:1280px;margin:0 auto;padding:0 22px;display:flex;align-items:center;justify-content:space-between}.workspace-brand{display:flex;align-items:center;gap:9px;color:#19264c!important;text-decoration:none;font-size:18px;font-weight:800;letter-spacing:-.6px}.workspace-brand>span:last-child>span{color:#6078ec}.workspace-mark{width:29px;height:29px;display:inline-flex;align-items:center;justify-content:center;border-radius:9px;color:white;background:linear-gradient(145deg,#6480f5,#4862dc);font-size:12px}.workspace-header-right{display:flex;align-items:center;gap:20px}.workspace-secure{color:#8791a7;font-size:10px}.workspace-secure :global(i){margin-right:5px;color:#36aa92}.workspace-identity{display:flex;align-items:center;gap:9px;padding-left:18px;border-left:1px solid #edf0f5}.identity-avatar{width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#5873e4;background:#eff2ff;font-size:11px}.workspace-identity b,.workspace-identity small{display:block;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.workspace-identity b{color:#45516e;font-size:9px}.workspace-identity small{margin-top:2px;color:#9aa2b5;font-size:8px}.workspace-exit{width:31px;height:31px;border:1px solid #edf0f5;border-radius:8px;color:#8490a7;background:#fff;cursor:pointer;transition:all .18s}.workspace-exit:hover{color:#536fe4;border-color:#dce3ff;background:#f7f8ff}@media(max-width:600px){.workspace-header-inner{padding:0 16px}.workspace-secure{display:none}.workspace-header-right{gap:12px}.workspace-identity{padding-left:12px}.workspace-identity b{max-width:130px}}
				`}</style>
			</header>
		);
	}
}
