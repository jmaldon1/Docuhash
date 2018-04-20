if(document.getElementById("index-page")){
    (function(){
      	Dropzone.options.my = {
      		paramName: "fileUpload", // The name that will be used to transfer the file
      		maxFilesize: 20, // MB
            acceptedFiles: 'application/pdf, .txt',
            maxFiles: 1,
            init: function(){
        		//on a successful file upload, do this:
        		this.on('success', function(file, response){
        			//passes in the json objest sent from POST
        			var obj = JSON.parse(response);

        			Materialize.toast('File Uploaded Successfully!', 7000, 'green');
        			if (obj.exists == true){
        				Materialize.toast('File Already Exists!', 7000, 'yellow black-text');
        			}else{
        				Materialize.toast('Creating New Hash!', 6800, 'blue');
        			}

        			Materialize.toast('Redirecting...', 7000, 'orange');

        			function redirect(){
        				window.location.replace('/info/'+ obj.hash);
        			}
        			setTimeout(redirect, 6000);
        		})
        	}
        };
    }());
};