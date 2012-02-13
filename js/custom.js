function loadpage(page) {
	$('#content').load(page+'.html');
	$('.nav .active').removeClass('active');
	$('#nav-'+page).parent().addClass('active');
	$('#content').removeClass(window.location.hash.slice(1));
	$('#content').addClass(page);
	window.location.hash = '#'+page;
}

// can these calls be simplified into one function?
$('#nav-introduction').click(function() { loadpage('introduction'); });
$('#nav-manifesto').click(function() { loadpage('manifesto'); });
$('#nav-developer').click(function() { loadpage('developer'); });
$('#nav-community').click(function() { loadpage('community'); });
$('#nav-thanks').click(function() { loadpage('thanks'); });

$(document).ready(function() {
	if(!$('.active').hasClass(window.location.hash.slice(1))) {
		var page = window.location.hash.slice(1);
		if(page=='introduction' || page=='manifesto' || page=='developer' || page=='community' || page=='thanks') {
			loadpage(page);
		} else {
			loadpage('introduction');
		}
	}
});
