$(function(){
    var url = window.location;
    $('.general #nav-mobile li a').each(function () {
        if (this.href == url) {
            $(this).parent().addClass('active');
        }
    });
});