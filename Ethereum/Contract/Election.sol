pragma solidity ^0.8.19;

contract ElectionFact {

    struct ElectionDet {
        address deployedAddress;
        string el_n;
        string el_d;
    }

    mapping(string => ElectionDet) public companyEmail;

    event ElectionCreated(address indexed electionAddress, string email, string electionName);

    function createElection(string memory email, string memory election_name, string memory election_description) public {
        require(companyEmail[email].deployedAddress == address(0), "Error: Election already exists for this e-mail.");

        Election newElection = new Election(msg.sender, election_name, election_description);

        companyEmail[email].deployedAddress = address(newElection);
        companyEmail[email].el_n = election_name;
        companyEmail[email].el_d = election_description;

        emit ElectionCreated(address(newElection), email, election_name);
    }

    function getDeployedElection(string memory email) public view returns (address, string memory, string memory) {
        address val = companyEmail[email].deployedAddress;
        if (val == address(0))
            return (address(0), "", "Create an election.");
        else
            return (val, companyEmail[email].el_n, companyEmail[email].el_d);
    }
}

contract Election {

    //election_authority's address
    address public election_authority;
    string public election_name;
    string public election_description;
    bool public status;

    event CandidateAdded(uint256 indexed candidateID, string candidateName);
    event VoterRegistered(address indexed voter);
    event VoterRemoved(address indexed voter);
    event VoteCast(uint256 indexed candidateID, address indexed voter);
    event ElectionEnded(uint256 winnerCandidateID);

    //election_authority's address taken when it deploys the contract
    constructor(address authority, string memory name, string memory description) {
        election_authority = authority;
        election_name = name;
        election_description = description;
        status = true;
    }

    //Only election_authority can call these functions
    modifier owner() {
        require(msg.sender == election_authority, "Error: Access Denied.");
        _;
    }

    //No voting actions are allowed once the election has ended
    modifier active() {
        require(status, "Error: Election has ended.");
        _;
    }

    //candidate details
    struct Candidate {
        string candidate_name;
        string candidate_description;
        string imgHash;
        uint256 voteCount;
        string email;
    }

    //candidate mapping
    mapping(uint256 => Candidate) candidates;

    //voter details
    struct Voter {
        uint256 candidate_id_voted;
        bool voted;
    }

    //voter mapping, keyed by the voter's wallet address
    mapping(address => Voter) public voters;

    //voters whitelisted by the election authority
    mapping(address => bool) public registeredVoters;

    //counter of number of candidates
    uint256 public numCandidates;

    //counter of number of votes cast
    uint256 public numVoters;

    //function to add candidate to mapping
    function addCandidate(string memory candidate_name, string memory candidate_description, string memory imgHash, string memory email) public owner active {
        uint256 candidateID = numCandidates++;
        candidates[candidateID] = Candidate(candidate_name, candidate_description, imgHash, 0, email);
        emit CandidateAdded(candidateID, candidate_name);
    }

    //function to whitelist a voter's wallet address
    function addVoter(address voter) public owner active {
        require(voter != address(0), "Error: Invalid voter address.");
        registeredVoters[voter] = true;
        emit VoterRegistered(voter);
    }

    //function to remove a voter from the whitelist
    function removeVoter(address voter) public owner {
        registeredVoters[voter] = false;
        emit VoterRemoved(voter);
    }

    //function to vote and check for double voting, vote is bound to msg.sender
    function vote(uint256 candidateID) public active {
        require(registeredVoters[msg.sender], "Error: You are not a registered voter");
        require(!voters[msg.sender].voted, "Error: You cannot double vote");
        require(candidateID < numCandidates, "Error: Invalid candidate");

        voters[msg.sender] = Voter(candidateID, true);
        numVoters++;
        candidates[candidateID].voteCount++;

        emit VoteCast(candidateID, msg.sender);
    }

    //function to get count of candidates
    function getNumOfCandidates() public view returns (uint256) {
        return numCandidates;
    }

    //function to get count of votes cast
    function getNumOfVoters() public view returns (uint256) {
        return numVoters;
    }

    //function to get candidate information
    function getCandidate(uint256 candidateID) public view returns (string memory, string memory, string memory, uint256, string memory) {
        return (candidates[candidateID].candidate_name, candidates[candidateID].candidate_description, candidates[candidateID].imgHash, candidates[candidateID].voteCount, candidates[candidateID].email);
    }

    //function to return winner candidate information
    function winnerCandidate() public view returns (uint256) {
        require(numCandidates > 0, "Error: No candidates registered.");
        uint256 largestVotes = candidates[0].voteCount;
        uint256 candidateID = 0;
        for (uint256 i = 1; i < numCandidates; i++) {
            if (largestVotes < candidates[i].voteCount) {
                largestVotes = candidates[i].voteCount;
                candidateID = i;
            }
        }
        return candidateID;
    }

    //function to end the election, after this no more votes are accepted
    function endElection() public owner active {
        status = false;
        emit ElectionEnded(winnerCandidate());
    }

    function getElectionDetails() public view returns (string memory, string memory) {
        return (election_name, election_description);
    }
}
