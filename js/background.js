var live = false; //live OFF
var quiz = false; // aucun quiz n'est pour l'instant actif
var targetPage = "https://www.winamax.fr/winamax-tv";


function updateHTML()
{
  if(live)
  {

  }
  else {

  }
}

//Si Non live --> Redirection donc OFF donc on récupère le temps dans l'élément correspondant et on set un timer
function checkLive()
{
  fetch(targetPage).then(function(response) {
    response.text().then(function(text) {
      let title = "La grille des programmes - Winamax";
      if(text.includes(title)) // OFF
      {
        if(live)
        {
          live = false;
          updateHTML();
        }
      }
      else { // ON
        if(!live)
        {
          live = true;
          updateHTML();
        }
      }
    });
  });
}

checkLive();
setInterval(main(), 120000);
