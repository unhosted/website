// TODO: also change web address and check for web address in the first place

function navSwitchActive(navEntry) {
  $('.nav .active').removeClass('active');
  $(navEntry).parent().addClass('active');
}
// can these calls be simplified into one function?
$('#nav-introduction').click(function() { $('#content').load('introduction.html'); navSwitchActive($(this)); });
$('#nav-manifesto').click(function() { $('#content').load('manifesto.html'); navSwitchActive($(this)); });
$('#nav-developer').click(function() { $('#content').load('developer.html'); navSwitchActive($(this)); });
$('#nav-community').click(function() { $('#content').load('community.html'); navSwitchActive($(this)); });
$('#nav-thanks').click(function() { $('#content').load('thanks.html'); navSwitchActive($(this)); });
