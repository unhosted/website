(function() {
  function applyStyleGuide(elt) {
          var styleguide = elt.getAttribute('data-hyperlinkstyleguide');
          var xhr = new XMLHttpRequest();
          xhr.open('GET', styleguide, true);
          xhr.onload = function() {
            console.log(xhr.response);
            try {
              obj = JSON.parse(xhr.response);
              elt.innerHTML = '<img src="//'+elt.host+obj.icons['128']+'" style="'
                +'color: #E0E0E0; border-style: solid; border-radius: 8px; box-shadow: 0 0 1em #D0D0D0'
                +'" /><p>'+obj.name+'</p>'
            } catch(e) {
              console.log(e);
            }
          };
          xhr.send();
        }
        var buttons = document.getElementsByClassName('launchbutton');
        for(var i=0; i<buttons.length; i++) {
          applyStyleGuide(buttons[i]);
        }
      })();