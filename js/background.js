var live = false; //live OFF
var quiz = false; // aucun quiz n'est pour l'instant actif

function fetchWeekPlanning()
{
  console.log("--Fetching Planning--");
  fetch("https://www.winamax.fr/winamax-tv-grille").then(function(response) {
    response.text().then(function(text) {
      let JSONString = text.substring(text.indexOf("days")+6, text.indexOf("\"highlight\"")-1);
      var obj = JSON.parse(JSONString);
      chrome.storage.sync.set({planning : obj});
    });
  });
}

function updateHTML()
{
  console.log("--UPDATE HTML--");
  chrome.storage.sync.set({slive : live});
  if(live) //ON
  {
    chrome.browserAction.setIcon({path: "images/WinaLiveOn32x32.png"});
    chrome.browserAction.setBadgeText({text:"ON"});
    chrome.browserAction.setBadgeBackgroundColor({color:"green"});
  }
  else { //OFF
    chrome.browserAction.setIcon({path: "images/WinaLiveOff32x32.png"});
    chrome.browserAction.setBadgeText({text:"OFF"});
    chrome.browserAction.setBadgeBackgroundColor({color:"red"});
  }
}

function getNextLive()
{
  var timernext = 120000;
  var d = new Date();
  var n = d.getDay();
  chrome.storage.sync.get(['planning'],function(res)
  {
    if(!res.hasOwnProperty('planning')) //initialisation à True du Setting de notification
    {
        fetchWeekPlanning();
    }
  });
  chrome.storage.sync.get(['planning'],function(res)
  {
    var today;
    var tomorrow;
    switch(n) {
    case 1:
      today=res.planning.M;
      tomorrow=res.planning.T;
      break;
    case 2:
      today=res.planning.T;
      tomorrow=res.planning.W;
      break;
    case 3:
      today=res.planning.W;
      tomorrow=res.planning.Th;
      break;
    case 4:
      today=res.planning.Th;
      tomorrow=res.planning.F;
      break;
    case 5:
      today=res.planning.F;
      tomorrow=res.planning.S;
      break;
    case 6:
      today=res.planning.S;
      tomorrow=res.planning.Su;
      break;
    case 7:
      today=res.planning.Su;
      tomorrow=res.planning.M;
      break;
    default:
      timernext = 120000;
    }
    var tmp;
    var liveLaterToday = false;
    for (element of today) {
      tmp = new Date(element.start_date);
      if(d<tmp)
      {
        liveLaterToday = true;
        chrome.storage.sync.set({nextLive : element.start_date});
        chrome.storage.sync.set({nextLiveTitle : element.title});
        chrome.storage.sync.set({nextLivePresenter : element.presenters[0]});
        timernext = tmp-d;
        break;
      }
    }
    if(!liveLaterToday)
    {
      chrome.storage.sync.set({nextLive : tomorrow[0].start_date});
      chrome.storage.sync.set({nextLiveTitle : tomorrow[0].title});
      chrome.storage.sync.set({nextLivePresenter : tomorrow[0].presenters[0]});
      timernext = tomorrow[0].start_date-d;
    }
    console.log("Next check for live in : "+timernext+"ms");
    setTimeout(function(){main()}, timernext);
  });
}

//Si Non live --> Redirection donc OFF donc on récupère le temps dans l'élément correspondant et on set un timer
function checkLive()
{
  console.log("--CHECK LIVE--");
  fetch("https://www.winamax.fr/winamax-tv").then(function(response) {
    response.text().then(function(text) {
      let title = "La grille des programmes - Winamax";
      if(text.includes(title)) // OFF
      {
        if(live)
        {
          live = false;
        }
      }
      else { // ON
        if(!live)
        {
          live = true;
          //notification
        }
      }
      updateHTML();
    });
  });
}

function checkQuiz() // function to check if there is a quizz of not
{
  console.log("-CHECK QUIZ--");
}

function main()
{
  console.log("--MAIN--");
  checkLive(); // pour mettre a jour la variable live
  if(!live) //OFF
  {
    console.log("LIVE OFF");
    getNextLive();
  }
  else //ON
  {
    console.log("LIVE ON");
    checkQuiz();
    console.log("Next Checks in 2 mins");
    setTimeout(function(){main()}, 120000);
  }
}

function init()
{
  console.log("--INIT--");
  //Fetch Planning  for the first time we use it or on a new week
  let now = new Date();
  let onejan = new Date(now.getFullYear(), 0, 1);
  currentWeekNB = Math.ceil( (((now - onejan) / 86400000) + onejan.getDay() + 1) / 7 );
  chrome.storage.sync.get(['weekNb'],function(res)
  {
    if(!res.hasOwnProperty('weekNb'))
    {
      chrome.storage.sync.set({weekNb : currentWeekNB});
    }
  });
  chrome.storage.sync.get(['planning', 'weekNb'],function(res)
  {
    //--------------------------------INIT------------------------------------------------
    if(!res.hasOwnProperty('planning') || res.weekNb != currentWeekNB)
    {
      fetchWeekPlanning();
      chrome.storage.sync.set({weekNb : currentWeekNB});
    }
  });
}

init();
main();
