if(document.getElementById("register-page")){
    $( document ).ready(function() {

        $(document.getElementById("submit-btn")).on('click', function(event){
            $('#submit-btn').hide();
            $('#regloader').show();
        });
        var formValid = {
            passedName: false,
            passedUser: false,
            passedEmail: false,
            passedPass: false,
            passedConfirmPass: false
        };

        // function checkValidation() {
        //     if ((formValid.passedName & formValid.passedUser & formValid.passedEmail & formValid.passedPass & formValid.passedConfirmPass) == true) {
        //         $('#submit-btn').removeClass('disabled')
        //     } else {
        //         $('#submit-btn').addClass('disabled')
        //     }
        // };

        $('#fullname').on('input', function() {
            if (($(this).val()).length < 1) {
                formValid.passedName = false;
                //checkValidation();
                $('#fullname').removeClass('validate').addClass('invalid');
                $('#nameError').attr("data-error", "Name is required");
            } else {
                formValid.passedName = true;
                //checkValidation();
                $('#fullname').removeClass('invalid').addClass('validate');
                $('#nameError').removeAttr("data-error");
            }
        });
        $('#username').on('input', function() {
            var username = $(this).val();
            if (username.length <= 2) {
                formValid.passedUser = false;
                //checkValidation();
                $('#username').removeClass('validate').addClass('invalid');
                $('#userError').attr("data-error", "Username is too short");
            } else {
                var testExp = new RegExp(/^[a-zA-Z0-9]+$/);
                if (!testExp.test(username)) {
                    formValid.passedUser = false;
                    //checkValidation();
                    $('#username').removeClass('validate').addClass('invalid');
                    $('#userError').attr("data-error", "Username cannot contain special characters");
                } else {
                    formValid.passedUser = true;
                    //checkValidation();
                    $('#username').removeClass('invalid').addClass('validate');
                    $('#userError').removeAttr("data-error");
                }
            }
        });
        $('#email').on('input', function() {
            if (($(this).val()).length < 1) {
                formValid.passedEmail = false;
                //checkValidation();
                $('#email').removeClass('validate').addClass('invalid');
                $('#emailError').attr("data-error", "Email is required");
            } else {
                formValid.passedEmail = true;
                //checkValidation();
                $('#email').removeClass('invalid').addClass('validate');
                $('#emailError').removeAttr("data-error");
            }
        });
        $('#password').on('input', function() {
            if (($(this).val()).length <= 5) {
                formValid.passedPass = false;
                //checkValidation();
                $('#password').removeClass('validate').addClass('invalid');
                $('#passError').attr("data-error", "Password is too short");
            } else {
                formValid.passedPass = true;
                //checkValidation();
                $('#password').removeClass('invalid').addClass('validate');
                $('#passError').removeAttr("data-error");
            }
        });
        $('#confirmPassword').on('input', function() {
            if (($(this).val().toLowerCase()) != ($("#password").val().toLowerCase())) {
                formValid.passedConfirmPass = false;
                //checkValidation();
                $('#confirmPassword').removeClass('validate').addClass('invalid');
                $('#confirmError').attr("data-error", "Passwords Do Not Match");
            } else {
                formValid.passedConfirmPass = true;
                //checkValidation();
                $('#confirmPassword').removeClass('invalid').addClass('validate');
                $('#confirmError').removeAttr("data-error");
            }
        });
    });
};