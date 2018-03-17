if(document.getElementById("contract-page")){
	$(document.getElementById("search-btn")).on('click', function(event){
		var inputAddress = document.getElementById('contractAddress').value
		$('#hashFound').hide()
		$('#hashNotFound').hide();
		$('#invalidAddress').hide();

		var holdNDAInstanceHashFinder = holdNDA.at(inputAddress);

		var addressChecker = web3.isAddress(inputAddress);
		if(addressChecker){
			var result = holdNDAInstanceHashFinder.callHash(function(err, result){
				if (err){
					$('#hashNotFound').show();
				}else{
					$('#hashFound').show();
					document.getElementById("displayResult").innerHTML = result;
				}
			});
		}else{
			$('#invalidAddress').show();
		}
	});
};