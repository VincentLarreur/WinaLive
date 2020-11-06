/*
*   TEXTES
*/
const nextLiveText = "Prochain live : {titre}";
const currentLiveText = "Live en cours : {titre}";
const nextFreerollText = "Prochain Freeroll";

/*
*   CONSTANTES
*/

var msecPerMinute = 1000 * 60;
var msecPerHour = msecPerMinute * 60;

/*
*   FUNCTIONS
*/

function stringHoraire(horaire) {
    let d = new Date(horaire);
    return d.toLocaleTimeString([], {timeStyle: 'short'});
}

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
        logo.src = '../resources/images/Popup/on_icon.svg';
        liveText.innerText = currentLiveText.replace('{titre}', res.live.title);
        return;
    }
    logo.src = '../resources/images/Popup/off_icon.svg';
    liveText.innerText = nextLiveText.replace('{titre}', res.live.title);
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
    freerollText.innerText = nextFreerollText;
    freerollClock.innerText = stringHoraire(res.planningFreeroll[j]);
});
