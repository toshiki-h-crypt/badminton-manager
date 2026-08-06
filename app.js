/* =====================================================
   Badminton Doubles Manager
   app.js Complete Edition
   Part 1
   ===================================================== */

/* =====================================================
   Storage Keys
   ===================================================== */

const STORAGE_KEY =
    "badminton_doubles_manager_v4";

/* =====================================================
   Global State
   ===================================================== */

let players = [];

let waitingMatches = [];

let activeCourts = [];

let finishedMatches = [];

let matchId = 1;

let deferredPrompt = null;

let settings = {

    courtCount: 2,

    matchCount: 30,

    progressMode: "bulk"

};

let appOptions = {

    autoSave: true,

    resetOnExit: false

};

/* =====================================================
   Startup
   ===================================================== */

window.addEventListener(
    "load",
    initializeApp
);

/* =====================================================
   Initialize
   ===================================================== */

function initializeApp(){

    loadData();

    bindEvents();

    restoreSettings();

    restoreAppOptions();

    applySavedTheme();

    renderPlayers();

    renderAll();

    renderStats();

    registerServiceWorker();

}

/* =====================================================
   Event Binding
   ===================================================== */

function bindEvents(){

    bindTabs();

    const bind = (
        id,
        event,
        handler
    ) => {

        const element =
            document.getElementById(id);

        if(element){

            element.addEventListener(
                event,
                handler
            );

        }

    };

    bind(
        "addPlayerBtn",
        "click",
        addPlayers
    );

    bind(
        "autoCreateBtn",
        "click",
        autoCreatePlayers
    );

    bind(
        "clearPlayersBtn",
        "click",
        clearPlayers
    );

    bind(
        "generateBtn",
        "click",
        generateSchedule
    );

    bind(
        "resetBtn",
        "click",
        resetAll
    );

    bind(
        "regenerateBtn",
        "click",
        regenerateSchedule
    );

    bind(
        "csvBtn",
        "click",
        exportCsv
    );

    bind(
        "showStatsBtn",
        "click",
        toggleStats
    );

    bind(
        "toggleFinishedBtn",
        "click",
        toggleFinishedMatches
    );

    bind(
        "clearFinishedBtn",
        "click",
        clearFinishedMatches
    );

    bind(
        "darkModeBtn",
        "click",
        toggleDarkMode
    );

    bind(
        "autoSaveSelect",
        "change",
        updateAppOptions
    );

    bind(
        "resetOnExitSelect",
        "change",
        updateAppOptions
    );

}

/* =====================================================
   Tabs
   ===================================================== */

function bindTabs(){

    document
        .getElementById(
            "tabSettings"
        )
        ?.addEventListener(
            "click",
            () => switchTab(
                "settings"
            )
        );

    document
        .getElementById(
            "tabMatches"
        )
        ?.addEventListener(
            "click",
            () => switchTab(
                "matches"
            )
        );

    document
        .getElementById(
            "tabManage"
        )
        ?.addEventListener(
            "click",
            () => switchTab(
                "manage"
            )
        );

}

function switchTab(page){

    document
        .getElementById(
            "settingsPage"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "matchPage"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "managePage"
        )
        .classList.add(
            "hidden"
        );

    document
        .querySelectorAll(".tab")
        .forEach(tab=>{

            tab.classList.remove(
                "active"
            );

        });

    if(page==="settings"){

        document
            .getElementById(
                "settingsPage"
            )
            .classList.remove(
                "hidden"
            );

        document
            .getElementById(
                "tabSettings"
            )
            .classList.add(
                "active"
            );

    }

    if(page==="matches"){

        document
            .getElementById(
                "matchPage"
            )
            .classList.remove(
                "hidden"
            );

        document
            .getElementById(
                "tabMatches"
            )
            .classList.add(
                "active"
            );

    }

    if(page==="manage"){

        document
            .getElementById(
                "managePage"
            )
            .classList.remove(
                "hidden"
            );

        document
            .getElementById(
                "tabManage"
            )
            .classList.add(
                "active"
            );

    }

}

/* =====================================================
   Settings
   ===================================================== */

function saveSettings(){

    settings.courtCount =

        Number(
            document
            .getElementById(
                "courtCount"
            )
            .value
        );

    settings.matchCount =

        Number(
            document
            .getElementById(
                "matchCount"
            )
            .value
        );

    settings.progressMode =

        document
        .getElementById(
            "progressMode"
        )
        .value;

}

function restoreSettings(){

    document
        .getElementById(
            "courtCount"
        )
        .value =
        settings.courtCount;

    document
        .getElementById(
            "matchCount"
        )
        .value =
        settings.matchCount;

    document
        .getElementById(
            "progressMode"
        )
        .value =
        settings.progressMode;

}

/* =====================================================
   App Options
   ===================================================== */

function updateAppOptions(){

    appOptions.autoSave =

        document
        .getElementById(
            "autoSaveSelect"
        )
        .value === "true";

    appOptions.resetOnExit =

        document
        .getElementById(
            "resetOnExitSelect"
        )
        .value === "true";

    saveData();

}

function restoreAppOptions(){

    const autoSaveSelect =
        document.getElementById(
            "autoSaveSelect"
        );

    const resetSelect =
        document.getElementById(
            "resetOnExitSelect"
        );

    if(autoSaveSelect){

        autoSaveSelect.value =
            appOptions.autoSave
            ? "true"
            : "false";

    }

    if(resetSelect){

        resetSelect.value =
            appOptions.resetOnExit
            ? "true"
            : "false";

    }

}

/* =====================================================
   Storage
   ===================================================== */

function saveData(){

    if(
        !appOptions.autoSave
    ){
        return;
    }

    saveSettings();

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            players,

            settings,

            appOptions,

            waitingMatches,

            activeCourts,

            finishedMatches,

            matchId

        })

    );

}

function loadData(){

    const json =
        localStorage.getItem(
            STORAGE_KEY
        );

    if(!json){
        return;
    }

    try{

        const data =
            JSON.parse(json);

        players =
            data.players || [];

        settings =
            data.settings || settings;

        appOptions =
            data.appOptions || appOptions;

        waitingMatches =
            data.waitingMatches || [];

        activeCourts =
            data.activeCourts || [];

        finishedMatches =
            data.finishedMatches || [];

        matchId =
            data.matchId || 1;

    }
    catch(error){

        console.error(
            error
        );

    }

}
/* =====================================================
   Part 2
   Modal / PWA / Theme
   ===================================================== */

/* =====================================================
   Custom Confirm
   ===================================================== */

function showConfirm(message){

    return new Promise(resolve => {

        const overlay =
            document.getElementById(
                "modalOverlay"
            );

        const modalMessage =
            document.getElementById(
                "modalMessage"
            );

        const okButton =
            document.getElementById(
                "modalOk"
            );

        const cancelButton =
            document.getElementById(
                "modalCancel"
            );

        modalMessage.textContent =
            message;

        overlay.classList.remove(
            "hidden"
        );

        const closeModal = (
            result
        ) => {

            overlay.classList.add(
                "hidden"
            );

            okButton.onclick =
                null;

            cancelButton.onclick =
                null;

            resolve(result);

        };

        okButton.onclick =
            () => closeModal(
                true
            );

        cancelButton.onclick =
            () => closeModal(
                false
            );

    });

}

/* =====================================================
   Simple Alert
   ===================================================== */

async function showAlert(message){

    await showConfirm(
        message
    );

}

/* =====================================================
   Clear Finished Matches
   ===================================================== */

async function clearFinishedMatches(){

    const result =
        await showConfirm(
            "終了試合履歴を削除しますか？"
        );

    if(!result){
        return;
    }

    finishedMatches = [];

    saveData();

    renderFinishedMatches();

}

/* =====================================================
   Toggle Finished Matches
   ===================================================== */

function toggleFinishedMatches(){

    const container =
        document.getElementById(
            "finishedContainer"
        );

    const button =
        document.getElementById(
            "toggleFinishedBtn"
        );

    if(
        !container ||
        !button
    ){
        return;
    }

    container.classList.toggle(
        "hidden"
    );

    if(
        container.classList.contains(
            "hidden"
        )
    ){

        button.textContent =
            "▼ 展開";

    }else{

        button.textContent =
            "▲ 閉じる";

    }

}

/* =====================================================
   Statistics Toggle
   ===================================================== */

function toggleStats(){

    const area =
        document.getElementById(
            "statsArea"
        );

    if(!area){
        return;
    }

    area.classList.toggle(
        "hidden"
    );

}

/* =====================================================
   Dark Mode
   ===================================================== */

function toggleDarkMode(){

    document.body.classList.toggle(
        "dark-mode"
    );

    const enabled =

        document.body.classList.contains(
            "dark-mode"
        );

    localStorage.setItem(
        "darkMode",
        enabled
    );

}

function applySavedTheme(){

    const darkMode =

        localStorage.getItem(
            "darkMode"
        );

    if(
        darkMode === "true"
    ){

        document.body.classList.add(
            "dark-mode"
        );

    }

}

/* =====================================================
   PWA Install
   ===================================================== */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredPrompt =
            event;

        const button =
            document.getElementById(
                "installBtn"
            );

        if(button){

            button.style.display =
                "block";

        }

    }
);

function bindInstallButton(){

    const button =
        document.getElementById(
            "installBtn"
        );

    if(!button){
        return;
    }

    button.addEventListener(
        "click",
        installPwa
    );

}

async function installPwa(){

    if(
        !deferredPrompt
    ){
        return;
    }

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;

}

/* =====================================================
   Service Worker
   ===================================================== */

function registerServiceWorker(){

    if(
        !(
            "serviceWorker"
            in navigator
        )
    ){
        return;
    }

    navigator.serviceWorker
        .register(
            "./service-worker.js"
        )
        .catch(error => {

            console.error(
                error
            );

        });

}

/* =====================================================
   Reset On Exit
   ===================================================== */

window.addEventListener(
    "beforeunload",
    () => {

        if(
            !appOptions.resetOnExit
        ){
            return;
        }

        localStorage.removeItem(
            STORAGE_KEY
        );

    }
);
/* =====================================================
   Part 3
   Player Management
   ===================================================== */

/* =====================================================
   Add Players
   ===================================================== */

function addPlayers(){

    const input =
        document.getElementById(
            "playerInput"
        );

    if(!input){
        return;
    }

    const names =
        input.value
        .split(/[\n,\s、]+/)
        .map(name => name.trim())
        .filter(Boolean);

    if(
        names.length === 0
    ){
        return;
    }

    names.forEach(name=>{

        const exists =
            players.some(
                player =>
                player.name === name
            );

        if(exists){
            return;
        }

        players.push({

            id:
                Date.now()
                +
                Math.random(),

            name,

            active:true,

            played:0,

            rested:0,

            partners:{},

            opponents:{}

        });

    });

    input.value = "";

    saveData();

    renderPlayers();

    renderStats();

}

/* =====================================================
   Auto Create Players
   ===================================================== */

async function autoCreatePlayers(){

    const count = Number(

        document
        .getElementById(
            "autoPlayerCount"
        )
        .value

    );

    if(count < 4){

        await showAlert(
            "4人以上入力してください"
        );

        return;

    }

    const result =
        await showConfirm(
            `${count}人を番号で登録しますか？`
        );

    if(!result){
        return;
    }

    players = [];

    for(
        let i=1;
        i<=count;
        i++
    ){

        players.push({

            id:i,

            name:String(i),

            active:true,

            played:0,

            rested:0,

            partners:{},

            opponents:{}

        });

    }

    saveData();

    renderPlayers();

    renderStats();

}

/* =====================================================
   Delete One Player
   ===================================================== */

async function deletePlayer(id){

    const result =
        await showConfirm(
            "この参加者を削除しますか？"
        );

    if(!result){
        return;
    }

    players =
        players.filter(
            player =>
            player.id !== id
        );

    saveData();

    renderPlayers();

    renderStats();

}

/* =====================================================
   Delete All Players
   ===================================================== */

async function clearPlayers(){

    const result =
        await showConfirm(
            "参加者をすべて削除しますか？"
        );

    if(!result){
        return;
    }

    players = [];

    waitingMatches = [];

    activeCourts = [];

    finishedMatches = [];

    matchId = 1;

    saveData();

    renderPlayers();

    renderAll();

    renderStats();

}

/* =====================================================
   Toggle Attendance
   ===================================================== */

function togglePlayer(id){

    const player =
        players.find(
            player =>
            player.id === id
        );

    if(!player){
        return;
    }

    player.active =
        !player.active;

    saveData();

    renderPlayers();

}

/* =====================================================
   Reset Statistics
   ===================================================== */

function resetPlayerStats(){

    players.forEach(player => {

        player.played = 0;

        player.rested = 0;

        player.partners = {};

        player.opponents = {};

    });

}

/* =====================================================
   Render Player List
   ===================================================== */

function renderPlayers(){

    const playerList =
        document.getElementById(
            "playerList"
        );

    const playerCount =
        document.getElementById(
            "playerCount"
        );

    if(
        !playerList ||
        !playerCount
    ){
        return;
    }

    playerList.innerHTML = "";

    playerCount.textContent =
        players.length;

    const numberOnlyMode =

        players.length > 0 &&

        players.every(
            player =>
            /^\d+$/
            .test(player.name)
        );

    if(numberOnlyMode){

        const li =
            document.createElement(
                "li"
            );

        li.innerHTML = `

            <strong>

                参加人数：
                ${players.length}
                人

            </strong>

        `;

        playerList.appendChild(
            li
        );

        return;

    }

    players.forEach(player => {

        const li =
            document.createElement(
                "li"
            );

        li.innerHTML = `

            <label>

                <input
                    type="checkbox"
                    ${player.active ? "checked" : ""}
                    onchange="togglePlayer(${player.id})">

                ${player.name}

            </label>

            <button
                class="delete-btn"
                onclick="deletePlayer(${player.id})">

                🗑

            </button>

        `;

        playerList.appendChild(
            li
        );

    });

}
/* =====================================================
   Part 4
   Match Generation Engine
   ===================================================== */

/* =====================================================
   Generate Schedule
   ===================================================== */

async function generateSchedule(){

    saveSettings();

    const activePlayers =

        players.filter(
            player => player.active
        );

    if(activePlayers.length < 4){

        await showAlert(
            "参加者は4人以上必要です"
        );

        return;

    }

    waitingMatches = [];

    activeCourts = [];

    finishedMatches = [];

    matchId = 1;

    resetPlayerStats();

    for(
        let i = 0;
        i < settings.matchCount;
        i++
    ){

        const match =
            createBestMatch();

        if(match){

            waitingMatches.push(
                match
            );

        }

    }

    initializeCourts();

    saveData();

    renderAll();

    renderStats();

    switchTab(
        "matches"
    );

}

/* =====================================================
   Create Best Match
   ===================================================== */

function createBestMatch(){

    const availablePlayers =

        players.filter(
            player => player.active
        );

    if(
        availablePlayers.length < 4
    ){
        return null;
    }

    let bestGroup = null;

    let bestScore =
        Number.MAX_SAFE_INTEGER;

    for(
        let attempt = 0;
        attempt < 1000;
        attempt++
    ){

        const group =

            shuffle(
                availablePlayers
            ).slice(
                0,
                4
            );

        const score =
            evaluateGroup(
                group
            );

        if(
            score <
            bestScore
        ){

            bestScore =
                score;

            bestGroup =
                group;

        }

    }

    if(!bestGroup){
        return null;
    }

    return buildMatch(
        bestGroup
    );

}

/* =====================================================
   Evaluate Group
   ===================================================== */

function evaluateGroup(group){

    let score = 0;

    score +=
        appearanceScore(
            group
        );

    score +=
        restBalanceScore(
            group
        );

    score +=
        pairingScore(
            group
        );

    score +=
        opponentScore(
            group
        );

    return score;

}

/* =====================================================
   Match Build
   ===================================================== */

function buildMatch(group){

    const teamA = [

        group[0].name,

        group[1].name

    ];

    const teamB = [

        group[2].name,

        group[3].name

    ];

    updateStatistics(
        teamA,
        teamB
    );

    return {

        id: matchId++,

        teamA,

        teamB,

        status: "waiting"

    };

}

/* =====================================================
   Fairness Score
   ===================================================== */

function appearanceScore(group){

    const values =

        group.map(
            player =>
            player.played
        );

    const max =
        Math.max(...values);

    const min =
        Math.min(...values);

    return (
        max - min
    ) * 150;

}

function restBalanceScore(group){

    const values =

        group.map(
            player =>
            player.rested
        );

    const max =
        Math.max(...values);

    const min =
        Math.min(...values);

    return (
        max - min
    ) * 50;

}

/* =====================================================
   Duplicate Pair Check
   ===================================================== */

function pairingScore(group){

    const a = group[0];

    const b = group[1];

    const c = group[2];

    const d = group[3];

    const pairA =

        (
            a.partners[
                b.name
            ] || 0
        ) * 400;

    const pairB =

        (
            c.partners[
                d.name
            ] || 0
        ) * 400;

    return pairA + pairB;

}

/* =====================================================
   Duplicate Opponent Check
   ===================================================== */

function opponentScore(group){

    let total = 0;

    for(
        let i=0;
        i<2;
        i++
    ){

        for(
            let j=2;
            j<4;
            j++
        ){

            total +=

                (
                    group[i]
                    .opponents[
                        group[j].name
                    ] || 0
                )

                * 100;

        }

    }

    return total;

}

/* =====================================================
   Utility Shuffle
   ===================================================== */

function shuffle(array){

    const copy = [...array];

    for(

        let i =
        copy.length - 1;

        i > 0;

        i--

    ){

        const j =

            Math.floor(
                Math.random()
                *
                (
                    i + 1
                )
            );

        [

            copy[i],

            copy[j]

        ] = [

            copy[j],

            copy[i]

        ];

    }

    return copy;

}

/* =====================================================
   Statistics Update
   ===================================================== */

function updateStatistics(
    teamA,
    teamB
){

    const participants = [

        findPlayer(
            teamA[0]
        ),

        findPlayer(
            teamA[1]
        ),

        findPlayer(
            teamB[0]
        ),

        findPlayer(
            teamB[1]
        )

    ];

    participants.forEach(
        player => {

            if(player){

                player.played++;

            }

        }
    );

    addPartner(
        teamA[0],
        teamA[1]
    );

    addPartner(
        teamB[0],
        teamB[1]
    );

    teamA.forEach(a=>{

        teamB.forEach(b=>{

            addOpponent(
                a,
                b
            );

        });

    });

    updateRestCount();

}

/* =====================================================
   Rest Count
   ===================================================== */

function updateRestCount(){

    const maxPlayed =

        Math.max(

            ...players.map(
                player =>
                player.played
            )

        );

    players.forEach(player => {

        player.rested =

            maxPlayed

            -

            player.played;

    });

}

/* =====================================================
   Utility
   ===================================================== */

function findPlayer(name){

    return players.find(
        player =>
        player.name === name
    );

}

function addPartner(
    playerA,
    playerB
){

    const a =
        findPlayer(playerA);

    const b =
        findPlayer(playerB);

    if(!a || !b){
        return;
    }

    if(
        !a.partners[playerB]
    ){

        a.partners[playerB] = 0;

    }

    if(
        !b.partners[playerA]
    ){

        b.partners[playerA] = 0;

    }

    a.partners[playerB]++;

    b.partners[playerA]++;

}

function addOpponent(
    playerA,
    playerB
){

    const a =
        findPlayer(playerA);

    const b =
        findPlayer(playerB);

    if(!a || !b){
        return;
    }

    if(
        !a.opponents[playerB]
    ){

        a.opponents[playerB] = 0;

    }

    if(
        !b.opponents[playerA]
    ){

        b.opponents[playerA] = 0;

    }

    a.opponents[playerB]++;

    b.opponents[playerA]++;

}

/* =====================================================
   Initial Court Assignment
   ===================================================== */

function initializeCourts(){

    activeCourts = [];

    for(
        let i=0;
        i<settings.courtCount;
        i++
    ){

        if(
            waitingMatches.length === 0
        ){
            break;
        }

        activeCourts.push({

            courtNo:
                i + 1,

            match:
                waitingMatches.shift()

        });

    }

}
/* =====================================================
   Part 5
   Match Progress Management
   ===================================================== */

/* =====================================================
   Finish Match
   ===================================================== */

async function finishMatch(courtIndex){

    const court =
        activeCourts[courtIndex];

    if(
        !court ||
        !court.match
    ){
        return;
    }

    finishedMatches.push(
        court.match
    );

    court.match = null;

    if(
        settings.progressMode ===
        "single"
    ){

        assignSingleMatch(
            courtIndex
        );

    }else{

        const finishedAll =

            activeCourts.every(
                court =>
                !court.match
            );

        if(finishedAll){

            assignBulkMatches();

        }

    }

    saveData();

    renderAll();

    renderStats();

}

/* =====================================================
   Single Progress Mode
   ===================================================== */

function assignSingleMatch(
    courtIndex
){

    if(
        waitingMatches.length === 0
    ){
        return;
    }

    activeCourts[
        courtIndex
    ].match =

        waitingMatches.shift();

}

/* =====================================================
   Bulk Progress Mode
   ===================================================== */

function assignBulkMatches(){

    activeCourts.forEach(
        court => {

            if(
                waitingMatches.length > 0
            ){

                court.match =
                    waitingMatches.shift();

            }

        }
    );

}

/* =====================================================
   Reset Schedule
   ===================================================== */

async function resetAll(){

    const result =
        await showConfirm(
            "生成済みの対戦表をリセットしますか？"
        );

    if(!result){
        return;
    }

    waitingMatches = [];

    activeCourts = [];

    finishedMatches = [];

    matchId = 1;

    resetPlayerStats();

    saveData();

    renderAll();

    renderStats();

}

/* =====================================================
   Regenerate Schedule
   ===================================================== */

async function regenerateSchedule(){

    const result =
        await showConfirm(
            "対戦表を再生成しますか？"
        );

    if(!result){
        return;
    }

    waitingMatches = [];

    activeCourts = [];

    finishedMatches = [];

    matchId = 1;

    resetPlayerStats();

    generateSchedule();

}

/* =====================================================
   Remaining Count
   ===================================================== */

function renderRemainingCount(){

    const element =
        document.getElementById(
            "remainingCount"
        );

    if(!element){
        return;
    }

    element.textContent =
        waitingMatches.length;

}

/* =====================================================
   Main Render
   ===================================================== */

function renderAll(){

    renderRemainingCount();

    renderCourts();

    renderWaitingMatches();

    renderFinishedMatches();

}

/* =====================================================
   Render Courts
   ===================================================== */

function renderCourts(){

    const area =
        document.getElementById(
            "courtArea"
        );

    if(!area){
        return;
    }

    area.innerHTML = "";

    activeCourts.forEach(

        (
            court,
            index
        ) => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "court-card";

            if(
                !court.match
            ){

                div.innerHTML = `

                    <div class="court-title">

                        コート ${court.courtNo}

                    </div>

                    <div>

                        空きコート

                    </div>

                `;

                area.appendChild(
                    div
                );

                return;

            }

            div.innerHTML = `

                <div class="court-title">

                    コート ${court.courtNo}

                </div>

                <div class="court-line">

                    <span>

                        ${court.match.teamA.join("/")}

                    </span>

                    <span class="vs-inline">

                        VS

                    </span>

                    <span>

                        ${court.match.teamB.join("/")}

                    </span>

                    <button
                        class="finish-btn-small"
                        onclick="finishMatch(${index})">

                        終了

                    </button>

                </div>

            `;

            area.appendChild(
                div
            );

        }

    );

}

/* =====================================================
   Render Waiting Matches
   ===================================================== */

function renderWaitingMatches(){

    const area =
        document.getElementById(
            "waitingArea"
        );

    if(!area){
        return;
    }

    area.innerHTML = "";

    waitingMatches.forEach(
        match => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "match-card waiting-match";

            div.innerHTML = `

                <div class="match-number">

                    試合 ${match.id}

                </div>

                <div>

                    ${match.teamA.join("/")}

                    VS

                    ${match.teamB.join("/")}

                </div>

            `;

            area.appendChild(
                div
            );

        }
    );

}

/* =====================================================
   Render Finished Matches
   ===================================================== */

function renderFinishedMatches(){

    const area =
        document.getElementById(
            "finishedArea"
        );

    const counter =
        document.getElementById(
            "finishedCount"
        );

    if(!area){
        return;
    }

    area.innerHTML = "";

    if(counter){

        counter.textContent =
            finishedMatches.length;

    }

    [...finishedMatches]
        .reverse()
        .forEach(match => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "match-card finished-match";

            div.innerHTML = `

                <div class="match-number">

                    試合 ${match.id}

                </div>

                <div>

                    ${match.teamA.join("/")}

                    VS

                    ${match.teamB.join("/")}

                </div>

            `;

            area.appendChild(
                div
            );

        });

}
/* =====================================================
   Part 6
   Statistics / Export
   ===================================================== */

/* =====================================================
   Render Statistics
   ===================================================== */

function renderStats(){

    const area =
        document.getElementById(
            "statsArea"
        );

    if(!area){
        return;
    }

    area.innerHTML = "";

    const sortedPlayers =

        [...players]

        .sort(
            (a,b)=>
            b.played -
            a.played
        );

    sortedPlayers.forEach(

        (
            player,
            index
        ) => {

            let rank = "";

            if(index===0){
                rank = "🥇";
            }
            else if(index===1){
                rank = "🥈";
            }
            else if(index===2){
                rank = "🥉";
            }

            const partnerHistory =

                Object.entries(
                    player.partners
                )
                .map(
                    ([name,count]) =>
                    `${name}:${count}`
                )
                .join(" / ");

            const opponentHistory =

                Object.entries(
                    player.opponents
                )
                .map(
                    ([name,count]) =>
                    `${name}:${count}`
                )
                .join(" / ");

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "stat-card";

            card.innerHTML = `

                <div class="stat-name">

                    ${rank}
                    ${player.name}

                </div>

                <div class="stat-row">

                    <span>

                        出場 :
                        ${player.played}

                    </span>

                    <span>

                        休憩 :
                        ${player.rested}

                    </span>

                </div>

                <div class="stat-row">

                    <strong>

                        ペア履歴

                    </strong>

                </div>

                <div>

                    ${
                        partnerHistory ||
                        "なし"
                    }

                </div>

                <div
                    class="stat-row">

                    <strong>

                        対戦履歴

                    </strong>

                </div>

                <div>

                    ${
                        opponentHistory ||
                        "なし"
                    }

                </div>

            `;

            area.appendChild(
                card
            );

        }

    );

}

/* =====================================================
   CSV Export
   ===================================================== */

function exportCsv(){

    let csv =

        "試合No,チームA,チームB\n";

    finishedMatches.forEach(
        match => {

            csv +=

                `${match.id},"${match.teamA.join("/")}",` +

                `"${match.teamB.join("/")}"\n`;

        }
    );

    const blob =

        new Blob(

            [csv],

            {
                type:
                "text/csv;charset=utf-8"
            }

        );

    const url =

        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        "badminton_matches.csv";

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );

    URL.revokeObjectURL(
        url
    );

}

/* =====================================================
   Global Functions
   ===================================================== */

window.togglePlayer =
    togglePlayer;

window.deletePlayer =
    deletePlayer;

window.finishMatch =
    finishMatch;

/* =====================================================
   Auto Save on Change
   ===================================================== */

window.addEventListener(
    "change",
    () => {

        if(
            appOptions.autoSave
        ){

            saveData();

        }

    }
);

/* =====================================================
   Final Refresh
   ===================================================== */

function refreshUI(){

    renderPlayers();

    renderAll();

    renderStats();

}

/* =====================================================
   Safety
   ===================================================== */

if(

    typeof structuredClone
    === "undefined"

){

    console.log(
        "structuredClone not supported"
    );

}

/* =====================================================
   End Of File
   ===================================================== */
   