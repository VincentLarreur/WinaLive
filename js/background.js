/*
*   CONSTANTE
*/

const WINAMAX_GRILLE_URL = "https://www.winamax.fr/winamax-tv-grille";
const WINAMAX_TV_URL = "https://www.winamax.fr/winamax-tv";

const WINAMAX_TITLE = "La grille des programmes - Winamax";

/*
*   CONSTANTE
*/

var live;

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
            if(live) {
                chrome.storage.sync.get(['notif'],function(res) {
                    let notif = (res.notif) ? true : false;
                    if(notif) {
                        let opt = {
                            type: 'basic',
                            priority: 1,
                            title: 'LIVE ON',
                            message: 'Rendez vous sur winamax.tv pour voir le live',
                            iconUrl: 'resources/images/WinaLive32x32.png'
                        };
                        chrome.notifications.create('ON_notification', opt, function(id) {});
                    }
                });
            }
        });
    }).catch((error) => {
        console.log("Error fetching - Live : "+error)
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
        //getNextLive();
    }
    else {
        //checkQuiz();
        setTimeout(function(){main()}, 120000);
    }
}

main();