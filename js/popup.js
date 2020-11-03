/*
*   TEXTES
*/
const nextLiveText = "Prochain live : {titre} - [{horaire}]";
const nextFreerollText = "Prochain Freeroll : {interval} - [{horaire}]";
const nowFreerollText = "Le FreeRoll, c'est maintenant !";

/*
*   CONSTANTES HTML elements
*/
const live = document.querySelector('#live');
const freeroll = document.querySelector('#freeroll');

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

chrome.storage.sync.get(["nextLive"],function(res) {
    live.innerText = nextLiveText
        .replace('{titre}', res.nextLive.title)
        .replace('{horaire}', stringHoraire(res.nextLive.start_date));
});


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
    if(minutes == 0) {
        freeroll.innerText = nowFreerollText;
        return;
    }
    current.setHours(hours, minutes);
    freeroll.innerText = nextFreerollText
        .replace('{interval}', stringHoraire(new Date(current)))
        .replace('{horaire}', stringHoraire(res.planningFreeroll[j]));
});
