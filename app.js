/********************************************
 * ダブルス対戦管理
 * app.js Part1
 ********************************************/

let deferredPrompt = null;

/********************************************
 * データ
 ********************************************/

const STORAGE_KEY = "doublesManagerData";

let appData = {

    players: [],

    settings: {

        autoSave: "on",

        extensionMode: "none",

        courtCount: 1,

        matchLimit: 30,

        matchMode: "bulk",

        darkMode: false

    },

    fixtures: [],

    waitingMatches: [],

    activeMatches: [],

    finishedMatches: [],

    generatedMatchCount: 0,

    currentMatchNumber: 1

};

/********************************************
 * 共通取得
 ********************************************/

function $(id){

    return document.getElementById(id);

}

/********************************************
 * タブ切替
 ********************************************/

document.querySelectorAll(".tab").forEach(btn=>{

    btn.addEventListener("click",()=>{

        document
        .querySelectorAll(".tab")
        .forEach(tab=>tab.classList.remove("active"));

        document
        .querySelectorAll(".tab-content")
        .forEach(tab=>tab.classList.remove("active"));

        btn.classList.add("active");

        $(btn.dataset.tab)
        .classList.add("active");

    });

});

/********************************************
 * 自動保存
 ********************************************/

function saveData(){

    if(
        appData.settings.autoSave !== "on"
    ){
        return;
    }

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(appData)

    );

}

/********************************************
 * 復元
 ********************************************/

function loadData(){

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if(!saved){
        return;
    }

    try{

        appData = JSON.parse(saved);

    }catch(error){

        console.error(error);

    }

}

/********************************************
 * ダークモード
 ********************************************/

function applyDarkMode(){

    if(appData.settings.darkMode){

        document.body.classList.add("dark");

    }else{

        document.body.classList.remove("dark");

    }

}

/********************************************
 * プレイヤーID生成
 ********************************************/

function createPlayer(name){

    return {

        id: Date.now() +
            Math.floor(Math.random()*10000),

        name: name,

        gender: "-",

        level: 2,

        matches: 0,

        rests: 0,

        consecutiveMatches: 0,

        partnerHistory: {},

        opponentHistory: {}

    };

}

/********************************************
 * プレイヤー一覧描画
 ********************************************/

function renderPlayers(){

    const area = $("playerList");

    area.innerHTML = "";

    const showLevel =

        appData.settings.extensionMode ===
        "level-balance"

        ||

        appData.settings.extensionMode ===
        "level-unify";

    appData.players.forEach(player=>{

        const row =
            document.createElement("div");

        row.className =
            "player-row";

        let levelHtml = "";

        if(showLevel){

            levelHtml = `

            <select
                class="player-level"
                data-player="${player.id}"
            >

                <option value="1"
                ${player.level===1?"selected":""}>
                ★☆☆☆☆
                </option>

                <option value="2"
                ${player.level===2?"selected":""}>
                ★★☆☆☆
                </option>

                <option value="3"
                ${player.level===3?"selected":""}>
                ★★★☆☆
                </option>

                <option value="4"
                ${player.level===4?"selected":""}>
                ★★★★☆
                </option>

                <option value="5"
                ${player.level===5?"selected":""}>
                ★★★★★
                </option>

            </select>

            `;

        }

        row.innerHTML = `

        <span class="player-name">

            ${player.name}

        </span>

        <select
            class="player-gender"
            data-player="${player.id}">

            <option
                value="-"
                ${player.gender==="-"?"selected":""}>
                -
            </option>

            <option
                value="男"
                ${player.gender==="男"?"selected":""}>
                男
            </option>

            <option
                value="女"
                ${player.gender==="女"?"selected":""}>
                女
            </option>

        </select>

        ${levelHtml}

        <button
            class="delete-player"
            data-player="${player.id}">

            🗑

        </button>

        `;

        area.appendChild(row);

    });

    $("playerCount").textContent =
        appData.players.length;

    saveData();

}

/********************************************
 * コート選択生成
 ********************************************/

function updateCourtOptions(){

    const playerCount =
        appData.players.length;

    const select =
        $("courtCount");

    const currentValue =
        Number(select.value || 1);

    select.innerHTML = "";

    const maxCourt =
        Math.floor(playerCount / 4);

    if(maxCourt <= 0){

        const option =
            document.createElement("option");

        option.value = "";

        option.textContent = "-";

        select.appendChild(option);

        $("courtInfo").innerHTML =
        "参加者が4人未満のため対戦生成できません";

        return;

    }

    for(
        let i=1;
        i<=maxCourt;
        i++
    ){

        const option =
            document.createElement("option");

        option.value = i;

        option.textContent =
            `${i}面（${i*4}人以上）`;

        select.appendChild(option);

    }

    if(currentValue <= maxCourt){

        select.value = currentValue;

    }

    appData.settings.courtCount =
        Number(select.value);

    updateCourtInfo();
}

/********************************************
 * コート情報
 ********************************************/

function updateCourtInfo(){

    const players =
        appData.players.length;

    const courts =
        Number(
            $("courtCount").value || 1
        );

    const minPlayers =
        courts * 4;

    const individualNeed =
        courts * 6;

    let html = `
    最低必要人数：${minPlayers}人<br>
    個別進行必要人数：${individualNeed}人<br>
    現在参加者数：${players}人
    `;

    if(players >= individualNeed){

        html +=
        "<br>✓ 個別進行利用可能";

        $("matchMode")
        .querySelector(
            'option[value="individual"]'
        )
        .disabled = false;

    }else{

        html +=
        `<br>⚠ 個別進行はあと
        ${individualNeed - players}
        人必要です`;

        const individual =
            $("matchMode")
            .querySelector(
                'option[value="individual"]'
            );

        individual.disabled = true;

        if(
            $("matchMode").value ===
            "individual"
        ){

            $("matchMode").value = "bulk";

        }

    }

    $("courtInfo").innerHTML = html;

    saveData();

}

/********************************************
 * 参加者追加
 ********************************************/

$("addNumberPlayersBtn")
.addEventListener("click",()=>{

    const count = Number(
        $("numberPlayerCount").value
    );

    if(!count || count <= 0){

        return;
    }

    for(let i=1;i<=count;i++){

        appData.players.push(

            createPlayer(String(i))

        );

    }

    $("numberPlayerCount").value="";

    renderPlayers();

    updateCourtOptions();

});

/********************************************
 * 名前登録
 ********************************************/

$("addNamePlayersBtn")
.addEventListener("click",()=>{

    const txt =
        $("playerNames").value.trim();

    if(!txt){

        return;
    }

    const names =
        txt.split(/[\n,\s]+/)
        .filter(x=>x);

    names.forEach(name=>{

        appData.players.push(

            createPlayer(name)

        );

    });

    $("playerNames").value = "";

    renderPlayers();

    updateCourtOptions();

});

/********************************************
 * 表示切替
 ********************************************/

$("togglePlayerListBtn")
.addEventListener("click",()=>{

    const area =
        $("playerArea");

    area.classList.toggle("hidden");

    $("togglePlayerListBtn")
    .textContent =

        area.classList.contains("hidden")

        ?

        "▼参加者表示"

        :

        "▲参加者非表示";

});

/********************************************
 * 性別変更
 ********************************************/

document.addEventListener("change",e=>{

    if(
        e.target.classList.contains(
            "player-gender"
        )
    ){

        const id =
            Number(
                e.target.dataset.player
            );

        const player =
            appData.players.find(
                p=>p.id === id
            );

        if(player){

            player.gender =
                e.target.value;

            saveData();

        }

    }

});

/********************************************
 * レベル変更
 ********************************************/

document.addEventListener("change",e=>{

    if(
        e.target.classList.contains(
            "player-level"
        )
    ){

        const id =
            Number(
                e.target.dataset.player
            );

        const player =
            appData.players.find(
                p=>p.id === id
            );

        if(player){

            player.level =
                Number(e.target.value);

            saveData();

        }

    }

});
/********************************************
 * 個別削除
 ********************************************/

document.addEventListener("click",e=>{

    if(
        e.target.classList.contains(
            "delete-player"
        )
    ){

        const id =
            Number(
                e.target.dataset.player
            );

        const player =
            appData.players.find(
                p=>p.id === id
            );

        if(!player){
            return;
        }

        const result = confirm(
            `${player.name}を削除してよろしいですか？`
        );

        if(!result){
            return;
        }

        appData.players =
            appData.players.filter(
                p=>p.id !== id
            );

        renderPlayers();

        updateCourtOptions();

        saveData();

    }

});

/********************************************
 * 一括削除
 ********************************************/

$("deleteAllPlayersBtn")
.addEventListener("click",()=>{

    if(
        !confirm(
            "参加者を全て削除してよろしいですか？"
        )
    ){
        return;
    }

    appData.players = [];

    renderPlayers();

    updateCourtOptions();

    saveData();

});

/********************************************
 * 拡張機能切替
 ********************************************/

$("extensionMode")
.addEventListener("change",()=>{

    appData.settings.extensionMode =

        $("extensionMode").value;

    const mode =
        appData.settings.extensionMode;

    let message = "";

    switch(mode){

        case "level-balance":

            message =
            "レベル均等モード：強い選手と弱い選手を組ませることを優先します";

            break;

        case "level-unify":

            message =
            "レベル統一モード：近いレベル同士でペアを作ることを優先します";

            break;

        case "mix":

            message =
            "ミックス優先モード：男女ペアを優先します";

            break;

        default:

            message =
            "通常モード";

    }

    $("extensionInfo").innerHTML =
        message;

    renderPlayers();

    saveData();

});

/********************************************
 * 自動保存設定
 ********************************************/

$("autoSave")
.addEventListener("change",()=>{

    appData.settings.autoSave =
        $("autoSave").value;

    saveData();

});

/********************************************
 * コート変更
 ********************************************/

$("courtCount")
.addEventListener("change",()=>{

    appData.settings.courtCount =
        Number(
            $("courtCount").value
        );

    updateCourtInfo();

    saveData();

});

/********************************************
 * 試合数変更
 ********************************************/

$("matchLimit")
.addEventListener("change",()=>{

    const value =
        $("matchLimit").value.trim();

    appData.settings.matchLimit =
        value === ""
        ? null
        : Number(value);

    saveData();

});

/********************************************
 * 進行方式変更
 ********************************************/

$("matchMode")
.addEventListener("change",()=>{

    appData.settings.matchMode =

        $("matchMode").value;

    saveData();

});

/********************************************
 * ダークモード
 ********************************************/

$("darkModeBtn")
.addEventListener("click",()=>{

    appData.settings.darkMode =

        !appData.settings.darkMode;

    applyDarkMode();

    saveData();

});

/********************************************
 * PWA
 ********************************************/

window.addEventListener(
    "beforeinstallprompt",
    event=>{

        event.preventDefault();

        deferredPrompt = event;

        $("installBtn").style.display =
            "block";

    }
);

$("installBtn")
.addEventListener("click",async()=>{

    if(!deferredPrompt){
        return;
    }

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;

});

/********************************************
 * 試合データリセット
 ********************************************/

function clearMatchData(){

    appData.fixtures = [];

    appData.waitingMatches = [];

    appData.activeMatches = [];

    appData.finishedMatches = [];

    appData.generatedMatchCount = 0;

    appData.currentMatchNumber = 1;

    appData.players.forEach(player=>{

        player.matches = 0;

        player.rests = 0;

        player.consecutiveMatches = 0;

        player.partnerHistory = {};

        player.opponentHistory = {};

    });

}

/********************************************
 * 対戦表リセット
 ********************************************/

$("resetFixtureBtn")
.addEventListener("click",()=>{

    if(
        !confirm(
            "対戦表を削除してよろしいですか？"
        )
    ){
        return;
    }

    clearMatchData();

    renderMatchArea();

    saveData();

});

/********************************************
 * 履歴クリア
 ********************************************/

$("clearFinishedBtn")
.addEventListener("click",()=>{

    if(
        !confirm(
            "終了試合履歴を削除してよろしいですか？"
        )
    ){
        return;
    }

    appData.finishedMatches = [];

    renderFinishedMatches();

    saveData();

});

/********************************************
 * 終了試合展開
 ********************************************/

$("toggleFinishedBtn")
.addEventListener("click",()=>{

    const area =
        $("finishedMatchList");

    area.classList.toggle(
        "hidden"
    );

    $("toggleFinishedBtn")
    .textContent =

        area.classList.contains(
            "hidden"
        )

        ?

        "▼展開"

        :

        "▲閉じる";

});

/********************************************
 * 設定反映
 ********************************************/

function applySettings(){

    $("autoSave").value =

        appData.settings.autoSave;

    $("extensionMode").value =

        appData.settings.extensionMode;

    $("matchMode").value =

        appData.settings.matchMode;

    $("matchLimit").value =

        appData.settings.matchLimit
        ?? "";

    applyDarkMode();

    const mode =
        appData.settings.extensionMode;

    let message = "";

    switch(mode){

        case "level-balance":

            message =
            "レベル均等モード：強い選手と弱い選手を組ませることを優先します";

            break;

        case "level-unify":

            message =
            "レベル統一モード：近いレベル同士でペアを作ることを優先します";

            break;

        case "mix":

            message =
            "ミックス優先モード：男女ペアを優先します";

            break;

        default:

            message =
            "通常モード";

    }

    $("extensionInfo").innerHTML =
        message;

}

/********************************************
 * レンダリング入口
 ********************************************/

function renderAll(){

    renderPlayers();

    updateCourtOptions();

    applySettings();

}

/********************************************
 * ページ離脱
 ********************************************/

window.addEventListener(
    "beforeunload",
    ()=>{

        if(
            appData.settings.autoSave
            === "off"
        ){

            localStorage.removeItem(
                STORAGE_KEY
            );

        }

    }
);

/********************************************
 * 初期化
 ********************************************/

loadData();

renderAll();

if("serviceWorker" in navigator){

    navigator.serviceWorker
    .register(
        "./service-worker.js"
    );

}
/********************************************
 * スコアリング定数
 ********************************************/

const SCORE = {

    SAME_PAIR_CONSECUTIVE: -10000,

    SAME_MATCH_CONSECUTIVE: -8000,

    MIX_PAIR: 1000,

    SAME_GENDER_PAIR: -300

};

/********************************************
 * 候補生成回数
 ********************************************/

function getCandidateCount(){

    const count =
        appData.players.length;

    if(count <= 16){

        return 500;

    }

    if(count <= 24){

        return 1000;

    }

    if(count <= 40){

        return 1500;

    }

    return 2000;

}

/********************************************
 * ユーティリティ
 ********************************************/

function shuffle(array){

    const arr = [...array];

    for(
        let i = arr.length - 1;
        i > 0;
        i--
    ){

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [arr[i], arr[j]] =
        [arr[j], arr[i]];

    }

    return arr;

}

/********************************************
 * レベル平均
 ********************************************/

function getLevelAverage(team){

    const total =
        team.reduce(
            (sum,p)=>
                sum + p.level,
            0
        );

    return total / team.length;

}

/********************************************
 * レベル均等評価
 ********************************************/

function evaluateLevelBalance(

    teamA,
    teamB

){

    const avgA =
        getLevelAverage(teamA);

    const avgB =
        getLevelAverage(teamB);

    const averageDiff =
        Math.abs(avgA - avgB);

    let score =

        (10 - averageDiff) * 100;

    const pairGapA =
        Math.abs(
            teamA[0].level -
            teamA[1].level
        );

    const pairGapB =
        Math.abs(
            teamB[0].level -
            teamB[1].level
        );

    score += pairGapA * 80;

    score += pairGapB * 80;

    return score;

}

/********************************************
 * レベル統一評価
 ********************************************/

function evaluateLevelUnify(

    teamA,
    teamB

){

    const pairGapA =
        Math.abs(
            teamA[0].level -
            teamA[1].level
        );

    const pairGapB =
        Math.abs(
            teamB[0].level -
            teamB[1].level
        );

    return (

        (5 - pairGapA) * 120 +

        (5 - pairGapB) * 120

    );

}

/********************************************
 * ミックス評価
 ********************************************/

function evaluateMix(

    teamA,
    teamB

){

    let score = 0;

    const teams = [
        teamA,
        teamB
    ];

    teams.forEach(team=>{

        const genders =
            team.map(
                p=>p.gender
            );

        const male =
            genders.includes("男");

        const female =
            genders.includes("女");

        if(
            male &&
            female
        ){

            score +=
                SCORE.MIX_PAIR;

        }else{

            score +=
                SCORE.SAME_GENDER_PAIR;

        }

    });

    return score;

}

/********************************************
 * ペア履歴
 ********************************************/

function getPairCount(

    playerA,
    playerB

){

    return (
        playerA.partnerHistory[
          playerB.id
        ] || 0
    );

}

/********************************************
 * 対戦履歴
 ********************************************/

function getOpponentCount(

    playerA,
    playerB

){

    return (

        playerA.opponentHistory[
            playerB.id
        ] || 0

    );

}

/********************************************
 * 同ペア評価
 ********************************************/

function evaluatePairHistory(

    playerA,
    playerB

){

    const count =
        getPairCount(
            playerA,
            playerB
        );

    switch(count){

        case 0:
            return 300;

        case 1:
            return 150;

        case 2:
            return 0;

        case 3:
            return -150;

        case 4:
            return -300;

        default:
            return -500;

    }

}

/********************************************
 * 同対戦評価
 ********************************************/

function evaluateOpponentHistory(

    teamA,
    teamB

){

    let score = 0;

    teamA.forEach(a=>{

        teamB.forEach(b=>{

            const count =
                getOpponentCount(
                    a,b
                );

            switch(count){

                case 0:
                    score += 200;
                    break;

                case 1:
                    score += 100;
                    break;

                case 2:
                    break;

                case 3:
                    score -= 100;
                    break;

                case 4:
                    score -= 200;
                    break;

                default:
                    score -= 300;

            }

        });

    });

    return score;

}

/********************************************
 * 連続出場評価
 ********************************************/

function evaluateConsecutive(

    teamA,
    teamB

){

    const players = [

        ...teamA,
        ...teamB

    ];

    let score = 0;

    players.forEach(player=>{

        const count =
            player.consecutiveMatches;

        if(count === 0){

            score += 200;

        }else if(
            count === 1
        ){

            score += 100;

        }else if(
            count === 2
        ){

            score -= 100;

        }else{

            score -= 200;

        }

    });

    return score;

}

/********************************************
 * 出場回数均等化
 ********************************************/

function evaluateMatchBalance(

    teamA,
    teamB

){

    const players = [

        ...teamA,
        ...teamB

    ];

    const minMatch =
        Math.min(
            ...appData.players.map(
                p=>p.matches
            )
        );

    let score = 0;

    players.forEach(player=>{

        score +=

            (
                minMatch +
                5 -
                player.matches
            ) * 50;

    });

    return score;

}

/********************************************
 * 休憩均等化
 ********************************************/

function evaluateRestBalance(

    teamA,
    teamB

){

    const players = [

        ...teamA,
        ...teamB

    ];

    const maxRest =
        Math.max(
            ...appData.players.map(
                p=>p.rests
            )
        );

    let score = 0;

    players.forEach(player=>{

        score +=

            (
                maxRest -
                player.rests
            ) * 50;

    });

    return score;

}

/********************************************
 * 総合評価
 ********************************************/

function calculateMatchScore(

    teamA,
    teamB,

    relaxLevel = 0

){

    let score = 0;

    score +=
    evaluateConsecutive(
        teamA,
        teamB
    );

    score +=
    evaluateMatchBalance(
        teamA,
        teamB
    );

    score +=
    evaluateRestBalance(
        teamA,
        teamB
    );

    if(relaxLevel < 2){

        score +=
        evaluatePairHistory(
            teamA[0],
            teamA[1]
        );

        score +=
        evaluatePairHistory(
            teamB[0],
            teamB[1]
        );

    }

    if(relaxLevel < 1){

        score +=
        evaluateOpponentHistory(
            teamA,
            teamB
        );

    }

    switch(
        appData.settings.extensionMode
    ){

        case "level-balance":

            score +=
            evaluateLevelBalance(
                teamA,
                teamB
            );

            break;

        case "level-unify":

            score +=
            evaluateLevelUnify(
                teamA,
                teamB
            );

            break;

        case "mix":

            score +=
            evaluateMix(
                teamA,
                teamB
            );

            break;

    }

    return score;

}
/********************************************
 * 直前試合取得
 ********************************************/

function getLastMatch(){

    if(
        appData.fixtures.length === 0
    ){
        return null;
    }

    return appData.fixtures[
        appData.fixtures.length - 1
    ];

}

/********************************************
 * 同一ペア連続判定
 ********************************************/

function isSamePairConsecutive(
    teamA,
    teamB
){

    const lastMatch =
        getLastMatch();

    if(!lastMatch){
        return false;
    }

    const currentPairs = [

        [
            teamA[0].id,
            teamA[1].id
        ].sort().join("-"),

        [
            teamB[0].id,
            teamB[1].id
        ].sort().join("-")

    ];

    return currentPairs.some(pair=>

        lastMatch.pairs.includes(pair)

    );

}

/********************************************
 * 同一対戦連続判定
 ********************************************/

function isSameMatchConsecutive(
    teamA,
    teamB
){

    const lastMatch =
        getLastMatch();

    if(!lastMatch){
        return false;
    }

    const currentMatch = [

        [teamA[0].id,teamA[1].id]
        .sort()
        .join("-"),

        [teamB[0].id,teamB[1].id]
        .sort()
        .join("-")

    ]
    .sort()
    .join("|");

    return (
        currentMatch ===
        lastMatch.matchKey
    );

}

/********************************************
 * 休憩選出
 ********************************************/

function selectRestPlayers(
    availablePlayers,
    restCount
){

    const copy = [...availablePlayers];

    copy.sort((a,b)=>{

        if(
            a.matches !==
            b.matches
        ){
            return (
                b.matches -
                a.matches
            );
        }

        if(
            a.rests !==
            b.rests
        ){
            return (
                a.rests -
                b.rests
            );
        }

        return (
            b.consecutiveMatches -
            a.consecutiveMatches
        );

    });

    const rests =
        copy.slice(
            0,
            restCount
        );

    rests.forEach(player=>{

        player.rests++;

        player.consecutiveMatches = 0;

    });

    return rests;

}

/********************************************
 * 対戦候補生成
 ********************************************/

function buildCandidateMatch(
    players,
    relaxLevel
){

    const shuffled =
        shuffle(players);

    const teamA = [

        shuffled[0],
        shuffled[1]

    ];

    const teamB = [

        shuffled[2],
        shuffled[3]

    ];

    let score =
        calculateMatchScore(
            teamA,
            teamB,
            relaxLevel
        );

    if(

        isSamePairConsecutive(
            teamA,
            teamB
        )

    ){

        score +=
            SCORE.SAME_PAIR_CONSECUTIVE;

    }

    if(

        isSameMatchConsecutive(
            teamA,
            teamB
        )

    ){

        score +=
            SCORE.SAME_MATCH_CONSECUTIVE;

    }

    return {

        teamA,
        teamB,
        score

    };

}

/********************************************
 * ベスト試合生成
 ********************************************/

function createBestMatch(
    players,
    relaxLevel
){

    const count =
        getCandidateCount();

    let bestMatch = null;

    let bestScore =
        Number.NEGATIVE_INFINITY;

    for(
        let i=0;
        i<count;
        i++
    ){

        const candidate =
            buildCandidateMatch(
                players,
                relaxLevel
            );

        if(
            candidate.score >
            bestScore
        ){

            bestScore =
                candidate.score;

            bestMatch =
                candidate;
        }

    }

    return bestMatch;

}

/********************************************
 * 履歴記録
 ********************************************/

function recordMatchHistory(
    teamA,
    teamB
){

    const players = [

        ...teamA,
        ...teamB

    ];

    players.forEach(player=>{

        player.matches++;

        player.consecutiveMatches++;

    });

    function addPartner(a,b){

        if(
            !a.partnerHistory[b.id]
        ){

            a.partnerHistory[b.id] = 0;

        }

        a.partnerHistory[b.id]++;

    }

    addPartner(
        teamA[0],
        teamA[1]
    );

    addPartner(
        teamA[1],
        teamA[0]
    );

    addPartner(
        teamB[0],
        teamB[1]
    );

    addPartner(
        teamB[1],
        teamB[0]
    );

    teamA.forEach(a=>{

        teamB.forEach(b=>{

            if(
                !a.opponentHistory[
                    b.id
                ]
            ){

                a.opponentHistory[
                    b.id
                ] = 0;

            }

            if(
                !b.opponentHistory[
                    a.id
                ]
            ){

                b.opponentHistory[
                    a.id
                ] = 0;

            }

            a.opponentHistory[
                b.id
            ]++;

            b.opponentHistory[
                a.id
            ]++;

        });

    });

}

/********************************************
 * 試合作成
 ********************************************/

function createMatchObject(
    teamA,
    teamB
){

    const pair1 = [

        teamA[0].id,
        teamA[1].id

    ]
    .sort()
    .join("-");

    const pair2 = [

        teamB[0].id,
        teamB[1].id

    ]
    .sort()
    .join("-");

    return {

        matchNumber:
            appData.currentMatchNumber++,

        teamA:

            `${teamA[0].name}/${teamA[1].name}`,

        teamB:

            `${teamB[0].name}/${teamB[1].name}`,

        pairA:
            pair1,

        pairB:
            pair2,

        pairs: [
            pair1,
            pair2
        ],

        matchKey:

            [pair1,pair2]
            .sort()
            .join("|")

    };

}

/********************************************
 * 条件緩和付き生成
 ********************************************/

function createMatchWithRelaxation(
    players
){

    for(
        let relaxLevel=0;
        relaxLevel<=5;
        relaxLevel++
    ){

        const result =
            createBestMatch(
                players,
                relaxLevel
            );

        if(result){

            return result;

        }

    }

    return null;

}

/********************************************
 * 一括進行生成
 ********************************************/

function generateBulkFixtures(){

    clearMatchData();

    const playerCount =
        appData.players.length;

    const courts =
        appData.settings.courtCount;

    const playersPerRound =
        courts * 4;

    const matchLimit =
        appData.settings.matchLimit;

    let round = 0;

    while(true){

        if(

            matchLimit &&
            appData.fixtures.length
            >= matchLimit

        ){
            break;
        }

        if(
            playerCount < 4
        ){
            break;
        }

        const players =
            [...appData.players];

        const restCount =

            Math.max(
                0,
                playerCount -
                playersPerRound
            );

        const rests =
            selectRestPlayers(
                players,
                restCount
            );

        const restIds =
            rests.map(
                p=>p.id
            );

        const available =
            players.filter(
                p=>
                !restIds.includes(
                    p.id
                )
            );

        let used = [];

        let created =
            false;

        for(
            let c=0;
            c<courts;
            c++
        ){

            const remain =
                available.filter(
                    p=>
                    !used.includes(
                        p.id
                    )
                );

            if(
                remain.length < 4
            ){
                break;
            }

            const match =
                createMatchWithRelaxation(
                    remain
                );

            if(!match){
                continue;
            }

            created = true;

            used.push(
                match.teamA[0].id,
                match.teamA[1].id,
                match.teamB[0].id,
                match.teamB[1].id
            );

            recordMatchHistory(
                match.teamA,
                match.teamB
            );

            const matchObj =
                createMatchObject(
                    match.teamA,
                    match.teamB
                );

            appData.fixtures.push(
                matchObj
            );

        }

        if(!created){
            break;
        }

        round++;

        if(
            round > 5000
        ){
            break;
        }

        if(
            !matchLimit &&
            round > 1000
        ){
            break;
        }

    }

}

/********************************************
 * 対戦表生成ボタン
 ********************************************/

$("generateFixtureBtn")
.addEventListener("click",()=>{

    if(
        appData.players.length < 4
    ){

        alert(
          "参加者は4人以上必要です"
        );

        return;
    }

    if(
        appData.settings.matchMode
        === "bulk"
    ){

        generateBulkFixtures();

    }

    appData.waitingMatches =
        [...appData.fixtures];

    appData.generatedMatchCount =
        appData.fixtures.length;

    if(
        typeof renderMatchArea
        === "function"
    ){

        renderMatchArea();

    }

    saveData();

    alert(
        `${appData.fixtures.length}試合を生成しました`
    );

});
/********************************************
 * 試合描画
 ********************************************/

function renderMatchArea(){

    renderActiveMatches();

    renderWaitingMatches();

    renderFinishedMatches();

    $("generatedMatchCount").textContent =
        appData.generatedMatchCount;

    if(
        appData.settings.matchMode
        === "bulk"
    ){

        $("finishAllBtn").style.display =
            "block";

        $("waitingArea").style.display =
            "block";

    }else{

        $("finishAllBtn").style.display =
            "none";

        $("waitingArea").style.display =
            "none";

    }

}

/********************************************
 * 現在試合描画
 ********************************************/

function renderActiveMatches(){

    const area =
        $("activeCourtArea");

    area.innerHTML = "";

    appData.activeMatches
    .forEach(match=>{

        const row =
            document.createElement("div");

        row.className =
            "match-row";

        const buttonHtml =

            appData.settings.matchMode
            === "individual"

            ?

            `
            <button
                class="finish-court-btn primary"
                data-match="${match.matchNumber}">
                終了
            </button>
            `

            :

            "";

        row.innerHTML = `

        <div>

            <strong>
            コート${match.court}
            </strong>

        </div>

        <div
        style="
        display:flex;
        justify-content:space-between;
        gap:10px;
        align-items:center;
        ">

            <span>

            第${match.matchNumber}試合

            ${match.teamA}

            VS

            ${match.teamB}

            </span>

            ${buttonHtml}

        </div>

        `;

        area.appendChild(row);

    });

}

/********************************************
 * 待機試合描画
 ********************************************/

function renderWaitingMatches(){

    const area =
        $("waitingMatchList");

    area.innerHTML = "";

    appData.waitingMatches
    .forEach(match=>{

        const row =
            document.createElement("div");

        row.className =
            "match-row";

        row.innerHTML = `

        第${match.matchNumber}試合

        ${match.teamA}

        VS

        ${match.teamB}

        `;

        area.appendChild(row);

    });

}

/********************************************
 * 終了試合描画
 ********************************************/

function renderFinishedMatches(){

    const area =
        $("finishedMatchList");

    area.innerHTML = "";

    appData.finishedMatches
    .forEach(match=>{

        const row =
            document.createElement("div");

        row.className =
            "match-row";

        row.innerHTML = `

        第${match.matchNumber}試合

        ${match.teamA}

        VS

        ${match.teamB}

        `;

        area.appendChild(row);

    });

}

/********************************************
 * 一括進行開始
 ********************************************/

function startBulkMode(){

    const courts =
        appData.settings.courtCount;

    appData.activeMatches = [];

    for(
        let i=0;
        i<courts;
        i++
    ){

        if(
            appData.waitingMatches.length
            === 0
        ){
            break;
        }

        const match =
            appData.waitingMatches.shift();

        match.court = i + 1;

        appData.activeMatches.push(
            match
        );

    }

    renderMatchArea();

}

/********************************************
 * 全試合終了
 ********************************************/

$("finishAllBtn")
.addEventListener("click",()=>{

    appData.finishedMatches.push(

        ...appData.activeMatches

    );

    appData.activeMatches = [];

    const courts =
        appData.settings.courtCount;

    for(
        let i=0;
        i<courts;
        i++
    ){

        if(
            appData.waitingMatches.length
            === 0
        ){
            break;
        }

        const next =
            appData.waitingMatches.shift();

        next.court = i+1;

        appData.activeMatches.push(
            next
        );

    }

    renderMatchArea();

    saveData();

});

/********************************************
 * 個別進行
 ********************************************/

function startIndividualMode(){

    appData.activeMatches = [];

    const courts =
        appData.settings.courtCount;

    const players =
        [...appData.players];

    for(
        let i=0;
        i<courts;
        i++
    ){

        const remain =
            players.filter(
                p=>
                !p.inUse
            );

        if(
            remain.length < 4
        ){
            break;
        }

        const match =
            createMatchWithRelaxation(
                remain
            );

        if(!match){
            break;
        }

        const allPlayers = [

            ...match.teamA,
            ...match.teamB

        ];

        allPlayers.forEach(p=>{

            p.inUse = true;

        });

        const matchObj =
            createMatchObject(
                match.teamA,
                match.teamB
            );

        matchObj.court =
            i + 1;

        matchObj.playerIds =
            allPlayers.map(
                p=>p.id
            );

        appData.activeMatches.push(
            matchObj
        );

    }

    renderMatchArea();

}

/********************************************
 * 空きコート生成
 ********************************************/

function createNextIndividualMatch(
    courtNumber,
    previousPlayers
){

    const activeIds = [];

    appData.activeMatches
    .forEach(match=>{

        if(
            match.playerIds
        ){

            activeIds.push(
                ...match.playerIds
            );

        }

    });

    const candidatePlayers =

        appData.players.filter(

            player=>

            !activeIds.includes(
                player.id
            )

        );

    if(
        candidatePlayers.length < 4
    ){
        return null;
    }

    const result =
        createMatchWithRelaxation(
            candidatePlayers
        );

    if(!result){
        return null;
    }

    const playerIds = [

        ...result.teamA,
        ...result.teamB

    ]
    .map(p=>p.id);

    const matchObj =
        createMatchObject(
            result.teamA,
            result.teamB
        );

    matchObj.court =
        courtNumber;

    matchObj.playerIds =
        playerIds;

    return matchObj;

}

/********************************************
 * 個別終了
 ********************************************/

document.addEventListener(
    "click",
    e=>{

    if(
        !e.target.classList.contains(
            "finish-court-btn"
        )
    ){
        return;
    }

    const matchNumber =
        Number(
            e.target.dataset.match
        );

    const index =
        appData.activeMatches.findIndex(
            m=>
            m.matchNumber
            ===
            matchNumber
        );

    if(index < 0){
        return;
    }

    const finished =
        appData.activeMatches[index];

    appData.finishedMatches.push(
        finished
    );

    appData.activeMatches.splice(
        index,
        1
    );

    const nextMatch =
        createNextIndividualMatch(
            finished.court,
            finished.playerIds
        );

    if(nextMatch){

        appData.activeMatches.push(
            nextMatch
        );

    }

    renderMatchArea();

    saveData();

});

/********************************************
 * 生成後開始
 ********************************************/

function startMatchEngine(){

    if(
        appData.settings.matchMode
        === "bulk"
    ){

        startBulkMode();

    }else{

        startIndividualMode();

    }

    saveData();

}

/********************************************
 * 対戦表生成ボタン拡張
 ********************************************/

$("generateFixtureBtn")
.addEventListener("click",()=>{

    setTimeout(()=>{

        startMatchEngine();

    },100);

});
/********************************************
 * 待機優先選手抽出
 ********************************************/

function getWaitingPriorityPlayers(){

    const activeIds = [];

    appData.activeMatches.forEach(match=>{

        if(match.playerIds){

            activeIds.push(
                ...match.playerIds
            );

        }

    });

    return appData.players.filter(

        player=>

        !activeIds.includes(
            player.id
        )

    );

}

/********************************************
 * 待機優先個別生成
 ********************************************/

function createNextIndividualMatch(
    courtNumber,
    previousPlayers = []
){

    const activeIds = [];

    appData.activeMatches.forEach(match=>{

        if(match.playerIds){

            activeIds.push(
                ...match.playerIds
            );

        }

    });

    const waitingPlayers =

        appData.players.filter(

            p=>

            !activeIds.includes(
                p.id
            )

            &&

            !previousPlayers.includes(
                p.id
            )

        );

    /*
     * 優先①
     * 待機のみ
     */
    if(waitingPlayers.length >= 4){

        const result =
            createMatchWithRelaxation(
                waitingPlayers
            );

        if(result){

            const ids = [

                ...result.teamA,
                ...result.teamB

            ].map(p=>p.id);

            const obj =
                createMatchObject(
                    result.teamA,
                    result.teamB
                );

            obj.court = courtNumber;
            obj.playerIds = ids;

            return obj;

        }

    }

    /*
     * 優先②
     * 待機+直前終了
     */
    const candidates =

        appData.players.filter(

            p=>

            !activeIds.includes(
                p.id
            )

        );

    if(candidates.length < 4){

        return null;

    }

    const result =
        createMatchWithRelaxation(
            candidates
        );

    if(!result){

        return null;

    }

    const ids = [

        ...result.teamA,
        ...result.teamB

    ].map(p=>p.id);

    const obj =
        createMatchObject(
            result.teamA,
            result.teamB
        );

    obj.court = courtNumber;
    obj.playerIds = ids;

    return obj;

}

/********************************************
 * ミックス警告
 ********************************************/

function checkMixWarning(){

    if(
        appData.settings.extensionMode
        !== "mix"
    ){
        return;
    }

    const male =

        appData.players.filter(
            p=>p.gender==="男"
        ).length;

    const female =

        appData.players.filter(
            p=>p.gender==="女"
        ).length;

    if(
        male === 0 ||
        female === 0
    ){

        alert(
            "男女比の偏りによりミックスペアを十分に作成できない可能性があります"
        );

        return;
    }

    const ratio =

        Math.min(
            male,
            female
        )

        /

        Math.max(
            male,
            female
        );

    if(ratio <= 0.3){

        alert(
            "男女比の偏りによりミックスペアを十分に作成できない可能性があります"
        );

    }

}

/********************************************
 * 全組み合わせ終了判定
 ********************************************/

function canGenerateMoreMatches(){

    const playerCount =
        appData.players.length;

    if(playerCount < 4){

        return false;

    }

    return true;

}

/********************************************
 * 試合上限判定
 ********************************************/

function reachedMatchLimit(){

    if(
        appData.settings.matchLimit
        === null
    ){

        return false;

    }

    return (

        appData.generatedMatchCount
        >=
        appData.settings.matchLimit

    );

}

/********************************************
 * 個別終了処理上書き
 ********************************************/

document.addEventListener(
"click",
e=>{

    if(
        !e.target.classList.contains(
            "finish-court-btn"
        )
    ){
        return;
    }

    const matchNumber =
        Number(
            e.target.dataset.match
        );

    const index =
        appData.activeMatches.findIndex(
            x=>
            x.matchNumber
            ===
            matchNumber
        );

    if(index < 0){
        return;
    }

    const match =
        appData.activeMatches[index];

    appData.finishedMatches.push(
        match
    );

    appData.activeMatches.splice(
        index,
        1
    );

    if(
        reachedMatchLimit()
    ){

        renderMatchArea();

        saveData();

        alert(
            "作成試合数の上限に到達しました"
        );

        return;
    }

    const nextMatch =

        createNextIndividualMatch(
            match.court,
            match.playerIds
        );

    if(nextMatch){

        appData.activeMatches.push(
            nextMatch
        );

        appData.generatedMatchCount++;

    }else{

        if(
            appData.settings.matchLimit
            === null
        ){

            alert(
                "生成可能な対戦がなくなりました"
            );

        }

    }

    renderMatchArea();

    saveData();

});

/********************************************
 * 対戦表再設定
 ********************************************/

$("reGenerateBtn")
.addEventListener("click",()=>{

    if(
        !confirm(
            "対戦表を再生成しますか？"
        )
    ){

        return;

    }

    clearMatchData();

    $("generateFixtureBtn").click();

});

/********************************************
 * 一括進行開始補強
 ********************************************/

const originalStartBulkMode =
    startBulkMode;

startBulkMode = function(){

    originalStartBulkMode();

    appData.generatedMatchCount =
        appData.fixtures.length;

};

/********************************************
 * 個別進行開始補強
 ********************************************/

const originalStartIndividualMode =
    startIndividualMode;

startIndividualMode = function(){

    originalStartIndividualMode();

    appData.generatedMatchCount =
        appData.activeMatches.length;

};

/********************************************
 * 自動復元
 ********************************************/

window.addEventListener(
"load",
()=>{

    renderMatchArea();

});

/********************************************
 * 初回起動時ミックス確認
 ********************************************/

$("extensionMode")
.addEventListener(
"change",
()=>{

    setTimeout(

        checkMixWarning,

        100

    );

});

/********************************************
 * 最終起動処理
 ********************************************/

window.addEventListener(
"load",
()=>{

    checkMixWarning();

    renderPlayers();

    updateCourtOptions();

    renderMatchArea();

    applyDarkMode();

});

/********************************************
 * 完成
 ********************************************/
 