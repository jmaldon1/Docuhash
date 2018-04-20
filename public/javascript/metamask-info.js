window.addEventListener('load', function() {
	var hasMetaMask = document.getElementById("hasMetamask");
	var noMetaMask = document.getElementById("noMetamask");
	var networkId;
	// Checking if Web3 has been injected by the browser (Mist/MetaMask)
	if (typeof web3 !== 'undefined') {
	// Use Mist/MetaMask's provider
		web3 = new Web3(web3.currentProvider);
		if(hasMetaMask){hasMetaMask.style.display = "block";}
		if(noMetaMask){noMetaMask.style.display = "none";}
		web3.version.getNetwork((err, netId) => {
		  switch (netId) {
		    case "1":
			 //    $.post('/metaMask', {'metaMaskConnected': true}, function(success){
			 //    	console.log(success);
				// });
		        $('#mainNet').show();
		        //console.log('This is mainnet')
		      break
		    case "2":
		      //console.log('This is the deprecated Morden test network.')
		      break
		    case "3":
		  //   	$.post('/metaMask', {'metaMaskConnected': true}, function(success){
			 //    	console.log(success);
				// });
		      $('#ropstenNet').show();
		      //console.log('This is the ropsten test network.')
		      break
		    case "4":
		      $('#rinkebyNet').show();
		      //console.log('This is the Rinkeby test network.')
		      break
		    case "42":
		      $('#kovanNet').show();
		      //console.log('This is the Kovan test network.')
		      break
		    default:
		      $('#unknownNet').show();
		      //console.log('This is an unknown network.')
		  }
		})
	} else {
		console.log('No web3? You should consider trying MetaMask!')
		// $.post('/metaMask', {'metaMaskConnected': false}, function(success){
		// 	console.log(success);
		// });
	    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
	    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	    if(noMetaMask){noMetaMask.style.display = "block";}
	    if(hasMetaMask){hasMetaMask.style.display = "none";}
	}
});

//this needs to be set here so it can be used in certain functions
var getHash;
var holdNDA;

var contractABI = [
	{
		"constant": true,
		"inputs": [],
		"name": "issuer",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "callHash",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "contractAddress",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "myHash",
				"type": "string"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "constructor"
	}
]


holdNDA = web3.eth.contract(contractABI);

var contractByteCode = {
	"linkReferences": {},
	"object": "606060405273860384d39e6ef17b2442dcca0d5b1da658a30b9c600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555030600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506040516105b83803806105b883398101604052808051820191905050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806001908051906020019061010c9291906101b7565b50600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1631600481905550600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc6004549081150290604051600060405180830381858888f1935050505015156101b157600080fd5b5061025c565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106101f857805160ff1916838001178555610226565b82800160010185558215610226579182015b8281111561022557825182559160200191906001019061020a565b5b5090506102339190610237565b5090565b61025991905b8082111561025557600081600090555060010161023d565b5090565b90565b61034d8061026b6000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631d143848146100675780638da5cb5b146100bc57806390b88c2b14610111578063f6b4dfb41461019f575b600080fd5b341561007257600080fd5b61007a6101f4565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100c757600080fd5b6100cf610219565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561011c57600080fd5b61012461023f565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610164578082015181840152602081019050610149565b50505050905090810190601f1680156101915780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34156101aa57600080fd5b6101b26102e7565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b61024761030d565b60018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102dd5780601f106102b2576101008083540402835291602001916102dd565b820191906000526020600020905b8154815290600101906020018083116102c057829003601f168201915b5050505050905090565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6020604051908101604052806000815250905600a165627a7a72305820d2c90a394e6e1280326788ce9749464ba88e253b5cfaa33bd97f087a08690d4c0029",
	"opcodes": "PUSH1 0x60 PUSH1 0x40 MSTORE PUSH20 0x860384D39E6EF17B2442DCCA0D5B1DA658A30B9C PUSH1 0x2 PUSH1 0x0 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF MUL NOT AND SWAP1 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND MUL OR SWAP1 SSTORE POP ADDRESS PUSH1 0x3 PUSH1 0x0 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF MUL NOT AND SWAP1 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND MUL OR SWAP1 SSTORE POP PUSH1 0x40 MLOAD PUSH2 0x5B8 CODESIZE SUB DUP1 PUSH2 0x5B8 DUP4 CODECOPY DUP2 ADD PUSH1 0x40 MSTORE DUP1 DUP1 MLOAD DUP3 ADD SWAP2 SWAP1 POP POP CALLER PUSH1 0x0 DUP1 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF MUL NOT AND SWAP1 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND MUL OR SWAP1 SSTORE POP DUP1 PUSH1 0x1 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH2 0x10C SWAP3 SWAP2 SWAP1 PUSH2 0x1B7 JUMP JUMPDEST POP PUSH1 0x3 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND BALANCE PUSH1 0x4 DUP2 SWAP1 SSTORE POP PUSH1 0x2 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH2 0x8FC PUSH1 0x4 SLOAD SWAP1 DUP2 ISZERO MUL SWAP1 PUSH1 0x40 MLOAD PUSH1 0x0 PUSH1 0x40 MLOAD DUP1 DUP4 SUB DUP2 DUP6 DUP9 DUP9 CALL SWAP4 POP POP POP POP ISZERO ISZERO PUSH2 0x1B1 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x25C JUMP JUMPDEST DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x1F ADD PUSH1 0x20 SWAP1 DIV DUP2 ADD SWAP3 DUP3 PUSH1 0x1F LT PUSH2 0x1F8 JUMPI DUP1 MLOAD PUSH1 0xFF NOT AND DUP4 DUP1 ADD OR DUP6 SSTORE PUSH2 0x226 JUMP JUMPDEST DUP3 DUP1 ADD PUSH1 0x1 ADD DUP6 SSTORE DUP3 ISZERO PUSH2 0x226 JUMPI SWAP2 DUP3 ADD JUMPDEST DUP3 DUP2 GT ISZERO PUSH2 0x225 JUMPI DUP3 MLOAD DUP3 SSTORE SWAP2 PUSH1 0x20 ADD SWAP2 SWAP1 PUSH1 0x1 ADD SWAP1 PUSH2 0x20A JUMP JUMPDEST JUMPDEST POP SWAP1 POP PUSH2 0x233 SWAP2 SWAP1 PUSH2 0x237 JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST PUSH2 0x259 SWAP2 SWAP1 JUMPDEST DUP1 DUP3 GT ISZERO PUSH2 0x255 JUMPI PUSH1 0x0 DUP2 PUSH1 0x0 SWAP1 SSTORE POP PUSH1 0x1 ADD PUSH2 0x23D JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST SWAP1 JUMP JUMPDEST PUSH2 0x34D DUP1 PUSH2 0x26B PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN STOP PUSH1 0x60 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH2 0x62 JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV PUSH4 0xFFFFFFFF AND DUP1 PUSH4 0x1D143848 EQ PUSH2 0x67 JUMPI DUP1 PUSH4 0x8DA5CB5B EQ PUSH2 0xBC JUMPI DUP1 PUSH4 0x90B88C2B EQ PUSH2 0x111 JUMPI DUP1 PUSH4 0xF6B4DFB4 EQ PUSH2 0x19F JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE ISZERO PUSH2 0x72 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH2 0x7A PUSH2 0x1F4 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE ISZERO PUSH2 0xC7 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH2 0xCF PUSH2 0x219 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE ISZERO PUSH2 0x11C JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH2 0x124 PUSH2 0x23F JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x164 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x149 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x191 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE ISZERO PUSH2 0x1AA JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH2 0x1B2 PUSH2 0x2E7 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x0 DUP1 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 JUMP JUMPDEST PUSH1 0x2 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 JUMP JUMPDEST PUSH2 0x247 PUSH2 0x30D JUMP JUMPDEST PUSH1 0x1 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x2DD JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x2B2 JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0x2DD JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x2C0 JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x3 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 JUMP JUMPDEST PUSH1 0x20 PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x0 DUP2 MSTORE POP SWAP1 JUMP STOP LOG1 PUSH6 0x627A7A723058 KECCAK256 0xd2 0xc9 EXP CODECOPY 0x4e PUSH15 0x1280326788CE9749464BA88E253B5C STATICCALL LOG3 EXTCODESIZE 0xd9 PUSH32 0x87A08690D4C0029000000000000000000000000000000000000000000000000 ",
	"sourceMap": "26:748:0:-;;;122:42;99:65;;;;;;;;;;;;;;;;;;;;203:4;170:37;;;;;;;;;;;;;;;;;;;;428:202;;;;;;;;;;;;;;;;;;;;;;498:10;489:6;;:19;;;;;;;;;;;;;;;;;;530:6;518:9;:18;;;;;;;;;;;;:::i;:::-;;557:15;;;;;;;;;;;:23;;;546:8;:34;;;;590:5;;;;;;;;;;;:14;;:24;605:8;;590:24;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;428:202;26:748;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;"
};

function submitContract(){
	function getGas(callback){
		web3.eth.estimateGas({data: contractByteCode.object}, function(err, result){
			callback(result)
		});
	};

	var holdNDAInstance;
	getGas(function(gas){
		//Materialize.toast('Please Wait...');
		holdNDAInstance = holdNDA.new(getHash,{
			from: web3.eth.accounts[0],
			data: contractByteCode.object,
			gas: gas*2,
			value: 1200000000000000 //in wei = 0.0012eth, try to keep the price at 50c
			},
			function(err, holdNDACon){
				if(!err){
					if(!holdNDACon.address){
						$.post('/hash', {contractAddress: holdNDACon.address, txHash: holdNDACon.transactionHash}, function(success){
							if(success){
								//hasMetaMask.style.display = "none";
								Materialize.toast('A transaction hash is being created!', 6000, 'green');
								Materialize.toast('Please wait...', 6000, 'orange');
								function holdForTxHash(){
									window.location.reload();
								};
								setTimeout(holdForTxHash, 6000);
							};
						});
						//alert('Transaction Hash Recieved!')
					}else{
						$.post('/hash', {contractAddress: holdNDACon.address, txHash: holdNDACon.transactionHash}, function(success){
							if(success){
								// Materialize.Toast.removeAll();
							}
						});
					};
				}else{ 
					Materialize.toast('There was an error, Please try again later...', 5000, 'red');
					throw err 
				}
			});
	});
};

if(document.getElementById("info-page")){
	//get the hash from nodejs
	$.get('/hash').done(function(data){ 
		var obj = JSON.parse(data)
		getHash = obj.hash
	});

	$('#blockchain').on('click', function() {
		// Materialize.toast('Please Wait...');
        submitContract();
   	});

   	$(document.getElementsByName("minedInfo")).on('click', function(event){
   		$('#loader').show();
   		$('.loaderButton').hide();
		var txHash = String(event.target.id)
		web3.eth.getTransactionReceipt(txHash, function(err, receipt){
			if(err){
				Materialize.toast('There was an error, Please try again later...', 5000, 'red');
				$('#loader').hide();
				$('.loaderButton').show();
				throw err
			};
			if(receipt == null){
				$('#loader').hide();
				$('.loaderButton').show();
				Materialize.toast('Unfortunately the smart contract has not been mined yet', 3000, 'red');
			}else if(receipt.contractAddress){
				//window.location = window.location - '#loaded';
				Materialize.toast('Your Contract Has Been Mined!', 3000, 'green');
				Materialize.toast('Adding Contract Address, please wait...', 3000, 'orange');
				function contractMined(){
			   		// $('#loader').hide();
   					// $('.loaderButton').show();
					window.location.reload();
				};
				setTimeout(contractMined, 3000);
				$.post('/hash', {contractAddress: receipt.contractAddress}, function(success){
					if(success){
						// Materialize.Toast.removeAll();
					}
				});
			}
		});
	});
};