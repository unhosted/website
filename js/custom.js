function navSwitchActive(navEntry) {
  $('.nav .active').removeClass('active');
  $(navEntry).parent().addClass('active');
  $('#content').addClass(navEntry.slice(1));
  window.location.pathname = navEntry.slice(1);
}
// can these calls be simplified into one function?
$('#introduction').click(function() { $('#content').load('introduction.html'); navSwitchActive($(this)); });
$('#manifesto').click(function() { $('#content').load('manifesto.html'); navSwitchActive($(this)); });
$('#developer').click(function() { $('#content').load('developer.html'); navSwitchActive($(this)); });
$('#community').click(function() { $('#content').load('community.html'); navSwitchActive($(this)); });
$('#thanks').click(function() { $('#content').load('thanks.html'); navSwitchActive($(this)); });

$(document).ready(function() {
  if(!$('#content').hasClass(window.location.pathname)) {
    var path = window.location.pathname;
    if(!(path=='introduction' OR path=='manifesto' OR path=='developer' OR path=='community' OR path=='thanks')) {
      $('#content').load(path+'.html');
      navSwitchActive('#'+path);
    } else {
      $('#content').load('introduction.html');
      navSwitchActive('#introduction');
    }
  }
});
