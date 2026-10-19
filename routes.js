const routes = require('next-routes')();

routes
    .add('/homepage','/homepage')
    .add('/company_login','/company_login')
    .add('/voter_login','/voter_login')
    .add('/election/create_election','/election/create_election')
    .add('/election/:address/company_dashboard','/election/company_dashboard')
    .add('/election/:address/voting_list','/election/voting_list')
    .add('/election/:address/vote','/election/vote')
    .add('/election/:address/candidate_list','/election/candidate_list');
module.exports = routes;
