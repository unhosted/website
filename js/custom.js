function loadpage(page) {
	$('article.active').fadeToggle();
	$('article.'+page).fadeToggle();
	$('.nav .active').removeClass('active');
	$('#nav-'+page).parent().addClass('active');
	$('article.active').removeClass('active');
	$('article.'+page).addClass('active');
	window.location.hash = '#'+page;
}

// can these calls be simplified into one function?
$('#nav-introduction').click(function() { loadpage('introduction'); });
$('#nav-manifesto').click(function() { loadpage('manifesto'); });
$('#nav-remotestorage').click(function() { loadpage('remotestorage'); });
$('#nav-community').click(function() { loadpage('community'); });
$('#nav-thanks').click(function() { loadpage('thanks'); });

$(document).ready(function() {
	if(!$('.active').hasClass(window.location.hash.slice(1))) {
		var page = window.location.hash.slice(1);
		if(page=='introduction' || page=='manifesto' || page=='remotestorage' || page=='community' || page=='thanks') {
			loadpage(page);
		} else if(page=='developer') {
      loadpage('remotestorage');
    } else {
			loadpage('introduction');
		}
	}
	prettyPrint();
});
