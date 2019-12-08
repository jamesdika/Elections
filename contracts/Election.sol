pragma solidity ^0.5.12;

contract Election {
    // The following is the model of a candidate
    // Each candidate has an id, name, and voteCount
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Accounts that have voted are stored in a hashmap called voters
    mapping(address => bool) public voters;
    // The following hashmap stores all candiates
    mapping(uint => Candidate) public candidates;
    // The following variable stores the amount candidates in the election
    uint public candidatesCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    // whenever the contract is migrated and deployed the constructor is invoked
    // our constructor manually instantiates two candidates
    // if you wanna test more candidates, modify the code
    constructor () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    // takes an argument of string type and adds a candidate to the Election
    // its private so that only the smart contract can add candidates to the Election
    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    //
    function vote (uint _candidateId) public {
        // Requires that voter has not voted before
        require(!voters[msg.sender]);

        // Requires that the candidate is valid
        // from 1 up to the number of candidates
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // Records that the voter has voted
        voters[msg.sender] = true;

        // This updates the candidates vote count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}
