/*
*   TEXTES
*/
const NEXT_LIVE_TEXT = "Prochain live : {titre}";
const CURRENT_LIVE_TEXT = "Live en cours : {titre}";
const NEXT_FREEROLL_TEXT = "Prochain Freeroll";

/*
*   CONSTANTES
*/

const ON_LOGO_PATH = '../resources/images/Popup/on_icon.svg';
const OFF_LOGO_PATH = '../resources/images/Popup/off_icon.svg';

const msecPerMinute = 1000 * 60;
const msecPerHour = msecPerMinute * 60;

/*
*   FUNCTIONS
*/

function stringHoraire(horaire) {
    let d = new Date(horaire);
    return d.toLocaleTimeString([], {timeStyle: 'short'});
}


/*
* -- Handle options --
* Get from storage the options
* to set the checkboxes to the 
* corresponding state
*/
chrome.storage.sync.get(['notif','quiz','ticket'],function(res) {
    notifCheckbox.checked = res.hasOwnProperty('notif') ? res.notif : false;
    notifCheckbox.addEventListener('click',function(e) { chrome.storage.sync.set({notif : e.target.checked}); });

    quizCheckbox.checked = res.hasOwnProperty('quiz') ? res.quiz : false;
    quizCheckbox.addEventListener('click',function(e) { chrome.storage.sync.set({quiz : e.target.checked}); });

    ticketCheckbox.checked = res.hasOwnProperty('ticket') ? res.ticket : false;
    ticketCheckbox.addEventListener('click',function(e) { chrome.storage.sync.set({ticket : e.target.checked}); });
});

/*
* -- Handle live --
* Get from storage the live to
* display on the popup
*/
chrome.storage.sync.get(["live", "isLive"],function(res) {
    let start = stringHoraire(res.live.start_date);
    liveClock.innerText = start;
    presenters.innerText = res.live.presenters;
    startHour.innerText = start;
    endHour.innerText = stringHoraire(res.live.end_date);
    journalist.innerText = res.live.journalists;
    if(res.isLive) {
        logo.src = ON_LOGO_PATH;
        liveText.innerText = CURRENT_LIVE_TEXT.replace('{titre}', res.live.title);
        return;
    }
    logo.src = OFF_LOGO_PATH;
    liveText.innerText = NEXT_LIVE_TEXT.replace('{titre}', res.live.title);
});

/*
* -- Handle freeroll --
* Get from storage the planning of freerolls
* to display the corresponding one on the popup
*/
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
    freerollText.innerText = NEXT_FREEROLL_TEXT;
    freerollClock.innerText = stringHoraire(res.planningFreeroll[j]);
});