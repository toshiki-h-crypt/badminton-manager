/* =====================================================
   Badminton Doubles Manager v6
   Complete Edition
   Part 1 / 5
   ===================================================== */

/* =====================================================
   Storage
   ===================================================== */

const STORAGE_KEY =
    "badminton_doubles_manager_v6";

/* =====================================================
   Global State
   ===================================================== */

let players = [];

let waitingMatches = [];

let activeCourts = [];

let finishedMatches = [];

let matchId = 1;

let currentRound = 0;

let deferredPrompt = null;

/* =====================================================
   Settings
   ===================================================== */

let settings = {

    courtCount: 2,

    matchCount: 30,

    progressMode: "bulk",

    genderMode: "none",

    levelMode: "random"

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

    bindInstallButton();

    restoreSettings();

    restoreAppOptions();

    applySavedTheme();

    renderPlayers();

    renderAll();

    renderStats();

    validateProgressMode();

    validateLevelMode();

    registerServiceWorker();

}

/* =====================================================
   Save Data
   ===================================================== */

function saveData(){

    if(!appOptions.autoSave){
        return;
    }

    saveSettings();

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            players,

            waitingMatches,

            activeCourts,

            finishedMatches,

            matchId,

            currentRound,

            settings,

            appOptions

        })

    );

}

/* =====================================================
   Load Data
   ===================================================== */

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

        waitingMatches =
            data.waitingMatches || [];

        activeCourts =
            data.activeCourts || [];

        finishedMatches =
            data.finishedMatches || [];

        matchId =
            data.matchId || 1;

        currentRound =
            data.currentRound || 0;

        settings =
            data.settings || settings;

        appOptions =
            data.appOptions || appOptions;

    }
    catch(error){

        console.error(error);

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
            ).value
        );

    settings.matchCount =
        Number(
            document
            .getElementById(
                "matchCount"
            ).value
        );

    settings.progressMode =
        document
        .getElementById(
            "progressMode"
        ).value;

    settings.genderMode =
        document
        .getElementById(
            "genderMode"
        ).value;

    settings.levelMode =
        document
        .getElementById(
            "levelMode"
        ).value;

}

function restoreSettings(){

    document
        .getElementById(
            "courtCount"
        ).value =
        settings.courtCount;

    document
        .getElementById(
            "matchCount"
        ).value =
        settings.matchCount;

    document
        .getElementById(
            "progressMode"
        ).value =
        settings.progressMode;

    document
        .getElementById(
            "genderMode"
        ).value =
        settings.genderMode;

    document
        .getElementById(
            "levelMode"
        ).value =
        settings.levelMode;

}

/* =====================================================
   App Options
   ===================================================== */

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

function updateAppOptions(){

    appOptions.autoSave =

        document
        .getElementById(
            "autoSaveSelect"
        ).value === "true";

    appOptions.resetOnExit =

        document
        .getElementById(
            "resetOnExitSelect"
        ).value === "true";

    saveData();

}

/* =====================================================
   Utility
   ===================================================== */

function shuffle(array){

    const copy =
        [...array];

    for(
        let i = copy.length - 1;
        i > 0;
        i--
    ){

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            copy[i],
            copy[j]
        ] =
        [
            copy[j],
            copy[i]
        ];

    }

    return copy;

}

function getActivePlayers(){

    return players.filter(
        player => player.active
    );

}

function findPlayer(name){

    return players.find(
        player =>
        player.name === name
    );

}

function getLevelGroup(level){

    if(level <= 2){
        return 1;
    }

    if(level <= 4){
        return 2;
    }

    return 3;

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
            () =>
                switchTab(
                    "settings"
                )
        );

    document
        .getElementById(
            "tabMatches"
        )
        ?.addEventListener(
            "click",
            () =>
                switchTab(
                    "matches"
                )
        );

    document
        .getElementById(
            "tabManage"
        )
        ?.addEventListener(
            "click",
            () =>
                switchTab(
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
        .querySelectorAll(
            ".tab"
        )
        .forEach(tab => {

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
   Badminton Doubles Manager v6
   Complete Edition
   Part 2 / 5
   ===================================================== */

/* =====================================================
   Event Binding
   ===================================================== */

function bindEvents(){

    bindTabs();

    const bind =
    (
        id,
        event,
        handler
    ) => {

        const element =
            document.getElementById(
                id
            );

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

    bind(
        "courtCount",
        "change",
        validateProgressMode
    );

    bind(
        "genderMode",
        "change",
        validateLevelMode
    );

    bind(
        "levelMode",
        "change",
        validateLevelMode
    );

}

/* =====================================================
   Progress Mode Validation
   ===================================================== */

function validateProgressMode(){

    const courtCount =
        Number(
            document
            .getElementById(
                "courtCount"
            )?.value || 1
        );

    const activePlayers =
        getActivePlayers()
        .length;

    const progressMode =
        document
        .getElementById(
            "progressMode"
        );

    const warning =
        document
        .getElementById(
            "progressWarning"
        );

    if(
        !progressMode ||
        !warning
    ){
        return;
    }

    const singleOption =
        progressMode.querySelector(
            'option[value="single"]'
        );

    singleOption.disabled =
        false;

    warning.classList.add(
        "hidden"
    );

    if(
        courtCount === 1
    ){

        progressMode.value =
            "bulk";

        singleOption.disabled =
            true;

        warning.textContent =
            "1コートのみの利用時は一括進行のみ";

        warning.classList.remove(
            "hidden"
        );

        return;
    }

    if(
        activePlayers <
        courtCount * 8
    ){

        progressMode.value =
            "bulk";

        singleOption.disabled =
            true;

        warning.textContent =
            "参加人数が規定未満の為一括進行のみ";

        warning.classList.remove(
            "hidden"
        );

        return;
    }

}

/* =====================================================
   Level Mode Validation
   ===================================================== */

function validateLevelMode(){

    const genderMode =
        document
        .getElementById(
            "genderMode"
        );

    const levelMode =
        document
        .getElementById(
            "levelMode"
        );

    const warning =
        document
        .getElementById(
            "levelModeWarning"
        );

    if(
        !genderMode ||
        !levelMode ||
        !warning
    ){
        return;
    }

    const unifiedOption =
        levelMode.querySelector(
            'option[value="unified"]'
        );

    if(
        genderMode.value ===
        "mixed"
    ){

        unifiedOption.disabled =
            true;

        if(
            levelMode.value ===
            "unified"
        ){

            levelMode.value =
                "balance";
        }

        warning.classList.remove(
            "hidden"
        );

    }
    else{

        unifiedOption.disabled =
            false;

        warning.classList.add(
            "hidden"
        );

    }

    saveSettings();

}

/* =====================================================
   Modal
   ===================================================== */

function showConfirm(
    message
){

    return new Promise(
        resolve => {

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

            const closeModal =
            (
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
                () =>
                closeModal(
                    true
                );

            cancelButton.onclick =
                () =>
                closeModal(
                    false
                );

        }
    );

}

async function showAlert(
    message
){

    await showConfirm(
        message
    );

}

/* =====================================================
   Finished Matches
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
    }
    else{

        button.textContent =
            "▲ 閉じる";
    }

}

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

    navigator
        .serviceWorker
        .register(
            "./service-worker.js"
        )
        .catch(
            console.error
        );

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
   Badminton Doubles Manager v6
   Complete Edition
   Part 3 / 5
   ===================================================== */

/* =====================================================
   Player Add
   ===================================================== */

function createPlayer(
    name,
    id
){

    return {

        id:

            id ||
            (
                Date.now()
                +
                Math.random()
            ),

        name,

        active:true,

        gender:"none",

        level:2,

        played:0,

        rested:0,

        lastMatchRound:-999,

        partners:{},

        opponents:{}

    };

}

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

        .split(
            /[\n,\s、]+/
        )

        .map(
            name =>
            name.trim()
        )

        .filter(Boolean);

    if(
        names.length === 0
    ){
        return;
    }

    names.forEach(name => {

        const exists =

            players.some(
                player =>
                player.name === name
            );

        if(exists){
            return;
        }

        players.push(
            createPlayer(name)
        );

    });

    input.value = "";

    saveData();

    renderPlayers();

    renderStats();

    validateProgressMode();

}

/* =====================================================
   Auto Create Players
   ===================================================== */

async function autoCreatePlayers(){

    const count =
        Number(
            document
            .getElementById(
                "autoPlayerCount"
            ).value
        );

    if(
        count < 4
    ){

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

        players.push(
            createPlayer(
                String(i),
                i
            )
        );

    }

    saveData();

    renderPlayers();

    renderStats();

    validateProgressMode();

}

/* =====================================================
   Delete Player
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

    validateProgressMode();

}

/* =====================================================
   Clear Players
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

    currentRound = 0;

    matchId = 1;

    saveData();

    renderPlayers();

    renderAll();

    renderStats();

    validateProgressMode();

}

/* =====================================================
   Toggle Active
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

    validateProgressMode();

}

/* =====================================================
   Gender Update
   ===================================================== */

function setPlayerGender(
    id,
    gender
){

    const player =

        players.find(
            p => p.id === id
        );

    if(!player){
        return;
    }

    player.gender =
        gender;

    saveData();

}

/* =====================================================
   Level Update
   ===================================================== */

function setPlayerLevel(
    id,
    level
){

    const player =

        players.find(
            p => p.id === id
        );

    if(!player){
        return;
    }

    player.level =
        level;

    saveData();

    renderPlayers();

}

/* =====================================================
   Stars
   ===================================================== */

function renderStars(
    player
){

    let html = "";

    for(
        let i=1;
        i<=5;
        i++
    ){

        html += `

            <span
                class="
                    star
                    ${i<=player.level
                        ? "active"
                        : ""}
                "
                onclick="
                    setPlayerLevel(
                        ${player.id},
                        ${i}
                    )
                "
            >
                ★
            </span>

        `;

    }

    return html;

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

    playerCount.textContent =
        players.length;

    playerList.innerHTML = "";

    players.forEach(player => {

        const li =
            document.createElement(
                "li"
            );

        li.innerHTML = `

            <div class="player-row">

                <input
                    type="checkbox"
                    ${
                        player.active
                        ? "checked"
                        : ""
                    }
                    onchange="
                        togglePlayer(
                            ${player.id}
                        )
                    "
                >

                <span class="player-name">
                    ${player.name}
                </span>

                <select
                    class="gender-select"
                    onchange="
                        setPlayerGender(
                            ${player.id},
                            this.value
                        )
                    "
                >

                    <option
                        value="none"
                        ${
                            player.gender==="none"
                            ? "selected"
                            : ""
                        }
                    >
                        -
                    </option>

                    <option
                        value="male"
                        ${
                            player.gender==="male"
                            ? "selected"
                            : ""
                        }
                    >
                        男
                    </option>

                    <option
                        value="female"
                        ${
                            player.gender==="female"
                            ? "selected"
                            : ""
                        }
                    >
                        女
                    </option>

                </select>

                <div class="star-area">

                    ${renderStars(player)}

                </div>

                <button
                    class="delete-btn"
                    onclick="
                        deletePlayer(
                            ${player.id}
                        )
                    "
                >
                    🗑
                </button>

            </div>

        `;

        playerList.appendChild(
            li
        );

    });

}

/* =====================================================
   Statistics Reset
   ===================================================== */

function resetPlayerStats(){

    players.forEach(player => {

        player.played = 0;

        player.rested = 0;

        player.lastMatchRound = -999;

        player.partners = {};

        player.opponents = {};

    });

}

/* =====================================================
   Global Access
   ===================================================== */

window.togglePlayer =
    togglePlayer;

window.deletePlayer =
    deletePlayer;

window.setPlayerGender =
    setPlayerGender;

window.setPlayerLevel =
    setPlayerLevel;
/* =====================================================
   Badminton Doubles Manager v6
   Complete Edition
   Part 4 / 5
   Match Engine
   ===================================================== */

/* =====================================================
   Match Generation
   ===================================================== */

async function generateSchedule(){

    saveSettings();

    const activePlayers =
        getActivePlayers();

    if(
        activePlayers.length < 4
    ){

        await showAlert(
            "参加者は4人以上必要です"
        );

        return;

    }

    waitingMatches = [];

    activeCourts = [];

    finishedMatches = [];

    currentRound = 0;

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
   Create Match
   ===================================================== */

function createBestMatch(){

    const activePlayers =
        getActivePlayers();

    if(
        activePlayers.length < 4
    ){
        return null;
    }

    let bestMatch = null;

    let bestScore =
        Number.MAX_SAFE_INTEGER;

    const stages = [

        {
            levelStrict:true,
            mixedStrict:true
        },

        {
            levelStrict:false,
            mixedStrict:true
        },

        {
            levelStrict:false,
            mixedStrict:false
        }

    ];

    for(
        const stage of stages
    ){

        for(
            let i=0;
            i<1000;
            i++
        ){

            const group =
                shuffle(
                    activePlayers
                ).slice(
                    0,
                    4
                );

            const score =
                evaluateGroup(
                    group,
                    stage
                );

            if(
                score <
                bestScore
            ){

                bestScore =
                    score;

                bestMatch =
                    buildMatch(
                        group
                    );

            }

        }

        if(
            bestMatch &&
            bestScore < 999999
        ){
            break;
        }

    }

    return bestMatch;

}

/* =====================================================
   Evaluate Group
   ===================================================== */

function evaluateGroup(
    group,
    options
){

    let score = 0;

    score +=
        appearanceScore(
            group
        );

    score +=
        restScore(
            group
        );

    score +=
        consecutiveScore(
            group
        );

    score +=
        opponentScore(
            group
        );

    score +=
        pairScore(
            group
        );

    score +=
        genderScore(
            group,
            options
        );

    score +=
        levelScore(
            group,
            options
        );

    return score;

}

/* =====================================================
   Played Balance
   ===================================================== */

function appearanceScore(
    group
){

    const values =
        group.map(
            p=>p.played
        );

    return (
        Math.max(...values)
        -
        Math.min(...values)
    ) * 150;

}

/* =====================================================
   Rest Balance
   ===================================================== */

function restScore(
    group
){

    const values =
        group.map(
            p=>p.rested
        );

    return (
        Math.max(...values)
        -
        Math.min(...values)
    ) * 80;

}

/* =====================================================
   Consecutive Penalty
   ===================================================== */

function consecutiveScore(
    group
){

    let score = 0;

    group.forEach(player=>{

        const diff =

            currentRound
            -
            player.lastMatchRound;

        if(diff <= 1){

            score += 1000;

        }

    });

    return score;

}

/* =====================================================
   Pair Restriction
   ===================================================== */

function pairScore(
    group
){

    const a = group[0];
    const b = group[1];

    const c = group[2];
    const d = group[3];

    const pair1 =
        a.partners[
            b.name
        ] || 0;

    const pair2 =
        c.partners[
            d.name
        ] || 0;

    let score = 0;

    score += pair1 * 5000;

    score += pair2 * 5000;

    return score;

}

/* =====================================================
   Opponent Penalty
   ===================================================== */

function opponentScore(
    group
){

    let score = 0;

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

            score +=

                (
                    group[i]
                    .opponents[
                        group[j].name
                    ]
                    || 0
                )

                * 100;

        }

    }

    return score;

}

/* =====================================================
   Mixed Priority
   ===================================================== */

function genderScore(
    group,
    options
){

    if(
        settings.genderMode !==
        "mixed"
    ){
        return 0;
    }

    const a = group[0];
    const b = group[1];

    const c = group[2];
    const d = group[3];

    let score = 0;

    const team1Mixed =

        a.gender !== "none" &&
        b.gender !== "none" &&
        a.gender !== b.gender;

    const team2Mixed =

        c.gender !== "none" &&
        d.gender !== "none" &&
        c.gender !== d.gender;

    if(!team1Mixed){

        score +=
            options.mixedStrict
            ? 1500
            : 500;

    }

    if(!team2Mixed){

        score +=
            options.mixedStrict
            ? 1500
            : 500;

    }

    return score;

}

/* =====================================================
   Level Score
   ===================================================== */

function levelScore(
    group,
    options
){

    if(
        settings.levelMode ===
        "random"
    ){
        return 0;
    }

    const a = group[0];
    const b = group[1];

    const c = group[2];
    const d = group[3];

    if(
        settings.levelMode ===
        "balance"
    ){

        const teamA =
            a.level +
            b.level;

        const teamB =
            c.level +
            d.level;

        return (
            Math.abs(
                teamA - teamB
            )
            * 200
        );

    }

    if(
        settings.levelMode ===
        "unified"
    ){

        const groups = [

            getLevelGroup(
                a.level
            ),

            getLevelGroup(
                b.level
            ),

            getLevelGroup(
                c.level
            ),

            getLevelGroup(
                d.level
            )

        ];

        const diff =

            Math.max(
                ...groups
            )

            -

            Math.min(
                ...groups
            );

        if(
            options.levelStrict
        ){

            return diff * 2000;

        }

        return diff * 500;

    }

    return 0;

}

/* =====================================================
   Build Match
   ===================================================== */

function buildMatch(
    group
){

    return {

        id:
            matchId++,

        round:
            currentRound,

        status:
            "waiting",

        teamA:[
            group[0].name,
            group[1].name
        ],

        teamB:[
            group[2].name,
            group[3].name
        ]

    };

}

/* =====================================================
   Court Initialize
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

            courtNo:i+1,

            match:
                waitingMatches.shift()

        });

    }

}
/* =====================================================
   Badminton Doubles Manager v6
   Complete Edition
   Part 5 / 5
   Match Progress / Render / Export
   ===================================================== */

/* =====================================================
   Statistics Update
   ===================================================== */

function updateMatchStatistics(match){

    const playersInMatch = [

        ...match.teamA,

        ...match.teamB

    ];

    players.forEach(player => {

        if(
            playersInMatch.includes(
                player.name
            )
        ){

            player.played++;

            player.lastMatchRound =
                currentRound;

        }

    });

    addPartner(
        match.teamA[0],
        match.teamA[1]
    );

    addPartner(
        match.teamB[0],
        match.teamB[1]
    );

    match.teamA.forEach(a => {

        match.teamB.forEach(b => {

            addOpponent(a,b);

        });

    });

    updateRestCount();

}

function updateRestCount(){

    const maxPlayed =

        Math.max(
            ...players.map(
                p => p.played
            )
        );

    players.forEach(player => {

        player.rested =

            maxPlayed
            -
            player.played;

    });

}

function addPartner(a,b){

    const p1 =
        findPlayer(a);

    const p2 =
        findPlayer(b);

    if(
        !p1 ||
        !p2
    ){
        return;
    }

    p1.partners[b] =
        (p1.partners[b] || 0)
        + 1;

    p2.partners[a] =
        (p2.partners[a] || 0)
        + 1;

}

function addOpponent(a,b){

    const p1 =
        findPlayer(a);

    const p2 =
        findPlayer(b);

    if(
        !p1 ||
        !p2
    ){
        return;
    }

    p1.opponents[b] =
        (p1.opponents[b] || 0)
        + 1;

    p2.opponents[a] =
        (p2.opponents[a] || 0)
        + 1;

}

/* =====================================================
   Match Finish
   ===================================================== */

async function finishMatch(
    courtIndex
){

    const court =
        activeCourts[courtIndex];

    if(
        !court ||
        !court.match
    ){
        return;
    }

    currentRound++;

    updateMatchStatistics(
        court.match
    );

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

    }
    else{

        const allFinished =

            activeCourts.every(
                court =>
                !court.match
            );

        if(allFinished){

            assignBulkMatches();

        }

    }

    saveData();

    renderAll();

    renderStats();

}

/* =====================================================
   Busy Players
   ===================================================== */

function getBusyPlayers(){

    const busy = [];

    activeCourts.forEach(court => {

        if(!court.match){
            return;
        }

        busy.push(
            ...court.match.teamA,
            ...court.match.teamB
        );

    });

    return busy;

}

/* =====================================================
   Single Progress
   ===================================================== */

function assignSingleMatch(
    courtIndex
){

    if(
        waitingMatches.length === 0
    ){
        return;
    }

    activeCourts[courtIndex]
        .match =
        waitingMatches.shift();

}

/* =====================================================
   Bulk Progress
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
   Reset
   ===================================================== */

async function resetAll(){

    const result =

        await showConfirm(
            "対戦表をリセットしますか？"
        );

    if(!result){
        return;
    }

    waitingMatches = [];

    activeCourts = [];

    finishedMatches = [];

    currentRound = 0;

    matchId = 1;

    resetPlayerStats();

    saveData();

    renderAll();

    renderStats();

}

async function regenerateSchedule(){

    const result =

        await showConfirm(
            "対戦表を再生成しますか？"
        );

    if(!result){
        return;
    }

    generateSchedule();

}

/* =====================================================
   Remaining Count
   ===================================================== */

function renderRemainingCount(){

    const target =

        document.getElementById(
            "remainingCount"
        );

    if(!target){
        return;
    }

    target.textContent =

        waitingMatches.length

        +

        activeCourts.filter(
            c => c.match
        ).length;

}

/* =====================================================
   Render
   ===================================================== */

function renderAll(){

    renderRemainingCount();

    renderCourts();

    renderWaitingMatches();

    renderFinishedMatches();

}

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
        (court,index) => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "court-card";

            if(!court.match){

                div.innerHTML = `
                    <div class="court-title">
                        コート ${court.courtNo}
                    </div>
                    <div>
                        空きコート
                    </div>
                `;

                area.appendChild(div);

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

                    <span>
                        VS
                    </span>

                    <span>
                        ${court.match.teamB.join("/")}
                    </span>

                    <button
                        class="finish-btn-small"
                        onclick="
                        finishMatch(
                            ${index}
                        )
                        "
                    >
                        終了
                    </button>

                </div>
            `;

            area.appendChild(div);

        }
    );

}

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

            area.appendChild(div);

        }
    );

}

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

            area.appendChild(div);

        });

}

/* =====================================================
   Statistics
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

    players.forEach(player => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "stat-card";

        div.innerHTML = `

            <div class="stat-name">
                ${player.name}
            </div>

            <div class="stat-row">
                <span>
                    出場:
                    ${player.played}
                </span>

                <span>
                    休憩:
                    ${player.rested}
                </span>
            </div>

        `;

        area.appendChild(div);

    });

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

                `${match.id},"${match.teamA.join("/")}",`

                +

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
   Auto Save
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
   Global Access
   ===================================================== */

window.finishMatch =
    finishMatch;

/* =====================================================
   End
   ===================================================== */
   