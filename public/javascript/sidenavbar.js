$(document).ready(function() {
    var url = window.location;
    $('.gen .side-nav li a').each(function() {
        if (this.href == url) {
            $(this).parent().addClass('active');
        }
    });

    $(".button-collapse").sideNav();
});