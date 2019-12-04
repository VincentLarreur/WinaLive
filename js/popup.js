const html = document.querySelector('#html');

//Boutons de settings ON/OFF
const notifStatus = document.querySelector('#notif');
const quizStatus = document.querySelector('#quiz');
const freerollStatus = document.querySelector('#freeroll');
const ticketStatus = document.querySelector('#tickets');
const loginButton = document.querySelector("#login-button")

const smallboxBottom = document.querySelector("#smallboxBottom");
const divlive = document.querySelector("#divLive");
const divbuttons = document.querySelector("#divButtons");
const divForm = document.querySelector("#divForm");
const divFreeroll = document.querySelector("#divFreeroll");
const waitingCircle = document.querySelector("#waitingCircle");
const textFreeroll = document.querySelector("#textFreeroll");
const divBoutonsTicket = document.querySelector("#divBoutontickets");
const boutonsTicket = document.querySelector("#get_tickets");

const cyacolor = document.querySelector(".cya-color");
const boxTitle = document.querySelector(".box-title");
const sublive = document.querySelector("#sub-live")
const sublive2 = document.querySelector("#sub-live2")

var msecPerMinute = 1000 * 60;
var msecPerHour = msecPerMinute * 60;
var connected = false;

function handleFreeroll(e)
{
  console.log("--HANDLE FREEROLL--");
  if(e)
  {
    divFreeroll.style.display = "flex";
    chrome.storage.sync.get(["planningFreeroll"],function(res)
    {
      if(!res.hasOwnProperty('planningFreeroll'))
      {
          let now = new Date;
          let hours = [00,11,12,14,15,17,18,19,20,21,22,23];
          let minutes = [15,00,30,00,30,00,30,15,15,15,15,15];
          res.planningFreeroll = [];
          for (let i = 0; i < 12; i++)
          {
            let time = now.setHours(hours[i], minutes[i]);
            res.planningFreeroll.push(new Date(time));
          }
      }
      let current = new Date;
      let j = 0;
      while(current>res.planningFreeroll[j])
      {
        j++;
      }
      let interval = res.planningFreeroll[j]-current;
      let hours = Math.floor(interval / msecPerHour);
      interval = interval - (hours*msecPerHour);
      let minutes = Math.floor(interval / msecPerMinute);
      let nextFreeroll = res.planningFreeroll[j];
      if(hours == 0 && minutes != 0)
      {
          textFreeroll.innerText = "Prochain Freeroll : "+minutes+" minutes ("+nextFreeroll.getHours()+":"+nextFreeroll.getMinutes()+")";
      }
      else if(minutes == 0)
      {
        textFreeroll.innerText = "Le FreeRoll, c'est maintenant !";
      }
      else
      {
        textFreeroll.innerText = "Prochain Freeroll : "+hours+"h"+minutes+" ("+nextFreeroll.getHours()+":"+nextFreeroll.getMinutes()+")";
      }
    });
  }else {
    divFreeroll.style.display = 'none';
  }
}

function checkConnection(){ // real check : ici toujours non connecté
  console.log("--CHECK Connection--");
  try{
    fetch("https://www.winamax.fr/account/login.php").then(function(response) {
      response.text().then(function(text) {
        let title = "Pas encore de compte ? Inscrivez-vous gratuitement";
        if(text.includes(title))
        {
          connected = false;
        }
        else {
          connected = true;
        }
      });
    });
    smallboxBottom.style.display='none';
  }
  catch(error)
  {
    console.log(error);
    connected = false;
    smallboxBottom.style.display='flex  ';
  }
}

function handleConnection(quiz, tickets, freeroll)
{
  console.log("--Handle Connection--");
  checkConnection();
  setTimeout(function(){
    console.log(connected);
    if(!connected)
    {
      if(quiz || tickets)
      {
        divFreeroll.style.display = 'none';
        divlive.style.display = 'none';
        divForm.style.display = 'block';
        freerollStatus.disabled = true;
      }
      else {
        if(freeroll)
        {
          divFreeroll.style.display = 'flex';
        }
        divForm.style.display = 'none';
        divlive.style.display = 'flex';
        freerollStatus.disabled = false;
      }
    }
    else {
      freerollStatus.disabled = false;
      if(tickets)
      {
        divBoutonsTicket.style.display = "flex";
      }
      else {
        divBoutonsTicket.style.display = "none";
      }
    }
  }, 1000);
}

function handleTryConnection()
{
  console.log("--Waiting Connection--");
  divForm.style.display = 'none';
  waitingCircle.style.display = 'flex';
  setTimeout(function(){
    checkConnection()
  }, 2500);
  setTimeout(function(){
    waitingCircle.style.display = 'none';
    if(connected)
    {
      if(freeroll)
      {
        divFreeroll.style.display = 'flex';
      }
      divlive.style.display = 'flex';
    }
    else {
      divForm.style.display = 'block';
    }
  }, 10000);
}

function handleLive(e, Livetime, title, presenter)
{
  console.log("--HANDLE LIVE--");
  if(e) //ON
  {
    cyacolor.style.background = 'linear-gradient(to right, #ffffff 0%, #CDDF8F 0%, #9CCF70 50%, #6BBF51 100%';
    boxTitle.innerText = 'Titre du Live Winamax';
    sublive.innerText = 'Live ON';
  }
  else { //OFF
    cyacolor.style.background = 'linear-gradient(to right, #ffffff 0%, #C56B6B 0%, #B45055 50%, #a3353e 100%);';
    if(Livetime != -1)
    {
      let live = new Date(Livetime);
      let current = new Date;
      let interval = live-current;
      let hours = Math.floor(interval / msecPerHour);
      interval = interval - (hours*msecPerHour);
      let minutes = Math.floor(interval / msecPerMinute);
      sublive.innerText = 'Titre : '+title;
      if(hours == 0)
      {
          boxTitle.innerText = "Prochain Live : "+minutes+" minutes ("+live.getHours()+":"+live.getMinutes()+")";
      }
      else
      {
          boxTitle.innerText = "Prochain Live : "+hours+"h"+minutes+" ("+live.getHours()+":"+live.getMinutes()+")";
      }
      sublive.innerText = 'Titre : '+title;
      sublive2.innerText = 'Presenté par : '+presenter;
    }
    else {
      boxTitle.innerText = 'Prochain live Bientôt';
      sublive.innerText = 'Live OFF';
      sublive2.innerText = 'Presenté par : quelqu\'un';
    }
  }
}

chrome.storage.sync.get(['notif','quiz','freeroll','tickets','slive', 'nextLive', 'nextLiveTitle', 'nextLivePresenter'],function(res)
{
  //--------------------------------INIT------------------------------------------------
  if(!res.hasOwnProperty('notif')) //initialisation à True du Setting de notification
  {
       res.notif = false;
  }
  if(!res.hasOwnProperty('quiz')) //initialisation à True du Setting de quiz
  {
       res.quiz = false;
  }
  if(!res.hasOwnProperty('freeroll')) //initialisation à True du Setting de freeroll
  {
       res.freeroll = false;
  }
  if(!res.hasOwnProperty('tickets')) //initialisation à True du Setting de tickets
  {
       res.tickets = false;
  }
  if(!res.hasOwnProperty('slive')) //initialisation à True du Setting de tickets
  {
       res.slive = false;
       chrome.storage.sync.set({slive : false});
  }
  if(!res.hasOwnProperty('nextLive')) //initialisation à True du Setting de tickets
  {
       res.nextLive = -1;
       chrome.storage.sync.set({nextLive : -1});
  }
  if(!res.hasOwnProperty('nextLiveTitle')) //initialisation à True du Setting de tickets
  {
       res.nextLive = "Pas d'infos";
       chrome.storage.sync.set({nextLive : "Pas d'infos"});
  }
  if(!res.hasOwnProperty('nextLiveTitle')) //initialisation à True du Setting de tickets
  {
       res.nextLivePresenter = "Pas d'infos";
       chrome.storage.sync.set({nextLivePresenter : "Pas d'infos"});
  }

  //--------------------------------------Update HTML Informations-------------------------------------------------

  handleLive(res.slive, res.nextLive, res.nextLiveTitle, res.nextLivePresenter);

  handleFreeroll(res.freeroll);

  handleConnection(res.quiz, res.tickets, res.freeroll);

  //-----------------------------Bouton checké selon les settings saved---------------------------------

  notifStatus.checked = res.notif;
  quizStatus.checked = res.quiz;
  freerollStatus.checked = res.freeroll;
  ticketStatus.checked = res.tickets;

  //--------------------------------------Update Storage-------------------------------------------------
  //on click button change in storage
   notifStatus.addEventListener('click',function(e)
   {
       chrome.storage.sync.set({notif : e.target.checked});
   });
   quizStatus.addEventListener('click',function(e)
   {
       chrome.storage.sync.set({quiz : e.target.checked});
       res.quiz = e.target.checked;
       handleConnection(res.quiz, res.tickets, res.freeroll);
   });
   freerollStatus.addEventListener('click',function(e)
   {
      chrome.storage.sync.set({freeroll : e.target.checked});
      handleFreeroll(e.target.checked);
      res.freeroll = e.target.checked;
   });
   ticketStatus.addEventListener('click',function(e)
   {
       chrome.storage.sync.set({tickets : e.target.checked});
       res.tickets = e.target.checked;
       handleConnection(res.quiz, res.tickets, res.freeroll);
   });
   loginButton.addEventListener('click',function(e)
   {
     handleTryConnection();
   });
   boutonsTicket.addEventListener('click',function(e)
   {
     divBoutonsTicket.style.display = 'none';
   });
});
