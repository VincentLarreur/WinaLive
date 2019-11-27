var live = false; //live OFF
var quiz = false; // aucun quiz n'est pour l'instant actif
var timer = 0;

function fetchWeekPlanning()
{
  fetch("https://www.winamax.fr/winamax-tv-grille").then(function(response) {
    response.text().then(function(text) {
      console.log(text.substring(text.indexOf("days"), text.indexOf("};</script>")));

    });
  });
}

function updateHTML()
{
  console.log("--UPDATE HTML--\n");
  chrome.storage.sync.set({slive : live});
  if(live) //ON
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
  console.log("--CHECK LIVE--\n");
  fetch("https://www.winamax.fr/winamax-tv").then(function(response) {
    response.text().then(function(text) {
      let title = "La grille des programmes - Winamax";
      if(text.includes(title)) // OFF
      {
        if(live)
        {
          live = false;
        }
        //timer = getNextLive();
      }
      else { // ON
        if(!live)
        {
          live = true;
          //notification
        }
        //timer = 120000
      }
      updateHTML();
    });
  });
}

function checkQuiz() // function to check if there is a quizz of not
{
  console.log("-CHECK QUIZ--\n");

}

function main()
{
  console.log("--MAIN--\n");
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

function init()
{
  console.log("--INIT--\n");
  checkLive();
  //Fetch Planning  for the first time we use it or on a new week
  chrome.storage.sync.get(['weekNb'],function(res)
  {
    let now = new Date();
    let onejan = new Date(now.getFullYear(), 0, 1);
    currentWeekNB = Math.ceil( (((now - onejan) / 86400000) + onejan.getDay() + 1) / 7 );
    if(!res.hasOwnProperty('weekNb'))
    {
      chrome.storage.sync.set({weekNb : currentWeekNB});
    }
  });
  chrome.storage.sync.get(['planning', 'weekNb'],function(res)
  {
    //--------------------------------INIT------------------------------------------------
    if(!res.hasOwnProperty('planning') || weekNb != currentWeekNB)
    {
      fetchWeekPlanning();
    }
  });
  setInterval(main(), 120000);
}

init();
