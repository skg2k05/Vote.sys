import React from 'react';
import Header from './Header';
import Head from 'next/head';

export default (props) =>{
    return(
        <div className="app-layout">
        <Head>
            <link
                rel="stylesheet"
                href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
            />
        </Head>
        
        <Header/>
        {props.children}
        <style jsx global>{`
            body { margin: 0; background: #f5f7fb; color: #1d2947; font-family: Inter, 'Avenir Next', Avenir, 'Segoe UI', sans-serif; }
            .app-layout { min-height: 100vh; background: #f5f7fb; }
            .app-layout .ui.grid { max-width: 1280px; margin-left: auto !important; margin-right: auto !important; }
            .app-layout .ui.header { color: #1e2948; }
            .app-layout .ui.header .sub.header { margin-top: 7px; color: #8791a8; font-size: 12px; font-weight: 400; }
            .app-layout .ui.segment, .app-layout .ui.card { border: 1px solid #edf0f6; border-radius: 12px; box-shadow: 0 8px 24px rgba(34,49,94,.045); }
            .app-layout .ui.button { border-radius: 8px; transition: transform .18s, box-shadow .18s; }
            .app-layout .ui.button.primary { background: #536fe4; }
            .app-layout .ui.button.primary:hover { background: #405ed5; transform: translateY(-1px); box-shadow: 0 8px 18px rgba(76,99,220,.19); }
            .app-layout .ui.form input:not([type=file]), .app-layout .ui.form textarea { border-color: #e5e9f2 !important; border-radius: 8px !important; }
            .app-layout .ui.form input:focus, .app-layout .ui.form textarea:focus { border-color: #7187ee !important; }
            .app-layout .workspace-sidebar.ui.vertical.menu { min-height: 410px !important; margin: 0; padding: 10px; overflow: hidden; border: 1px solid #edf0f6; border-radius: 13px; background: #fff; box-shadow: 0 8px 24px rgba(34,49,94,.045); }
            .app-layout .workspace-sidebar .item:before { display: none !important; }
            .app-layout .workspace-sidebar .sidebar-heading.item { padding: 17px 14px 19px !important; border-bottom: 1px solid #f0f2f7; color: #5c6a89; }
            .app-layout .workspace-sidebar .sidebar-heading span { display: block; color: #8792aa; font-size: 8px; font-weight: 800; letter-spacing: 1.2px; }
            .app-layout .workspace-sidebar .sidebar-heading small { display: block; margin-top: 6px; color: #a0a8ba; font-size: 9px; font-weight: 400; }
            .app-layout .workspace-sidebar .sidebar-link.item { display: flex !important; align-items: center; gap: 10px; margin-top: 5px; padding: 13px 12px !important; border-radius: 8px; color: #65718b !important; font-size: 11px; font-weight: 600; cursor: pointer; transition: color .18s, background .18s, transform .18s; }
            .app-layout .workspace-sidebar .sidebar-link.item:hover { color: #506de3 !important; background: #f7f8ff; transform: translateX(2px); }
            .app-layout .workspace-sidebar .sidebar-link.item.active { color: #4f69db !important; background: #eff2ff; }
            .app-layout .workspace-sidebar .sidebar-link.item i { width: 16px; margin: 0; font-size: 13px; }
            .app-layout .workspace-sidebar .sidebar-signout.item { margin-top: 45px !important; border-top: 1px solid #f0f2f7; border-radius: 0; color: #9a7180 !important; }
            .app-layout .ui.steps { overflow: hidden; border: 1px solid #edf0f6; border-radius: 12px; box-shadow: 0 6px 18px rgba(34,49,94,.04); }
            .app-layout .ui.steps .step { min-height: 88px; padding: 15px 12px; background: #fff; }
            .app-layout .ui.steps .step .title { color: #4c5875; font-size: 10px; }
            .app-layout .ui.steps .step .description { margin-top: 5px; color: #536fe4; font-size: 12px; font-weight: 750; }
            .app-layout .ui.steps .step > .icon { color: #7489e8; font-size: 17px; }
            .app-layout .ui.cards { gap: 16px; }
            .app-layout .ui.cards > .card { margin: 0; overflow: hidden; }
            .app-layout .ui.cards > .card > .content { padding: 17px; }
            .app-layout .ui.cards > .card > .content .header { color: #34415f; font-size: 13px; }
            .app-layout .ui.cards > .card > .content .meta { margin-top: 5px; color: #8a94aa; font-size: 10px; }
            .app-layout .ui.cards > .card > .content .description { color: #76819a; font-size: 10px; line-height: 1.7; }
            .app-layout .ui.card > .content.extra, .app-layout .ui.cards > .card > .extra.content { color: #66728e; font-size: 10px; }
            .app-layout .ui.form .field > label { margin-bottom: 7px; color: #465371; font-size: 10px; font-weight: 700; }
            .app-layout .ui.placeholder.segment { border-style: dashed; background: #fbfcff; box-shadow: none; }
            .app-layout .ui.message { border-radius: 9px; box-shadow: none; font-size: 11px; }
            .app-layout .ui.header.dividing { padding-bottom: 11px; border-bottom-color: #edf0f6; }
            @media (max-width: 767px) { .app-layout .ui.grid { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; } .app-layout .ui.stackable.grid > .row > .column { width: 100% !important; } .app-layout .workspace-sidebar.ui.vertical.menu { min-height: auto !important; display: flex; flex-direction: row; align-items: center; justify-content: flex-start; flex-wrap: wrap; gap: 4px; padding: 6px; overflow: visible; } .app-layout .workspace-sidebar .sidebar-heading.item { display: none !important; } .app-layout .workspace-sidebar .sidebar-link.item { flex: 1 1 40%; justify-content: center; margin: 0 !important; padding: 10px !important; } .app-layout .workspace-sidebar .sidebar-signout.item { margin: 0 !important; border: 0; } .app-layout .ui.steps:not(.vertical) { display: grid !important; grid-template-columns: repeat(2,minmax(0,1fr)); } .app-layout .ui.steps .step { min-width: 0; min-height: 80px; justify-content: center; } }
        `}</style>
        </div>
    );
};
