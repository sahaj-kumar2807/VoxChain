// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VoxChain {

    address public admin;

    struct Election {
        uint256 id;
        string name;
        bool started;
        bool ended;
    }

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    uint256 public electionCount;

    mapping(uint256 => Election) public elections;

    mapping(uint256 => Candidate[]) public candidates;

    mapping(uint256 => mapping(address => bool)) public registeredVoters;

    mapping(uint256 => mapping(address => bool)) public hasVoted;

    constructor() {
        admin = msg.sender;
    }
    event ElectionCreated(uint256 electionId, string name);
    event CandidateAdded(
        uint256 electionId,
        uint256 candidateId,
        string name
    );
    event VoteCast(
        uint256 electionId,
        uint256 candidateId,
        address voter
    );
    
    event VoterRegistered(uint256 electionId, address voter);
    function addCandidate(
        uint256 _electionId,
        string memory _name
    )
    public {
        require(msg.sender == admin, "Only admin can add candidates");
        require(
            _electionId > 0 && _electionId <= electionCount,
            "Invalid election"
        );
        require(
            !elections[_electionId].started,
            "Election already started"
        );
        require(
            !elections[_electionId].ended,
            "Election already ended"
        );
        require(bytes(_name).length > 0, "Candidate name cannot be empty");

        uint256 candidateId = candidates[_electionId].length + 1;

        candidates[_electionId].push(
            Candidate(
                candidateId,
                _name,
                0
            )
        );

        emit CandidateAdded(
            _electionId,
            candidateId,
            _name
        );
    }

    function createElection(string memory _name) public {
        require(msg.sender == admin, "Only admin can create an election");
        require(bytes(_name).length > 0, "Election name cannot be empty");
        electionCount++;

        elections[electionCount] = Election(
            electionCount,
            _name,
            false,
            false
        );
        emit ElectionCreated(electionCount, _name);
    }
    function registerVoter(uint256 _electionId, address _voter) public {
        require(msg.sender == admin, "Only admin can register voters");

        require(
            _electionId > 0 && _electionId <= electionCount,
            "Invalid election"
        );

        require(
            !elections[_electionId].started,
            "Election already started"
        );

        require(
            _voter != address(0),
            "Invalid voter address"
        );

        require(
            !registeredVoters[_electionId][_voter],
            "Voter already registered"
        );

        registeredVoters[_electionId][_voter] = true;

        emit VoterRegistered(_electionId, _voter);
    }
    function checkEligibility(
        uint256 _electionId,
        address _voter
    )
    public view returns (bool) {
        return registeredVoters[_electionId][_voter];
    }
    event ElectionStarted(uint256 electionId);
    function startElection(uint256 _electionId) public {
        require(msg.sender == admin, "Only admin can start election");

        require(
            _electionId > 0 && _electionId <= electionCount,
            "Invalid election"
        );

        require(
            !elections[_electionId].started,
            "Election already started"
        );

        require(
            !elections[_electionId].ended,
            "Election already ended"
        );

        require(
            candidates[_electionId].length > 0,
            "Add at least one candidate"
        );

        elections[_electionId].started = true;

        emit ElectionStarted(_electionId);
    }
    event ElectionEnded(uint256 electionId);
    function endElection(uint256 _electionId) public {
        require(msg.sender == admin, "Only admin can end election");

        require(
            _electionId > 0 && _electionId <= electionCount,
            "Invalid election"
        );

        require(
            elections[_electionId].started,
            "Election has not started"
        );

        require(
            !elections[_electionId].ended,
            "Election already ended"
        );

        elections[_electionId].ended = true;

        emit ElectionEnded(_electionId);
    }
    function castVote(
        uint256 _electionId,
        uint256 _candidateId
    )
    public {
        require(
            _electionId > 0 && _electionId <= electionCount,
            "Invalid election"
        );

        require(
            elections[_electionId].started,
            "Election has not started"
        );

        require(
            !elections[_electionId].ended,
            "Election has ended"
        );

        require(
            registeredVoters[_electionId][msg.sender],
            "Voter is not registered"
        );

        require(
            !hasVoted[_electionId][msg.sender],
            "Voter has already voted"
        );

        require(
            _candidateId > 0 &&
            _candidateId <= candidates[_electionId].length,
            "Invalid candidate"
        );

        candidates[_electionId][_candidateId - 1].voteCount++;

        hasVoted[_electionId][msg.sender] = true;

        emit VoteCast(
            _electionId,
            _candidateId,
            msg.sender
        );
    }
    function getElection(
    uint256 _electionId
) public view returns (
    uint256 id,
    string memory name,
    bool started,
    bool ended
) {
    require(
        _electionId > 0 && _electionId <= electionCount,
        "Invalid election"
    );

    Election memory election = elections[_electionId];

    return (
        election.id,
        election.name,
        election.started,
        election.ended
    );
}
    function getCandidates(
        uint256 _electionId
    ) public view returns (Candidate[] memory) {
         require(
            _electionId > 0 && _electionId <= electionCount,
            "Invalid election"
        );
        return candidates[_electionId];
    }
    function checkHasVoted(
        uint256 _electionId,
        address _voter
    ) public view returns (bool) {
        return hasVoted[_electionId][_voter];
    }
    function getResults(
        uint256 _electionId
    ) public view returns (Candidate[] memory) {
        require(
            _electionId > 0 && _electionId <= electionCount,
            "Invalid election"
        );

        require(
            elections[_electionId].ended,
            "Election has not ended"
        );

        return candidates[_electionId];
    }
}