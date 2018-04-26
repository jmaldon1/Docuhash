$(document).ready(function(){
	if(document.getElementById("review-page")){
		//gets the element of the X button at the user pressed
		$(document.getElementsByName("close")).on('click', function(event){
			//popup confirm message
			if(confirm("Deleting this hash will ONLY delete it from your review folder \nThe hash will NOT be deleted from our server OR the Ethereum Blockchain")){
			 	//sends the document's hash the user wants to delete to the server so the server can remove it from the DB
			 	$.post('/delDoc', {hash: event.target.id},function(success){
			 		if(success){
			 			//----FOR SOME REASON THIS DOESNT WORK WHEN PUT HERE----
						//$(event.target).closest('li').remove()
					}
			 	});
			 	//removes the hash from the review page
			 	$(event.target).closest('li').hide('slow', function(){ $(this).closest('li').remove(); });
			};
		});
		$(document.getElementsByName("mined")).on('click', function(event){
			$('#loader').show();
   			$('.loaderButton').hide();
			var txHash = String(event.target.id)
			// var icon = 'icon' + txHash
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
					Materialize.toast('Your Contract Has Been Mined!', 3000, 'green');
					Materialize.toast('Adding Contract Address, please wait...', 3000, 'orange');
					// var iconElement = document.getElementById(icon);
					// iconElement.classList.remove('red-text');
					// iconElement.classList.add('green-text');
					function contractMined(){
						// $('#loader').hide();
   						//$('.loaderButton').show();
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
});
		//---CODE FOR MATERIALIZE.CSS MODALS WHICH DONT SEEM TO WORK WELL WITH HANDLEBARS---



		//click event when the user clicks the red X on review page
		//$(document.getElementsByName("close")).on('click', function(){

			//brings up the popup confirming if the user wants to delete a hash
			// $('#modal1').modal({
			// 	complete: function(){
			// 		console.log('1')

			// 		// var clickDel = document.getElementsByName("clickDelete");
			// 		// $(clickDel).on('click', function(){
			// 		// 	console.log($(event.target.id))
			// 		// });
			// 	// 	console.log('here')
			// 	// 	console.log(clickDel)
			// 	// 	if (clickDel){
			// 	// 		$(clickDel).on('click', function(){
			// 	// 			console.log('del')
			// 	// 			$(event.target).closest('li').remove()
			// 	// 			//When a user presses the red X on the review page, it this will remove the hash from their database
			// 	// 			//and from the review page
			// 	// 			// $.post('/delDoc', {hash: event.target.id},function(success){
			// 	// 			// 	console.log('here')
			// 	// 			// 	if(success){
			// 	// 			// 		console.log('there')
			// 	// 			// 		console.log(success);
			// 	// 			// 		$(event.target).closest('li').remove()
			// 	// 			// 	}
			// 	// 			// })
			// 	// 		});
			// 	// 	}else{
			// 	// 		console.log('cancel')
			// 	// 	}
			// 	}
			// });
			//click even when the user clicks Delete on the popup
			// if (clickDel){
			// 	$(clickDel).on('click', function(){
			// 		//$(event.target).closest('li').remove()
			// 		//When a user presses the red X on the review page, it this will remove the hash from their database
			// 		//and from the review page
			// 		// $.post('/delDoc', {hash: event.target.id},function(success){
			// 		// 	console.log('here')
			// 		// 	if(success){
			// 		// 		console.log('there')
			// 		// 		console.log(success);
			// 		// 		$(event.target).closest('li').remove()
			// 		// 	}
			// 		// })
			// 	});
			// }else{
			// 	return;
			// }
	   	//});