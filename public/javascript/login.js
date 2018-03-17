if(document.getElementById("login-page")){
	$(document.getElementById("login-btn")).on('click', function(event){
        $('#login-btn').hide();
        $('#loginLoader').show();
    });
};