var live = false; //live OFF
var quiz = false; // aucun quiz n'est pour l'instant actif
var targetPage = "https://www.winamax.fr/winamax-tv";

function updateHTML(e)
{
  chrome.storage.sync.set({live : e});
  if(e) //ON
  {
    chrome.browserAction.setIcon({path: "images/WinaLiveOn32x32.png"});
  }
  else { //OFF
    chrome.browserAction.setIcon({path: "images/WinaLiveOff32x32.png"});
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
          //notification
        }
      }
    });
  });
}

function checkLive() // function to check if there is a quizz of not
{

}

function main()
{
  if(!live)
  {
      var tmp = 0;
      setTimeout(checkLive(), tmp);//on attends justqu'au timer
  }
  else
  {
    if(quiz)
    {
      checkQuiz();
    }
    else
    {
      console.log("QUIZ");
    }
  }
}

checkLive();
setInterval(main(), 120000);
