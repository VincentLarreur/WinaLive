/*
*   CONSTANTES
*/

const WINAMAX_GRILLE_URL = "https://www.winamax.fr/winamax-tv-grille";
const WINAMAX_TV_URL = "https://www.winamax.fr/winamax-tv";

const WINAMAX_TITLE = "La grille des programmes - Winamax";

/*
*   VARIABLES
*/

var live = false;
var todayPlanning;
var tomorrowPlanning;

/*
*   COMMON FUNCTION
*/

function liveOn() {
    chrome.browserAction.setBadgeText({text:"On"});
    chrome.browserAction.setBadgeBackgroundColor({color:"green"});
}

function liveOff() {
    chrome.browserAction.setBadgeText({text:"Off"});
    chrome.browserAction.setBadgeBackgroundColor({color:"red"});
}

function update() {
    if(live) {
        liveOn();
        return;
    }
    liveOff();
}

/*
*   INITIALISATION
*/

function fetchWeekPlanning()
{
    fetch(WINAMAX_GRILLE_URL).then(function(response) {
        response.text().then(function(text) {
            let JSONString = text.substring(text.indexOf("days")+6, text.indexOf("\"highlight\"")-1);
            console.log(JSONString);
            chrome.storage.sync.set({planning : JSON.parse(JSONString)});
        });
    })
    .catch((error) => {
        console.log("Error fetching - Planning :"+error)
    });
}

function getCurrentWeek() {
    now = new Date();
    //1rst of January
    january_one = new Date(now.getFullYear(), 0, 1);
    return Math.ceil( (((now - january_one) / 86400000) + january_one.getDay() + 1) / 7 );
}

/*
*   Initialisation de l'extension chrome
*   -> Récupération du planning, une fois par semaine
*/
function init() {
    current_week_nb = getCurrentWeek();
    chrome.storage.sync.get(['planning', 'week_nb'],function(res) {
        if(!res.hasOwnProperty('week_nb')) {
            chrome.storage.sync.set({week_nb : current_week_nb});
        }
        if(!res.hasOwnProperty('planning') || res.week_nb != current_week_nb)
        {
          console.log(res.week_nb);
          fetchWeekPlanning();
          chrome.storage.sync.set({week_nb : current_week_nb});
        }
    });
}

init();

/*
*   MAIN - Check live
*/

function checkLive() {
    fetch(WINAMAX_TV_URL).then(function(response) {
        response.text().then(function(text) {
            live = !text.includes(WINAMAX_TITLE);
            update();
            if(live) {
                chrome.storage.sync.get(['notif'],function(res) {
                    let notif = (res.notif) ? true : false;
                    if(notif) {
                        let opt = {
                            type: 'basic',
                            priority: 1,
                            title: 'LIVE ON',
                            message: 'Rendez vous sur winamax.tv pour voir le live',
                            iconUrl: 'resources/images/icons/32x32.png'
                        };
                        chrome.notifications.create('ON_notification', opt, function(id) {});
                    }
                });
            }
            chrome.storage.sync.set({isLive : live});
        });
    }).catch((error) => {
        console.log("Error fetching - Live : "+error)
    });
}

function setCurrentDayPlanning(planning) {
    var n = new Date().getDay();
    switch(n) {
        case 0: // Sunday
          today=planning.Su;
          tomorrow=planning.M;
          break;
        case 1: // Monday
          today=planning.M;
          tomorrow=planning.T;
          break;
        case 2: // Tuesday
          today=planning.T;
          tomorrow=planning.W;
          break;
        case 3: // Wednesday
          today=planning.W;
          tomorrow=planning.Th;
          break;
        case 4: // Thursday
          today=planning.Th;
          tomorrow=planning.F;
          break;
        case 5: // Friday
          today=planning.F;
          tomorrow=planning.S;
          break;
        case 6: // Saturday
          today=planning.S;
          tomorrow=planning.Su;
          break;
    }
}

function waitNextLive() {
    chrome.storage.sync.get(['planning'],function(res) {
        if(!res.hasOwnProperty('planning')) {
            fetchWeekPlanning();
            waitNextLive();
            return;
        }
        
        setCurrentDayPlanning(res.planning);

        let i = 0;
        let nextLive;
        let now = new Date();
        while(i<today.length && nextLive == undefined) {
            let start = new Date(today[i].start_date);
            if(start > now ) {
                nextLive = today[i];
            }
            i++;
        }
        if(nextLive == undefined) {
            nextLive = tomorrow[0];
        }
        chrome.storage.sync.set({live : nextLive});
        let timerNext = (new Date(today[i].start_date))-now;
        setTimeout(function(){main()}, timerNext);
    });

}

/*
*   CheckLive
*   OFF : wait for the next Live known from planning
*   ON : check quiz every 2 minutes
*/
function main() {
    checkLive();
    if(!live) {
        waitNextLive();
    }
    else {
        //checkQuiz();
        setTimeout(function(){main()}, 120000);
    }
}

main();