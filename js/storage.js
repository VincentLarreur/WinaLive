const html = document.querySelector('#html');

//Boutons de settings ON/OFF
const notifStatus = document.querySelector('#notif');
const quizStatus = document.querySelector('#quiz');
const freerollStatus = document.querySelector('#freeroll');
const ticketStatus = document.querySelector('#tickets');

const divFreeroll = document.querySelector("#divFreeroll");
const textFreeroll = document.querySelector("#textFreeroll");

const cyacolor = document.querySelector(".cya-color");
const boxTitle = document.querySelector(".box-title");
const sublive = document.querySelector("#sub-live")

var msecPerMinute = 1000 * 60;
var msecPerHour = msecPerMinute * 60;

function handleFreeroll(e)
{
  if(e)
  {
    html.style.height = "360px";
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
      if(hours == 0)
      {
          textFreeroll.innerText = "Prochain Freeroll : "+minutes+" minutes ("+nextFreeroll.getHours()+":"+nextFreeroll.getMinutes()+")";
      }
      else if(minutes ==0)
      {
        textFreeroll.innerText = "Le FreeRoll, c'est maintenant !";
      }
      else
      {
        textFreeroll.innerText = "Prochain Freeroll : "+hours+"h"+minutes+" ("+nextFreeroll.getHours()+":"+nextFreeroll.getMinutes()+")";
      }
    });
  }else {
    html.style.height = "280px";
    divFreeroll.style.display = 'none';
  }
}

function handleLive(e)
{
  //chopper le planning pour avoir le live courrant ou le prochain
  if(e) //ON
  {
    cyacolor.style.background = 'linear-gradient(to right, #ffffff 0%, #CDDF8F 0%, #9CCF70 50%, #6BBF51 100%';
    boxTitle.innerText = 'Titre du Live Winamax';
    sublive.innerText = 'Live ON';
  }
  else { //OFF
    cyacolor.style.background = 'linear-gradient(to right, #ffffff 0%, #C56B6B 0%, #B45055 50%, #a3353e 100%);';
    boxTitle.innerText = 'Prochain live dans XX:XX';
    sublive.innerText = 'Live OFF';
  }
}

chrome.storage.sync.get(['notif','quiz','freeroll','tickets','live'],function(res)
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

  //handlePlanning();

  handleLive(res.live);

  handleFreeroll(res.freeroll);

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
   });
   freerollStatus.addEventListener('click',function(e)
   {
      chrome.storage.sync.set({freeroll : e.target.checked});
      handleFreeroll(e.target.checked);
   });
   ticketStatus.addEventListener('click',function(e)
   {
       chrome.storage.sync.set({tickets : e.target.checked});
   });
});
