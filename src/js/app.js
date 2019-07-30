App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);

    //     petTemplate.find('.pet-breed').text(data[i].breed);

    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

    return await App.initWeb3();
  },

  initWeb3: async function() {
      // Modern dapp browsers...
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
    // User denied account access...
    console.error("User denied account access")
   }
  }
// Legacy dapp browsers...
else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
}
web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Main.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(Main);
    
      // Set the provider for our contract
      App.contracts.Main.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.listProposals();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },


createContract: async function(event){
  event.preventDefault();
  var name = $('#name').val();
  var desc = $('#description').val();
  var docs = $('#Docs').val();
  var image = $('#image_url').val();
  var ReviewPhaseLengthInSeconds = $('ReviewTime').val();
  var CommitPhaseLengthInSeconds = $('CommitTime').val();
  var RevealPhaseLengthInSeconds = $('ReviewTime').val();
  var Deposit = parseInt($('#Deposit').val());
  console.log(Deposit);

  if (name == '' || desc == '' ||docs == '' || ReviewPhaseLengthInSeconds == '' || CommitPhaseLengthInSeconds == '' || RevealPhaseLengthInSeconds == '' || image == '' || Deposit == '') {
    alert('Can\'t leave Anything empty');
    return null;
  }

  var images = document.getElementById('image_url');
  const file = images.files[0]
  
  const ipfs = window.IpfsHttpClient('ipfs.infura.io', '5001', {protocol:'https'});
  await ipfs.add(file, (err, result) => {
    if(err) {
      console.error(err);
      return
    }
    var url = `https://ipfs.io/ipfs/${result[0].hash}`
    console.log(`Url --> ${url}`);
  
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Main.deployed().then(function(instance) {
        mainInstance = instance;

    // Execute adopt as a transaction by sending account
    return mainInstance.incentive(name,desc,docs,url,ReviewPhaseLengthInSeconds, CommitPhaseLengthInSeconds, RevealPhaseLengthInSeconds ,Deposit, {from: account});
  }).then(function(result) {
    alert('Your Proposal has been Created');
    return App.listProposals;
  }).catch(function(err) {
    console.log(err.message);
  });
});
  });

},

listProposals: function(Proposals, account) {
    // var adoptionInstance;
    var Proposals;

    // App.contracts.Adoption.deployed().then(function(instance) {
    //   adoptionInstance = instance;
    App.contracts.Main.deployed().then(function(instance) {
      proposalsInstance = instance;
    
      // return adoptionInstance.getAdopters.call();
      return proposalsInstance.getProposals.call();
    }).then(function(Proposals) {
      for (i = 0; i < Proposals.length; i++) {
        if (Proposals[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

//   handleAdopt: function(event) {
//     event.preventDefault();

//     var petId = parseInt($(event.target).data('id'));
//     var adoptionInstance;

//     web3.eth.getAccounts(function(error, accounts) {
//       if (error) {
//         console.log(error);
//       }
    
//       var account = accounts[0];
    
//       App.contracts.Adoption.deployed().then(function(instance) {
//         adoptionInstance = instance;
    
//         // Execute adopt as a transaction by sending account
//         return adoptionInstance.adopt(petId, {from: account});
//       }).then(function(result) {
//         return App.markAdopted();
//       }).catch(function(err) {
//         console.log(err.message);
//       });
//     });
    
//   }

 };

$(function() {
  $(window).load(function() {
    App.init();
  });
});
