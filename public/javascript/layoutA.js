if(document.getElementById("footerLinks")){
	$(document.getElementById("ethLink")).on('click', function(event){
		web3.eth.sendTransaction({
			from: web3.eth.accounts[0],
			to: '0x860384d39e6EF17b2442dCCa0d5B1dA658a30B9C',
			value: 2000000000000000 //0.002 ETH
		}, function(err, success){
			if(err) throw err;
			alert("Thanks for the donation!")
		})
	 });
};