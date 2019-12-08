App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  hasVoted: false,

  //initializes the app and web3
  // web3 is a collection of javascript libraries that allows you to interact with
  // a local or remote ethereum blockchain
  init: function() {
    return App.initWeb3();
  },
  // initializing web3 connects our client to the local blockchain
  initWeb3: function() {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask then set it to our application's
      // web3 provider
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // otherwise set the applications web3 provider to the one provided by our local blockchain aka Ganache
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },
  // loads contract into frontend so that we cna interact with it
  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance
        .votedEvent(
          {},
          {
            fromBlock: 0, // subscribe to all events on blockchain
            toBlock: "latest"
          }
        )
        .watch(function(error, event) {
          console.log("event triggered", event);
          // Reload when a new vote is recorded
          App.render();
        });
    });
  },
  // This functions renders the client side
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // This function loads the data of the contract
    App.contracts.Election.deployed()
      .then(function(instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
      })
      .then(function(candidatesCount) {
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        var candidatesSelect = $("#candidatesSelect");
        candidatesSelect.empty();
        // for each candidate, render a result with the id, name and vote count
        for (var i = 1; i <= candidatesCount; i++) {
          electionInstance.candidates(i).then(function(candidate) {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];

            // This renders the result for each candidate
            var candidateTemplate =
              "<tr><th>" +
              id +
              "</th><td>" +
              name +
              "</td><td>" +
              voteCount +
              "</td></tr>";
            candidatesResults.append(candidateTemplate);

            // Render candidate ballot option
            var candidateOption =
              "<option value='" + id + "' >" + name + "</ option>";
            candidatesSelect.append(candidateOption);
          });
        }
        return electionInstance.voters(App.account);
      })
      .then(function(hasVoted) {
        // Hides form if the account has already voted
        if (hasVoted) {
          $("form").hide();
        }
        loader.hide();
        content.show();
      })
      .catch(function(error) {
        console.warn(error);
      });
  },
  // This function is called when the form is submitted
  // this registers the actual vote and then displays the updated results
  castVote: function() {
    var candidateId = $("#candidatesSelect").val();
    App.contracts.Election.deployed()
      .then(function(instance) {
        return instance.vote(candidateId, { from: App.account });
      })
      .then(function(result) {
        // Wait for votes to update
        $("#content").hide();
        $("#loader").show();
      })
      .catch(function(err) {
        console.error(err);
      });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
