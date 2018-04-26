if(document.getElementById("login-page")){
	$(document.getElementById("login-btn")).on('click', function(event){
		//only show the loading gif if the form was submitted
		$('#myForm').submit(function(e){
        	$('#login-btn').hide();
        	$('#loginLoader').show();
        });
    });
};