// ======================================
// ダブルス対戦管理 PWA
// app.js
// part1 / 7
// ======================================

const STORAGE_KEY = "doublesManagerData";

// ======================================
// アプリデータ
// ======================================

let appData = createDefaultData();

let lastMatchAnnouncements = [];

// ======================================
// デフォルトデータ
// ======================================

function createDefaultData() {

    return {

        participants: [],

        settings: {

            courtCount: 1,

            totalMatches: 30,

            playMode: "batch",

            voiceAnnouncements: false,

            optionMode: "-",

            autoSave: true,

            darkMode: false,

            extension: "-"
        },

        scoreSettings: {

            pairPenalty: 500,

            opponentPenalty: 300,

            playBalanceBonus: 100,

            consecutivePlayPenalty: 50,

            levelBonus: 100,

            mixBonus: 100,

            courtChangeBonus: 50,

            playCountGapThreshold: 5,

            searchCount: 1000
        },

        currentMatch: 0,

        matchTarget: 0,

        matchTargetIncrement: 0,

        continuationPromptHandledForTarget: 0,

        completedMatchesByCourt: [],

        currentRoundGenerated: false,

        courts: [],

        participantsHistory: {},

        pairHistory: {},

        opponentHistory: {},

        courtHistory: {},

        roundHistory: []

    };

}

// ======================================
// 初期化
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);

function initializeApp() {

    loadData();

    registerServiceWorker();

    initializeTabs();

    bindEvents();

    postInitialize();

    renderParticipantTable();

    updateParticipantSummary();

    updateCourtOptions();

    updateProgressControls();

}

// ======================================
// PWA
// ======================================

function registerServiceWorker() {

    if ("serviceWorker" in navigator) {

        let refreshing = false;

        navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => {
                if (refreshing) {
                    return;
                }

                refreshing = true;
                window.location.reload();
            }
        );

        navigator.serviceWorker
            .register(
                "./service-worker.js",
                { updateViaCache: "none" }
            )
            .then(registration => registration.update())
            .catch(console.error);

    }

}

// ======================================
// 保存
// ======================================

function saveData() {

    if (!appData.settings.autoSave) {
        return;
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );

}

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {

            appData =
                createDefaultData();

            return;
        }

        appData =
            JSON.parse(saved);

    }
    catch {

        appData =
            createDefaultData();

    }

}

// ======================================
// タブ
// ======================================

function initializeTabs() {

    const buttons =
        document.querySelectorAll(
            ".tab-button"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(b =>
                    b.classList.remove(
                        "active"
                    )
                );

                document
                    .querySelectorAll(
                        ".tab-content"
                    )
                    .forEach(tab =>
                        tab.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                document
                    .getElementById(
                        button.dataset.tab
                    )
                    .classList.add(
                        "active"
                    );

            }
        );

    });

}

// ======================================
// イベント登録
// ======================================

function bindEvents() {

    bindSettingEvents();

    bindMatchEvents();

    bindAdminEvents();

}

// ======================================
// 設定タブイベント
// ======================================

function bindSettingEvents() {

    const addNumberBtn =
        document.getElementById(
            "addNumberBtn"
        );

    const addNameBtn =
        document.getElementById(
            "addNameBtn"
        );

    const toggleParticipantBtn =
        document.getElementById(
            "toggleParticipantBtn"
        );

    const deleteAllBtn =
        document.getElementById(
            "deleteAllBtn"
        );

    const startMatchBtn =
        document.getElementById(
            "startMatchBtn"
        );

    const voiceAnnouncementsSelect =
        document.getElementById(
            "voiceAnnouncements"
        );

    if (addNumberBtn) {

        addNumberBtn.addEventListener(
            "click",
            addNumberPlayers
        );

    }

    if (addNameBtn) {

        addNameBtn.addEventListener(
            "click",
            addNamePlayers
        );

    }

    if (toggleParticipantBtn) {

        bindVisibilityOptions(
            toggleParticipantBtn,
            setParticipantListVisibility
        );

    }

    if (deleteAllBtn) {

        deleteAllBtn.addEventListener(
            "click",
            deleteAllParticipants
        );

    }

    if (startMatchBtn) {

        startMatchBtn.addEventListener(
            "click",
            startMatch
        );

    }

    if (voiceAnnouncementsSelect) {

        voiceAnnouncementsSelect.addEventListener(
            "change",
            function() {
                const enabled = this.value === "on";

                if (
                    enabled &&
                    (
                        !("speechSynthesis" in window) ||
                        typeof SpeechSynthesisUtterance === "undefined"
                    )
                ) {
                    this.value = "off";
                    alert("このブラウザーは音声読み上げに対応していません。");
                    return;
                }

                appData.settings.voiceAnnouncements = enabled;

                if (!enabled && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                }

                saveData();
            }
        );

    }

}

// ======================================
// 試合タブイベント
// ======================================

function bindMatchEvents() {

    const toggleBenchBtn =
        document.getElementById(
            "toggleBenchBtn"
        );

    const finishAllBtn =
        document.getElementById(
            "finishAllBtn"
        );

    const nextAllBtn =
        document.getElementById(
            "nextAllBtn"
        );

    const recallAnnouncementBtn =
        document.getElementById(
            "recallAnnouncementBtn"
        );

    if (toggleBenchBtn) {

        bindVisibilityOptions(
            toggleBenchBtn,
            setBenchVisibility
        );

    }

    if (finishAllBtn) {

        finishAllBtn.addEventListener(
            "click",
            finishAllMatches
        );

    }

    if (nextAllBtn) {

        nextAllBtn.addEventListener(
            "click",
            startNextRound
        );

    }

    if (recallAnnouncementBtn) {

        recallAnnouncementBtn.addEventListener(
            "click",
            recallLastAnnouncements
        );

    }

}

// ======================================
// 管理タブイベント
// ======================================

function bindAdminEvents() {

    const toggleScoreSettingsBtn =
        document.getElementById(
            "toggleScoreSettingsBtn"
        );

    const resetScoreBtn =
        document.getElementById(
            "resetScoreSettingBtn"
        );

    const darkModeBtn =
        document.getElementById(
            "darkModeBtn"
        );

    const resetAppBtn =
        document.getElementById(
            "resetAppBtn"
        );

    const clearAppCacheBtn =
        document.getElementById(
            "clearAppCacheBtn"
        );

    if (toggleScoreSettingsBtn) {

        toggleScoreSettingsBtn.addEventListener(
            "click",
            toggleScoreSettings
        );

    }

    if (resetScoreBtn) {

        resetScoreBtn.addEventListener(
            "click",
            resetScoreSettings
        );

    }

    if (darkModeBtn) {

        darkModeBtn.addEventListener(
            "click",
            toggleDarkMode
        );

    }

    if (resetAppBtn) {

        resetAppBtn.addEventListener(
            "click",
            resetApplication
        );

    }

    if (clearAppCacheBtn) {

        clearAppCacheBtn.addEventListener(
            "click",
            clearAppCache
        );

    }

}

function toggleScoreSettings() {

    const content =
        document.getElementById(
            "scoreSettingsContent"
        );

    const button =
        document.getElementById(
            "toggleScoreSettingsBtn"
        );

    if (!content || !button) {
        return;
    }

    const isExpanded =
        button.getAttribute("aria-expanded") === "true";

    content.classList.toggle("hidden", isExpanded);
    button.setAttribute(
        "aria-expanded",
        String(!isExpanded)
    );
    button.textContent =
        isExpanded ? "設定を表示" : "設定を隠す";

}

// ======================================
// ユーティリティ
// ======================================

function generateId() {

    return (
        Date.now() +
        Math.floor(
            Math.random() * 100000
        )
    );

}

function deepCopy(data) {

    return JSON.parse(
        JSON.stringify(data)
    );

}

function shuffle(array) {

    const copied =
        [...array];

    for (
        let i = copied.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            copied[i],
            copied[j]
        ] =
        [
            copied[j],
            copied[i]
        ];

    }

    return copied;

}

function createPairKey(a, b) {

    return [a, b]
        .sort((x, y) => x - y)
        .join("-");

}

// ======================================
// part1終了
// 次:
// part2/7
// ・参加者登録
// ・名前登録
// ・性別変更
// ・レベル変更
// ・削除
// ・人数集計
// ・コート数自動制御
// ======================================
// ======================================
// part2 / 7
// 参加者管理
// ======================================

// ======================================
// 人数追加
// ======================================

function addNumberPlayers() {

    const input =
        document.getElementById(
            "numberInput"
        );

    const count =
        parseInt(input.value);

    if (
        isNaN(count) ||
        count <= 0
    ) {
        return;
    }

    const startNo =
        appData.participants.length + 1;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        appData.participants.push({

            id: generateId(),

            name:
                `${startNo + i}`,

            gender: "",

            level: 2,

            playCount: 0,

            restCount: 0,

            consecutivePlay: 0,

            consecutiveRest: 0,

            lastCourt: null,

            lastMatchNo: 0,

            forceRest: false

        });

    }

    input.value = "";

    renderParticipantTable();

    updateParticipantSummary();

    updateCourtOptions();

    saveData();

}

// ======================================
// 名前追加
// ======================================

function addNamePlayers() {

    const textarea =
        document.getElementById(
            "nameInput"
        );

    const text =
        textarea.value.trim();

    if (!text) {
        return;
    }

    const names =
        text
            .split(/[\n\s,、]+/)
            .map(x => x.trim())
            .filter(Boolean);

    names.forEach(name => {

        appData.participants.push({

            id: generateId(),

            name: name,

            gender: "",

            level: 2,

            playCount: 0,

            restCount: 0,

            consecutivePlay: 0,

            consecutiveRest: 0,

            lastCourt: null,

            lastMatchNo: 0,

            forceRest: false

        });

    });

    textarea.value = "";

    renderParticipantTable();

    updateParticipantSummary();

    updateCourtOptions();

    saveData();

}

// ======================================
// 参加者一覧表示
// ======================================

function renderParticipantTable() {

    const tbody =
        document.getElementById(
            "participantTableBody"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    appData.participants.forEach(
        (player, index) => {

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <input
                        value="${escapeHtml(player.name)}"
                        data-index="${index}"
                        class="player-name">
                </td>

                <td>
                    <button
                        class="level-btn"
                        data-index="${index}">
                        ${getLevelStars(player.level)}
                    </button>
                </td>

                <td>

                    <select
                        class="gender-select"
                        data-index="${index}">

                        <option value=""
                        ${player.gender === "" ? "selected" : ""}>
                        未
                        </option>

                        <option value="男"
                        ${player.gender === "男" ? "selected" : ""}>
                        男
                        </option>

                        <option value="女"
                        ${player.gender === "女" ? "selected" : ""}>
                        女
                        </option>

                    </select>

                </td>

                <td>

                    <button
                        class="delete-btn"
                        data-index="${index}">
                        🗑
                    </button>

                </td>

            `;

            tbody.appendChild(row);

        }
    );

    bindParticipantTableEvents();

}

// ======================================
// テーブルイベント
// ======================================

function bindParticipantTableEvents() {

    document
        .querySelectorAll(
            ".player-name"
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                function () {

                    const index =
                        Number(
                            this.dataset.index
                        );

                    updatePlayerName(
                        index,
                        this.value
                    );

                }
            );

        });

    document
        .querySelectorAll(
            ".gender-select"
        )
        .forEach(select => {

            select.addEventListener(
                "change",
                function () {

                    const index =
                        Number(
                            this.dataset.index
                        );

                    updatePlayerGender(
                        index,
                        this.value
                    );

                }
            );

        });

    document
        .querySelectorAll(
            ".level-btn"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            this.dataset.index
                        );

                    cycleLevel(
                        index
                    );

                }
            );

        });

    document
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            this.dataset.index
                        );

                    removeParticipant(
                        index
                    );

                }
            );

        });

}

// ======================================
// 名前変更
// ======================================

function updatePlayerName(
    index,
    value
) {

    if (
        !appData.participants[index]
    ) {
        return;
    }

    appData.participants[index]
        .name = value.trim();

    saveData();

}

// ======================================
// 性別変更
// ======================================

function updatePlayerGender(
    index,
    gender
) {

    if (
        !appData.participants[index]
    ) {
        return;
    }

    appData.participants[index]
        .gender = gender;

    updateParticipantSummary();

    saveData();

}

// ======================================
// レベル変更
// ======================================

function cycleLevel(index) {

    const player =
        appData.participants[index];

    if (!player) {
        return;
    }

    player.level++;

    if (
        player.level > 5
    ) {
        player.level = 1;
    }

    renderParticipantTable();

    saveData();

}

// ======================================
// 削除
// ======================================

function removeParticipant(
    index
) {

    appData.participants.splice(
        index,
        1
    );

    renderParticipantTable();

    updateParticipantSummary();

    updateCourtOptions();

    saveData();

}

// ======================================
// 一括削除
// ======================================

function deleteAllParticipants() {

    const result =
        confirm(
            "参加者を全員削除しますか？"
        );

    if (!result) {
        return;
    }

    appData.participants = [];

    renderParticipantTable();

    updateParticipantSummary();

    updateCourtOptions();

    saveData();

}

// ======================================
// 人数集計
// ======================================

function updateParticipantSummary() {

    const total =
        appData.participants.length;

    const male =
        appData.participants.filter(
            p => p.gender === "男"
        ).length;

    const female =
        appData.participants.filter(
            p => p.gender === "女"
        ).length;

    const unknown =
        total - male - female;

    setText(
        "totalCount",
        total
    );

    setText(
        "maleCount",
        male
    );

    setText(
        "femaleCount",
        female
    );

    setText(
        "unknownCount",
        unknown
    );

}

// ======================================
// コート数更新
// 1面あたり最低4人
// ======================================

function updateCourtOptions() {

    const select =
        document.getElementById(
            "courtCount"
        );

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const maxCourt =
        Math.max(
            1,
            Math.floor(
                appData.participants.length / 4
            )
        );

    for (
        let i = 1;
        i <= maxCourt;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value = i;

        option.textContent =
            `${i}面`;

        if (
            i ===
            appData.settings.courtCount
        ) {
            option.selected = true;
        }

        select.appendChild(option);

    }

}

// ======================================
// 参加者一覧
// 表示／非表示
// ======================================

function bindVisibilityOptions(toggle, onChange) {

    toggle.querySelectorAll("[data-visibility]")
        .forEach(option => {
            option.addEventListener(
                "click",
                () => onChange(option.dataset.visibility === "show")
            );
        });

}

function updateVisibilityToggle(toggle, isVisible) {

    toggle.querySelectorAll("[data-visibility]")
        .forEach(option => {
            option.setAttribute(
                "aria-pressed",
                String(
                    option.dataset.visibility ===
                    (isVisible ? "show" : "hide")
                )
            );
        });

}

function setParticipantListVisibility(isVisible) {

    const target =
        document.getElementById(
            "participantListContainer"
        );

    const button =
        document.getElementById(
            "toggleParticipantBtn"
        );

    target.style.display =
        isVisible
            ? "block"
            : "none";

    updateVisibilityToggle(button, isVisible);

}

// ======================================
// 表示系
// ======================================

function getLevelStars(level) {

    let text = "";

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        text +=
            i <= level
                ? "★"
                : "☆";

    }

    return text;

}

function setText(
    id,
    value
) {

    const el =
        document.getElementById(id);

    if (el) {
        el.textContent = value;
    }

}

function escapeHtml(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

}

// ======================================
// part2終了
// 次:
// part3/7
// ・設定保存
// ・試合開始
// ・管理タブ
// ・スコア設定管理
// ・ダークモード
// ・データ初期化
// ======================================
// ======================================
// part3 / 7
// 設定・管理タブ
// ======================================

// ======================================
// 設定復元
// ======================================

function restoreSettings() {

    const s =
        appData.settings;

    const score =
        appData.scoreSettings;

    setValue(
        "totalMatches",
        s.totalMatches
    );

    setValue(
        "playMode",
        s.playMode
    );

    setValue(
        "voiceAnnouncements",
        s.voiceAnnouncements ? "on" : "off"
    );

    setValue(
        "matchPlayMode",
        s.playMode
    );

    setValue(
        "autoSave",
        s.autoSave
            ? "on"
            : "off"
    );

    setValue(
        "featureMode",
        s.extension
    );

    setValue(
        "pairPenalty",
        score.pairPenalty
    );

    setValue(
        "opponentPenalty",
        score.opponentPenalty
    );

    setValue(
        "playBalanceBonus",
        score.playBalanceBonus
    );

    setValue(
        "consecutivePlayPenalty",
        score.consecutivePlayPenalty
    );

    setValue(
        "levelBonus",
        score.levelBonus
    );

    setValue(
        "mixBonus",
        score.mixBonus
    );

    setValue(
        "courtChangeBonus",
        score.courtChangeBonus
    );

    setValue(
        "playCountGapThreshold",
        score.playCountGapThreshold
    );

    setValue(
        "searchCount",
        score.searchCount
    );

}

// ======================================
// 汎用 setValue
// ======================================

function setValue(
    id,
    value
) {

    const el =
        document.getElementById(id);

    if (!el) {
        return;
    }

    el.value = value;

}

// ======================================
// 試合開始
// ======================================

function startMatch() {

    const playerCount =
        appData.participants.length;

    if (
        playerCount < 4
    ) {

        alert(
            "参加人数が不足しています"
        );

        return;

    }

    updateSettingsFromScreen();

    updateProgressControls();

    appData.currentMatch = 1;

    appData.matchTarget = appData.settings.totalMatches;

    appData.matchTargetIncrement = appData.settings.totalMatches;

    appData.continuationPromptHandledForTarget = 0;

    appData.completedMatchesByCourt = Array(
        appData.settings.courtCount
    ).fill(0);

    appData.currentRoundGenerated = false;

    appData.courts = [];

    appData.roundHistory = [];

    appData.pairHistory = {};

    appData.opponentHistory = {};

    appData.courtHistory = {};

    appData.participants.forEach(
        player => {

            player.playCount = 0;

            player.restCount = 0;

            player.consecutivePlay = 0;

            player.consecutiveRest = 0;

            player.lastCourt = null;

            player.lastMatchNo = 0;

            player.forceRest = false

        }
    );

    const matchesToStart =
        ensureMatchCapacity(
            appData.settings.courtCount
        );

    generateRound(
        getNextCourtIndices(matchesToStart)
    );

    switchToTab(
        "matchTab"
    );

    saveData();

}

// ======================================
// 設定反映
// ======================================

function updateSettingsFromScreen() {

    const court = Math.max(
        1,
        Math.floor(
            Number(getValue("courtCount", 1)) || 1
        )
    );

    const totalMatches = Math.max(
        1,
        Math.floor(
            Number(getValue("totalMatches", 30)) || 30
        )
    );

    appData.settings.courtCount =
        court;

    appData.settings.totalMatches =
        totalMatches;

    appData.settings.playMode =
        getValue(
            "playMode",
            "batch"
        );

    appData.settings.voiceAnnouncements =
        getValue(
            "voiceAnnouncements",
            "off"
        ) === "on";

    appData.settings.optionMode =
        getValue(
            "optionMode",
            "-"
        );

}

// ======================================
// タブ切替
// ======================================

function switchToTab(tabId) {

    document
        .querySelectorAll(
            ".tab-content"
        )
        .forEach(tab => {

            tab.classList.remove(
                "active"
            );

        });

    document
        .querySelectorAll(
            ".tab-button"
        )
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });

    const targetTab =
        document.getElementById(
            tabId
        );

    if (targetTab) {

        targetTab.classList.add(
            "active"
        );

    }

    const targetButton =
        document.querySelector(
            `[data-tab="${tabId}"]`
        );

    if (targetButton) {

        targetButton.classList.add(
            "active"
        );

    }

}

// ======================================
// 管理設定保存
// ======================================

function saveAdminSettings() {

    appData.settings.autoSave =

        getValue(
            "autoSave",
            "on"
        ) === "on";

    appData.settings.extension =

        getValue(
            "featureMode",
            "-"
        );

    appData.scoreSettings
        .pairPenalty =

        getNumber(
            "pairPenalty",
            500
        );

    appData.scoreSettings
        .opponentPenalty =

        getNumber(
            "opponentPenalty",
            300
        );

    appData.scoreSettings
        .playBalanceBonus =

        getNumber(
            "playBalanceBonus",
            100
        );

    appData.scoreSettings
        .consecutivePlayPenalty =

        getNumber(
            "consecutivePlayPenalty",
            50
        );

    appData.scoreSettings
        .levelBonus =

        getNumber(
            "levelBonus",
            100
        );

    appData.scoreSettings
        .mixBonus =

        getNumber(
            "mixBonus",
            100
        );

    appData.scoreSettings
        .courtChangeBonus =

        getNumber(
            "courtChangeBonus",
            50
        );

    appData.scoreSettings
        .playCountGapThreshold =

        Math.max(
            1,
            Math.floor(
                getNumber(
                    "playCountGapThreshold",
                    5
                ) || 5
            )
        );

    appData.scoreSettings
        .searchCount =

        getNumber(
            "searchCount",
            1000
        );

    saveData();

}

// ======================================
// スコア設定初期化
// ======================================

function resetScoreSettings() {

    const result =
        confirm(
            "スコア設定を初期化しますか？"
        );

    if (!result) {
        return;
    }

    const defaults =
        createDefaultData();

    appData.scoreSettings =
        deepCopy(
            defaults.scoreSettings
        );

    restoreSettings();

    saveData();

}

// ======================================
// ダークモード
// ======================================

function toggleDarkMode() {

    appData.settings.darkMode =
        !appData.settings.darkMode;

    applyDarkMode();

    saveData();

}

function applyDarkMode() {

    if (
        appData.settings.darkMode
    ) {

        document.body
            .classList.add(
                "dark-mode"
            );

    } else {

        document.body
            .classList.remove(
                "dark-mode"
            );

    }

}

// ======================================
// データ初期化
// ======================================

function resetApplication() {

    const result =
        confirm(
`アプリデータを初期化しますか？

・参加者
・試合設定
・試合履歴
・保存データ

すべて削除されます。`
        );

    if (!result) {
        return;
    }

    localStorage.removeItem(
        STORAGE_KEY
    );

    appData =
        createDefaultData();

    location.reload();

}

async function clearAppCache() {

    const confirmed = confirm(
        "アプリのキャッシュを削除しますか？\n参加者や試合の保存データは削除されません。"
    );

    if (!confirmed) {
        return;
    }

    if (!("caches" in window)) {
        alert("このブラウザではアプリのキャッシュを削除できません。");
        return;
    }

    const button =
        document.getElementById("clearAppCacheBtn");

    if (button) {
        button.disabled = true;
    }

    try {
        const cacheNames =
            await window.caches.keys();

        const appCacheNames =
            cacheNames.filter(
                name => name.startsWith("doubles-manager-")
            );

        if (appCacheNames.length === 0) {
            alert("削除するアプリのキャッシュはありません。");
            return;
        }

        const results = await Promise.all(
            appCacheNames.map(
                name => window.caches.delete(name)
            )
        );

        if (results.every(Boolean)) {
            alert("アプリのキャッシュを削除しました。");
        } else {
            alert("一部のアプリキャッシュを削除できませんでした。");
        }
    } catch (error) {
        console.error(error);
        alert("キャッシュの削除に失敗しました。");
    } finally {
        if (button) {
            button.disabled = false;
        }
    }

}

// ======================================
// 入力取得
// ======================================

function getValue(
    id,
    defaultValue = ""
) {

    const el =
        document.getElementById(id);

    if (!el) {
        return defaultValue;
    }

    return el.value;

}

function getNumber(
    id,
    defaultValue = 0
) {

    const value =
        Number(
            getValue(
                id,
                defaultValue
            )
        );

    return isNaN(value)
        ? defaultValue
        : value;

}

// ======================================
// 管理画面監視
// ======================================

document.addEventListener(
    "change",
    function(event){

        const adminIds = [

            "autoSave",

            "featureMode",

            "pairPenalty",

            "opponentPenalty",

            "playBalanceBonus",

            "consecutivePlayPenalty",

            "levelBonus",

            "mixBonus",

            "courtChangeBonus",

            "playCountGapThreshold",

            "searchCount"

        ];

        if(
            adminIds.includes(
                event.target.id
            )
        ){

            saveAdminSettings();

            if(
                appData.currentMatch > 0
            ){

                console.log(
                    "次試合から反映"
                );

            }

        }

    }
);

// ======================================
// part3終了
// 次:
// part4/7
// ・待機選手抽出
// ・休憩管理
// ・試合生成対象選手抽出
// ・個別進行
// ・一括進行
// ・ラウンド生成土台
// ======================================
// ======================================
// part4 / 7
// 試合生成基盤
// 待機選手
// 出場候補
// 一括進行
// 個別進行
// ======================================

// ======================================
// 試合中選手取得
// ======================================

function getPlayingPlayerIds() {

    const ids = new Set();

    appData.courts.forEach(court => {

        if (
            court.status !== "playing"
        ) {
            return;
        }

        [...court.teamA, ...court.teamB]
            .forEach(player => {

                ids.add(player.id);

            });

    });

    return ids;

}

// ======================================
// 待機選手取得
// ======================================

function getBenchPlayers() {

    const playingIds =
        getPlayingPlayerIds();

    return appData.participants
        .filter(
            p => !playingIds.has(p.id)
        );

}

// ======================================
// 待機選手表示
// ======================================

function setBenchVisibility(isVisible) {

    const container =
        document.getElementById(
            "benchContainer"
        );

    const button =
        document.getElementById(
            "toggleBenchBtn"
        );

    container.style.display =
        isVisible
            ? "block"
            : "none";

    updateVisibilityToggle(button, isVisible);

    if (isVisible) {

        renderBenchPlayers();

    }

}

// ======================================
// 待機選手描画
// ======================================

function renderBenchPlayers() {

    const tbody =
        document.getElementById(
            "benchTableBody"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    const benchPlayers =
        getBenchPlayers();

    benchPlayers.forEach(
        (player, index) => {

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                <input
                    value="${escapeHtml(player.name)}"
                    onchange="updateBenchName('${player.id}', this.value)">
            </td>

            <td>
                ${getLevelStars(player.level)}
            </td>

            <td>

                <input
                    type="checkbox"
                    ${player.forceRest ? "checked" : ""}
                    onchange="toggleForceRest('${player.id}', this.checked)">

            </td>

            `;

            tbody.appendChild(row);

        }
    );

}

// ======================================
// 待機選手名前変更
// ======================================

function updateBenchName(
    playerId,
    value
) {

    const player =
        appData.participants.find(
            p => String(p.id) === String(playerId)
        );

    if (!player) {
        return;
    }

    player.name = value;

    saveData();

}

// ======================================
// 強制休憩切替
// ======================================

function toggleForceRest(
    playerId,
    checked
) {

    const player =
        appData.participants.find(
            p => String(p.id) === String(playerId)
        );

    if (!player) {
        return;
    }

    player.forceRest = checked;

    saveData();

}

// ======================================
// 出場対象選手取得
// ======================================

function getSelectablePlayers() {

    return appData.participants

    .filter(
        p => !p.forceRest
    )

    .sort(
    (a,b)=>{

        if(
            a.playCount !==
            b.playCount
        ){

            return (
                a.playCount -
                b.playCount
            );

        }

        return (
            b.consecutiveRest -
            a.consecutiveRest
        );

    });

}

// ======================================
// 強制出場候補
// ======================================

function getPriorityPlayers(players) {

    if (players.length === 0) {
        return [];
    }

    const playCounts =
        players.map(player => Number(player.playCount) || 0);

    const lowestPlayCount =
        Math.min(...playCounts);

    const highestPlayCount =
        Math.max(...playCounts);

    if (
        highestPlayCount - lowestPlayCount <
        appData.scoreSettings.playCountGapThreshold
    ) {
        return [];
    }

    return players.filter(
        player =>
            (Number(player.playCount) || 0) === lowestPlayCount
    );

}

// ======================================
// 一括進行終了
// ======================================

function finishAllMatches() {

    if (appData.settings.playMode !== "batch") {
        return;
    }

    const hasPlayingCourt = appData.courts.some(
        court => court.status === "playing"
    );

    if (!hasPlayingCourt) {
        return;
    }

    updateRoundStatistics();

    appData.courts.forEach((court, index) => {
        if (court.status !== "playing") {
            return;
        }

        court.status = "finished";
        incrementCompletedMatches(index);
    });

    ensureMatchCapacity(0);

    renderCourts();
    updateMatchInfo();
    saveData();
}

// ======================================
// 一括進行 次試合
// ======================================

function startNextRound() {

    if (appData.settings.playMode !== "batch") {
        return;
    }

    const unfinished =

    appData.courts.some(
        court =>
        court.status ===
        "playing"
    );

    if(
        unfinished
    ){

        alert(
            "試合終了を先に実施してください"
        );

        return;
    }

    const matchesToStart =
        ensureMatchCapacity(
            appData.settings.courtCount
        );

    if (matchesToStart === 0) {
        return;
    }

    appData.currentMatch++;

    generateNextRound(
        getNextCourtIndices(matchesToStart)
    );

}

// ======================================
// 次ラウンド
// ======================================

function generateNextRound(courtIndices) {

    appData.currentRoundGenerated =
        false;

    generateRound(courtIndices);

    renderCourts();

    updateMatchInfo();

    saveData();

}

// ======================================
// 試合数表示
// ======================================

function updateMatchInfo() {

    const el =
        document.getElementById(
            "matchInfo"
        );

    if (!el) {
        return;
    }

    const completed = getCompletedMatchTotal();
    const active = getActiveMatchCount();

    el.textContent =
        `${completed}試合完了 / ${appData.matchTarget}試合` +
        (active > 0 ? `（進行中 ${active} 試合）` : "");

    updateProgressControls();

}

function getCompletedMatchTotal() {

    return appData.completedMatchesByCourt.reduce(
        (total, count) => total + count,
        0
    );

}

function getActiveMatchCount() {

    return appData.courts.filter(
        court => court.status === "playing"
    ).length;

}

function incrementCompletedMatches(courtIndex) {

    if (!Array.isArray(appData.completedMatchesByCourt)) {
        appData.completedMatchesByCourt = [];
    }

    appData.completedMatchesByCourt[courtIndex] =
        (appData.completedMatchesByCourt[courtIndex] || 0) + 1;

}

function ensureMatchCapacity(requestedMatches) {

    const activeMatches = getActiveMatchCount();
    const completedMatches = getCompletedMatchTotal();
    let availableMatches = Math.max(
        0,
        appData.matchTarget - completedMatches - activeMatches
    );

    if (
        activeMatches === 0 &&
        availableMatches < appData.settings.courtCount &&
        appData.continuationPromptHandledForTarget !== appData.matchTarget
    ) {
        const shouldContinue = confirm(
            `設定された試合数に到達、または残り試合数が使用コート数を下回りました。\n` +
            `現在 ${completedMatches} / ${appData.matchTarget} 試合です。\n` +
            `続行すると、さらに ${appData.matchTargetIncrement} 試合分を追加します。\n` +
            "試合を継続しますか？"
        );

        appData.continuationPromptHandledForTarget =
            appData.matchTarget;

        if (shouldContinue) {
            appData.matchTarget +=
                appData.matchTargetIncrement;

            appData.continuationPromptHandledForTarget = 0;
        }

        saveData();

        availableMatches = Math.max(
            0,
            appData.matchTarget - completedMatches - activeMatches
        );
    }

    return Math.min(
        Math.max(0, requestedMatches),
        availableMatches
    );

}

function getNextCourtIndices(count) {

    return Array.from(
        { length: appData.settings.courtCount },
        (_, index) => index
    )
        .sort(
            (a, b) =>
                (appData.completedMatchesByCourt[a] || 0) -
                (appData.completedMatchesByCourt[b] || 0)
        )
        .slice(0, count);

}

function updateProgressControls() {

    const isBatchMode =
        appData.settings.playMode === "batch";

    const batchControls =
        document.getElementById("batchControls");

    if (batchControls) {
        batchControls.classList.toggle(
            "hidden",
            !isBatchMode
        );

        batchControls
            .querySelectorAll("button")
            .forEach(button => {
                button.disabled = !isBatchMode;
            });

        const unallocatedMatches = Math.max(
            0,
            appData.matchTarget -
                getCompletedMatchTotal() -
                getActiveMatchCount()
        );
        const limitWasDeclined =
            appData.continuationPromptHandledForTarget ===
            appData.matchTarget;
        const finishAllButton =
            document.getElementById("finishAllBtn");
        const nextAllButton =
            document.getElementById("nextAllBtn");

        if (finishAllButton) {
            finishAllButton.disabled =
                !isBatchMode || getActiveMatchCount() === 0;
        }

        if (nextAllButton) {
            nextAllButton.disabled =
                !isBatchMode ||
                (unallocatedMatches === 0 && limitWasDeclined);
        }
    }

    const matchPlayMode =
        document.getElementById("matchPlayMode");

    if (matchPlayMode) {
        matchPlayMode.value =
            appData.settings.playMode;
    }

}

// ======================================
// 個別進行
// ======================================

function finishCourt(
    courtIndex
) {

    const court =
        appData.courts[courtIndex];

    if (!court) {
        return;
    }

    if (court.status !== "playing") {
        return;
    }

    const playedIds = new Set(
        [...court.teamA, ...court.teamB]
            .map(player => player.id)
    );

    updateRoundStatistics(playedIds, false);

    court.status =
        "finished";

    incrementCompletedMatches(courtIndex);

    ensureMatchCapacity(0);

    renderCourts();

    updateMatchInfo();

    saveData();

}

// ======================================
// 個別次試合
// ======================================

function startNextCourtMatch(
    courtIndex
){

    createNextCourtRound(
        courtIndex
    );

}

// ======================================
// 個別進行用
// 他コート試合中除外
// ======================================

function getAvailablePlayersForCourt(
    targetCourtIndex
) {

    const playingIds =
        new Set();

    appData.courts.forEach(
        (court, index) => {

            if (
                index === targetCourtIndex
            ) {
                return;
            }

            if (
                court.status ===
                "playing"
            ) {

                [...court.teamA, ...court.teamB]
                    .forEach(player => {

                        playingIds.add(
                            player.id
                        );

                    });

            }

        }
    );

    return appData.participants.filter(
        player =>

            !playingIds.has(
                player.id
            ) &&

            !player.forceRest
    );

}

// ======================================
// 出場統計更新
// ======================================

function updateRoundStatistics(
    playingIds = getPlayingPlayerIds(),
    updateRestingPlayers = true
) {

    appData.participants.forEach(
        player => {

            if (
                playingIds.has(
                    player.id
                )
            ) {

                player.playCount++;

                player.consecutivePlay++;

                player.consecutiveRest = 0;

            }
            else if (updateRestingPlayers) {

                player.restCount++;

                player.consecutiveRest++;

                player.consecutivePlay = 0;

            }

        }
    );

}

// ======================================
// コート描画
// ======================================

function renderCourts() {

    const container =
        document.getElementById(
            "courtContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    appData.courts.forEach(
        (court, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "court-card";

            if (court.status === "finished") {
                card.classList.add("finished");
            }

            const teamA =
                (court.teamA || [])
                    .map(p => p.name)
                    .join(" : ");

            const teamB =
                (court.teamB || [])
                    .map(p => p.name)
                    .join(" : ");

            card.innerHTML = `

            <div class="court-title"></div>

            <div class="court-match"></div>

            `;

            const isIndividual =
                appData.settings.playMode === "individual";

            card.querySelector(".court-title").textContent =
                isIndividual
                    ? `${index + 1}コート 第${court.matchNo || appData.currentMatch}試合`
                    : `${index + 1}コート`;

            card.querySelector(".court-match").textContent =
                teamA || teamB
                    ? `${teamA} VS ${teamB}`
                    : "次の試合待ち";

            if (isIndividual) {

                card.innerHTML += `

                <div class="court-controls">

                ${
                    court.status === "playing"

                    ?

                    `<button
                        class="finish-court-btn"
                        onclick="finishCourt(${index})">
                        <span class="finish-label">試合終了</span>
                    </button>`

                    :

                    `<button
                        class="next-court-btn"
                        ${
                            appData.matchTarget -
                                getCompletedMatchTotal() -
                                getActiveMatchCount() <= 0 &&
                            (
                                getActiveMatchCount() > 0 ||
                                appData.continuationPromptHandledForTarget ===
                                    appData.matchTarget
                            )
                                ? "disabled"
                                : ""
                        }
                        onclick="startNextCourtMatch(${index})">
                        <span class="next-match-label">次試合開始</span>
                    </button>`
                }

                </div>

                `;
            }

            container.appendChild(
                card
            );

        }
    );

}


// ======================================
// part4終了
//
// 次:
// part5/7
//
// スコア方式コア
// ・ペア重複
// ・対戦重複
// ・レベル均等
// ・レベル統一
// ・ミックス優先
// ・コート変更加点
// ・TOP10候補方式
//
// ======================================
// ======================================
// part5 / 7
// スコア方式エンジン
// ======================================

// ======================================
// 最高スコア候補生成
// ======================================

function generateBestCandidate() {

    return generateBestCandidateForPlayers(
        getSelectablePlayers(),
        appData.settings.courtCount
    );

}

function generateBestCandidateForPlayers(
    players,
    courtCount,
    courtNumbers
) {

    const candidates = [];

    const searchCount =
        appData.scoreSettings.searchCount;

    for (
        let i = 0;
        i < searchCount;
        i++
    ) {

        const candidate =
            createCandidateForPlayers(
                players,
                courtCount,
                courtNumbers
            );

        if (!candidate) {
            continue;
        }

        candidate.score =
            calculateScore(
                candidate
            );

        candidates.push(
            candidate
        );

    }

    if(
        candidates.length === 0
    ){

        return null;
    }

    candidates.sort(
    (a,b)=>
        b.score-a.score
    );

    const topCandidates =
        candidates.slice(
            0,
            Math.min(
                10,
                candidates.length
            )
        );

    return topCandidates[
        Math.floor(
            Math.random()
            * topCandidates.length
        )
    ];

}

// ======================================
// 候補生成
// ======================================

function createCandidateForPlayers(
    players,
    courtCount,
    courtNumbers = []
){
    const requiredPlayers =
        courtCount * 4;

    const eligiblePlayers = [...players];

    if (
        eligiblePlayers.length < requiredPlayers
    ) {
        return null;
    }

    const forcedPlayers =
        shuffle(
            getPriorityPlayers(eligiblePlayers)
        );

    const selectedPlayers =
        forcedPlayers.slice(0, requiredPlayers);

    const remainingPlayers =
        shuffle(
            eligiblePlayers.filter(
                player => !selectedPlayers.includes(player)
            )
        ).slice(
            0,
            requiredPlayers + 4 - selectedPlayers.length
        );

    remainingPlayers.forEach(player => {

        if (selectedPlayers.length < requiredPlayers) {
            selectedPlayers.push(player);
        }

    });

    const shuffled =
        shuffle(selectedPlayers);

    const courts = [];

    let pos = 0;

    for(
        let i=0;
        i<courtCount;
        i++
    ){

        const courtNo =
            courtNumbers[i] || i + 1;

        courts.push({

            courtNo:
                courtNo,

            matchNo:
                (appData.completedMatchesByCourt[courtNo - 1] || 0) + 1,

            teamA:[
                shuffled[pos++],
                shuffled[pos++]
            ],

            teamB:[
                shuffled[pos++],
                shuffled[pos++]
            ],

            status:
                "playing"

        });

    }

    return {
        courts
    };

}

// ======================================
// スコア計算
// ======================================

function calculateScore(
    candidate
) {

    const s =
        appData.scoreSettings;

    let score = 10000;

    score -=
        getPairPenalty(
            candidate
        ) *
        s.pairPenalty;

    score -=
        getOpponentPenalty(
            candidate
        ) *
        s.opponentPenalty;

    score +=
        getPlayBalanceBonus(
            candidate
        ) *
        s.playBalanceBonus;

    score -=
        getConsecutivePlayPenalty(
            candidate
        ) *
        s.consecutivePlayPenalty;

    score +=
        getLevelBonus(
            candidate
        ) *
        s.levelBonus;

    score +=
        getMixBonus(
            candidate
        ) *
        s.mixBonus;

    score +=
        getCourtChangeBonus(
            candidate
        ) *
        s.courtChangeBonus;

    return score;

}

// ======================================
// 同一ペアペナルティ
// ======================================

function getPairPenalty(
    candidate
) {

    let penalty = 0;

    candidate.courts.forEach(
        court => {

            const pairA =
                createPairKey(
                    court.teamA[0].id,
                    court.teamA[1].id
                );

            const pairB =
                createPairKey(
                    court.teamB[0].id,
                    court.teamB[1].id
                );

            penalty +=
                appData.pairHistory[
                    pairA
                ] || 0;

            penalty +=
                appData.pairHistory[
                    pairB
                ] || 0;

        }
    );

    return penalty;

}

// ======================================
// 同一対戦ペナルティ
// ======================================

function getOpponentPenalty(
    candidate
) {

    let penalty = 0;

    candidate.courts.forEach(
        court => {

            court.teamA.forEach(
                playerA => {

                    court.teamB.forEach(
                        playerB => {

                            const key =
                                createPairKey(
                                    playerA.id,
                                    playerB.id
                                );

                            penalty +=
                                appData
                                .opponentHistory[
                                    key
                                ] || 0;

                        }
                    );

                }
            );

        }
    );

    return penalty;

}

// ======================================
// 出場均等ボーナス
// ======================================

function getPlayBalanceBonus(
    candidate
) {

    let bonus = 0;

    const avgPlayCount =
        appData.participants
        .reduce(
            (a, b) =>
                a + b.playCount,
            0
        ) /
        Math.max(
            1,
            appData.participants.length
        );

    candidate.courts.forEach(
        court => {

            [...court.teamA,
             ...court.teamB]

            .forEach(player => {

                if (
                    player.playCount <
                    avgPlayCount
                ) {

                    bonus++;

                }

            });

        }
    );

    return bonus;

}

// ======================================
// 連続出場ペナルティ
// ======================================

function getConsecutivePlayPenalty(
    candidate
) {

    let penalty = 0;

    candidate.courts.forEach(
        court => {

            [...court.teamA,
             ...court.teamB]

            .forEach(player => {

                penalty +=
                    player.consecutivePlay;

            });

        }
    );

    return penalty;

}

// ======================================
// レベルボーナス
// ======================================

function getLevelBonus(
    candidate
) {

    const mode =
        appData.settings.optionMode;

    if (
        mode === "-"
    ) {

        return 0;

    }

    let bonus = 0;

    candidate.courts.forEach(
        court => {

            if (
                mode ===
                "levelBalance"
            ) {

                bonus +=
                scoreLevelBalance(
                    court
                );

            }

            if (
                mode ===
                "levelUnified"
            ) {

                bonus +=
                scoreLevelUnified(
                    court
                );

            }

        }
    );

    return bonus;

}

// ======================================
// レベル均等
// ======================================

function scoreLevelBalance(
    court
) {

    let score = 0;

    const pair1Diff =
        Math.abs(
            court.teamA[0].level -
            court.teamA[1].level
        );

    const pair2Diff =
        Math.abs(
            court.teamB[0].level -
            court.teamB[1].level
        );

    if (
        pair1Diff <= 1
    ) {
        score += 5;
    }

    if (
        pair2Diff <= 1
    ) {
        score += 5;
    }

    return score;

}

// ======================================
// レベル統一
// ======================================

function scoreLevelUnified(
 court
){

    const teamALevel =
    court.teamA[0].level +
    court.teamA[1].level;

    const teamBLevel =
    court.teamB[0].level +
    court.teamB[1].level;

    const diff =
    Math.abs(
        teamALevel -
        teamBLevel
    );

    if(diff===0){

        return 20;
    }

    if(diff===1){

        return 10;
    }

    if(diff===2){

        return 3;
    }

    return -10;
}

// ======================================
// ミックス優先
// ======================================

function getMixBonus(
    candidate
) {

    if (
        appData.settings.optionMode
        !== "mix"
    ) {

        return 0;

    }

    let score = 0;

    candidate.courts.forEach(
        court => {

            const mixA =
                isMixedTeam(
                    court.teamA
                );

            const mixB =
                isMixedTeam(
                    court.teamB
                );

            if(mixA){

                score += 20;
            }

            if(mixB){

                score += 20;
            }

            if(mixA && mixB){

                score += 20;
            }

        }
    );

    return score;

}

function isMixedTeam(
    team
) {

    return (

        team[0].gender &&
        team[1].gender &&

        team[0].gender !==
        team[1].gender

    );

}

// ======================================
// コート変更ボーナス
// ======================================

function getCourtChangeBonus(
    candidate
) {

    let bonus = 0;

    candidate.courts.forEach(
        court => {

            [...court.teamA,
             ...court.teamB]

            .forEach(player => {

                if (

                    player.lastCourt &&
                    player.lastCourt !==
                    court.courtNo

                ) {

                    bonus++;

                }

            });

        }
    );

    return bonus;

}

// ======================================
// part5終了
//
// 次:
// part6/7
//
// ・履歴更新
// ・ペア履歴保存
// ・対戦履歴保存
// ・試合確定
// ・個別進行反映
// ・一括進行反映
//
// ======================================
// ======================================
// part6 / 7
// 試合確定
// 履歴管理
// ペア履歴
// 対戦履歴
// 次試合作成
// ======================================

// ======================================
// ベスト候補適用
// ======================================

function applyCandidate(candidate) {

    if (!candidate) {

        alert(
            "組み合わせを生成できませんでした"
        );

        return false;

    }

    const generatedCourts =
        deepCopy(candidate.courts);

    appData.courts = Array.from(
        { length: appData.settings.courtCount },
        (_, index) => {
            const courtIndex =
                generatedCourts.findIndex(
                    court => court.courtNo === index + 1
                );

            if (courtIndex >= 0) {
                return generatedCourts[courtIndex];
            }

            return {
                courtNo: index + 1,
                matchNo:
                    (appData.completedMatchesByCourt[index] || 0) + 1,
                teamA: [],
                teamB: [],
                status: "waiting"
            };
        }
    );

    updateMatchHistories();

    announceCourtMatches(appData.courts);

    renderCourts();

    updateMatchInfo();

    saveData();

    return true;

}

// ======================================
// 試合生成
// ======================================

function generateRound(
    courtIndices = getNextCourtIndices(
        appData.settings.courtCount
    )
) {

    if (courtIndices.length === 0) {
        return false;
    }

    const players =
        getSelectablePlayers();

    const candidate =
        generateBestCandidateForPlayers(
            players,
            courtIndices.length,
            courtIndices.map(index => index + 1)
        );

    return applyCandidate(
        candidate
    );

}

function announceCourtMatches(courts) {

    const playingCourts =
        courts.filter(court => court.status === "playing");

    if (playingCourts.length === 0) {
        return;
    }

    const formatPlayerName = player => {
        const name = String(player.name).trim();

        if (/^\d+$/.test(name)) {
            const number = Number(name);

            if (number >= 1 && number <= 99) {
                const readings = [
                    "",
                    "イチ",
                    "ニ",
                    "サン",
                    "ヨン",
                    "ゴ",
                    "ロク",
                    "ナナ",
                    "ハチ",
                    "キュウ"
                ];
                const tens = Math.floor(number / 10);
                const ones = number % 10;
                const tensReading =
                    tens === 0
                        ? ""
                        : tens === 1
                            ? "ジュウ"
                            : `${readings[tens]}ジュウ`;

                return `${tensReading}${readings[ones]}バン`;
            }

            return `No.${name}`;
        }

        return name.endsWith("さん")
            ? name
            : `${name}さん`;
    };

    lastMatchAnnouncements = playingCourts.map(court =>
            `第${court.courtNo}コート、` +
            `${formatPlayerName(court.teamA[0])}・` +
            `${formatPlayerName(court.teamA[1])}対、` +
            `${formatPlayerName(court.teamB[0])}・` +
            `${formatPlayerName(court.teamB[1])}`
    );

    if (appData.settings.voiceAnnouncements) {
        speakMatchAnnouncements(lastMatchAnnouncements);
    }

}

function speakMatchAnnouncements(announcements) {

    if (
        !("speechSynthesis" in window) ||
        typeof SpeechSynthesisUtterance === "undefined"
    ) {
        return false;
    }

    window.speechSynthesis.cancel();

    announcements.forEach(announcement => {
        [announcement, "繰り返します", announcement]
            .forEach(text => {
                const utterance =
                    new SpeechSynthesisUtterance(text);

                utterance.lang = "ja-JP";
                window.speechSynthesis.speak(utterance);
            });
    });

    return true;

}

function recallLastAnnouncements() {

    if (lastMatchAnnouncements.length === 0) {
        alert("再コールする対戦カードがありません。");
        return;
    }

    if (!speakMatchAnnouncements(lastMatchAnnouncements)) {
        alert("このブラウザーは音声読み上げに対応していません。");
    }

}

// ======================================
// ペア履歴更新
// ======================================

function updatePairHistory(court) {

    const pairA =
        createPairKey(
            court.teamA[0].id,
            court.teamA[1].id
        );

    const pairB =
        createPairKey(
            court.teamB[0].id,
            court.teamB[1].id
        );

    appData.pairHistory[pairA] =
        (
            appData.pairHistory[pairA]
            || 0
        ) + 1;

    appData.pairHistory[pairB] =
        (
            appData.pairHistory[pairB]
            || 0
        ) + 1;

}

// ======================================
// 対戦履歴更新
// ======================================

function updateOpponentHistory(court) {

    court.teamA.forEach(a => {

        court.teamB.forEach(b => {

            const key =
                createPairKey(
                    a.id,
                    b.id
                );

            appData.opponentHistory[key] =
                (
                    appData.opponentHistory[key]
                    || 0
                ) + 1;

        });

    });

}

// ======================================
// コート履歴更新
// ======================================

function updateCourtHistory(
    court
) {

    const players = [

        ...court.teamA,

        ...court.teamB

    ];

    players.forEach(player => {

        if (
            !appData.courtHistory[
                player.id
            ]
        ) {

            appData.courtHistory[
                player.id
            ] = [];

        }

        appData.courtHistory[
            player.id
        ]
        .push(
            court.courtNo
        );

        player.lastCourt =
            court.courtNo;

        player.lastMatchNo =
            court.matchNo || appData.currentMatch;

    });

}

// ======================================
// 全履歴更新
// ======================================

function updateMatchHistories() {

    const playingCourts =
        appData.courts.filter(
            court => court.status === "playing"
        );

    playingCourts.forEach(
        court => {

            updatePairHistory(
                court
            );

            updateOpponentHistory(
                court
            );

            updateCourtHistory(
                court
            );

        }
    );

    appData.roundHistory.push({

        round:
            appData.currentMatch,

        courts: deepCopy(playingCourts),

        timestamp:
            Date.now()

    });

}

// ======================================
// 個別進行
// ======================================

function createNextCourtRound(
    courtIndex
) {

    const currentCourt =
        appData.courts[courtIndex];

    if (
        !currentCourt ||
        currentCourt.status === "playing"
    ) {
        return false;
    }

    if (ensureMatchCapacity(1) === 0) {
        return false;
    }

    const nextMatchNo =
        (appData.completedMatchesByCourt[courtIndex] || 0) + 1;

    const availablePlayers =
        getAvailablePlayersForCourt(
            courtIndex
        );

    const candidate =
        generateBestCandidateForPlayers(
            availablePlayers,
            1,
            [courtIndex + 1]
        );

    if(
        !candidate
    ){

        return false;
    }

    appData.courts[courtIndex] = {
        ...candidate.courts[0],
        courtNo: courtIndex + 1,
        matchNo: nextMatchNo
    };

    updatePairHistory(
        appData.courts[courtIndex]
    );

    updateOpponentHistory(
        appData.courts[courtIndex]
    );

    updateCourtHistory(
        appData.courts[courtIndex]
    );

    announceCourtMatches([
        appData.courts[courtIndex]
    ]);

    renderCourts();

    updateMatchInfo();

    saveData();

    return true;

}

// ======================================
// part6終了
//
// 次:
// part7/7
//
// ・起動時復元
// ・スコア設定復元
// ・待機選手復元
// ・自動保存
// ・PWA最終処理
// ・初回試合作成補助
// ・最終初期化
//
// ======================================
// ======================================
// part7 / 7
// 起動復元
// 自動保存
// PWA補助
// 最終初期化
// ======================================

// ======================================
// 起動時コート復元
// ======================================

function restoreCourts() {

    if (
        !appData.courts ||
        appData.courts.length === 0
    ) {

        return;

    }

    renderCourts();

}

// ======================================
// 起動時待機選手復元
// ======================================

function restoreBench() {

    const bench =
        document.getElementById(
            "benchContainer"
        );

    if (!bench) {
        return;
    }

    bench.style.display = "none";

}

// ======================================
// 試合情報復元
// ======================================

function restoreMatchInfo() {

    updateMatchInfo();

}

// ======================================
// 自動保存OFF時
// ======================================

window.addEventListener(
    "beforeunload",
    () => {

        if (
            !appData.settings.autoSave
        ) {

            localStorage.removeItem(
                STORAGE_KEY
            );

        }

    }
);

// ======================================
// スコア設定検証
// ======================================

function validateScoreSettings() {

    const s =
        appData.scoreSettings;

    s.pairPenalty =
        Math.max(
            0,
            Number(s.pairPenalty || 500)
        );

    s.opponentPenalty =
        Math.max(
            0,
            Number(s.opponentPenalty || 300)
        );

    s.playBalanceBonus =
        Math.max(
            0,
            Number(s.playBalanceBonus || 100)
        );

    s.consecutivePlayPenalty =
        Math.max(
            0,
            Number(
                s.consecutivePlayPenalty || 50
            )
        );

    s.levelBonus =
        Math.max(
            0,
            Number(s.levelBonus || 100)
        );

    s.mixBonus =
        Math.max(
            0,
            Number(s.mixBonus || 100)
        );

    s.courtChangeBonus =
        Math.max(
            0,
            Number(
                s.courtChangeBonus || 50
            )
        );

    s.playCountGapThreshold =
        Math.max(
            1,
            Math.floor(
                Number(s.playCountGapThreshold) || 5
            )
        );

    s.searchCount =
        Math.max(
            100,
            Number(
                s.searchCount || 1000
            )
        );

}

// ======================================
// プレイヤーデータ補完
// ======================================

function normalizeParticipants() {

    appData.participants =
        appData.participants.filter(
            player =>
                player &&
                typeof player === "object" &&
                !Array.isArray(player)
        );

    appData.participants.forEach(
        (player, index) => {

            if (player.id == null) {
                player.id = generateId();
            }

            if (player.name == null) {
                player.name = `プレイヤー${index + 1}`;
            }

            if (player.gender == null) {
                player.gender = "";
            }

            if (
                player.playCount == null
            ) {
                player.playCount = 0;
            }

            if (
                player.restCount == null
            ) {
                player.restCount = 0;
            }

            if (
                player.consecutivePlay == null
            ) {
                player.consecutivePlay = 0;
            }

            if (
                player.consecutiveRest == null
            ) {
                player.consecutiveRest = 0;
            }

            if (
                player.forceRest == null
            ) {
                player.forceRest = false;
            }

            if (
                player.level == null
            ) {
                player.level = 2;
            }

            if (
                player.lastCourt == null
            ) {
                player.lastCourt = null;
            }

            if (player.lastMatchNo == null) {
                player.lastMatchNo = 0;
            }

        }
    );

}

// ======================================
// データ補完
// ======================================

function normalizeData() {

    if (
        !appData ||
        typeof appData !== "object" ||
        Array.isArray(appData)
    ) {
        appData = {};
    }

    const defaults = createDefaultData();
    const savedData = appData;
    const savedSettings =
        savedData.settings &&
        typeof savedData.settings === "object" &&
        !Array.isArray(savedData.settings)
            ? savedData.settings
            : {};
    const savedScoreSettings =
        savedData.scoreSettings &&
        typeof savedData.scoreSettings === "object" &&
        !Array.isArray(savedData.scoreSettings)
            ? savedData.scoreSettings
            : {};
    const normalizedSettings = {
        ...defaults.settings,
        ...savedSettings
    };
    const normalizedCourts =
        Array.isArray(savedData.courts)
            ? savedData.courts.filter(
                court =>
                    court &&
                    typeof court === "object" &&
                    !Array.isArray(court) &&
                    Array.isArray(court.teamA) &&
                    Array.isArray(court.teamB)
            )
            : [];
    const normalizedCourtCount = Math.max(
        1,
        Math.floor(Number(normalizedSettings.courtCount) || 1)
    );
    const inferredCompletedMatches = Array.from(
        { length: normalizedCourtCount },
        (_, index) => {
            const court =
                normalizedCourts.find(
                    item => Number(item.courtNo) === index + 1
                ) || normalizedCourts[index];

            if (!court) {
                return 0;
            }

            const currentCourtMatch =
                Number(court.matchNo) ||
                Number(savedData.currentMatch) ||
                0;

            return Math.max(
                0,
                currentCourtMatch -
                    (court.status === "playing" ? 1 : 0)
            );
        }
    );
    const savedCompletedMatches =
        Array.isArray(savedData.completedMatchesByCourt)
            ? savedData.completedMatchesByCourt
            : inferredCompletedMatches;
    const normalizedCompletedMatches = Array.from(
        { length: normalizedCourtCount },
        (_, index) => Math.max(
            0,
            Math.floor(
                Number(
                    savedCompletedMatches[index] ??
                    inferredCompletedMatches[index]
                ) || 0
            )
        )
    );
    const completedMatchTotal =
        normalizedCompletedMatches.reduce(
            (total, count) => total + count,
            0
        );
    const activeMatchTotal =
        normalizedCourts.filter(
            court => court.status === "playing"
        ).length;

    appData = {
        ...defaults,
        ...savedData,
        participants: Array.isArray(savedData.participants)
            ? savedData.participants
            : [],
        settings: normalizedSettings,
        scoreSettings: {
            ...defaults.scoreSettings,
            ...savedScoreSettings
        },
        currentMatch: Number.isFinite(savedData.currentMatch)
            ? savedData.currentMatch
            : defaults.currentMatch,
        currentRoundGenerated:
            typeof savedData.currentRoundGenerated === "boolean"
                ? savedData.currentRoundGenerated
                : defaults.currentRoundGenerated,
        courts: normalizedCourts,
        matchTarget: Math.max(
            completedMatchTotal + activeMatchTotal,
            Math.floor(
                Number(savedData.matchTarget) ||
                Number(normalizedSettings.totalMatches) ||
                defaults.settings.totalMatches
            )
        ),
        matchTargetIncrement: Math.max(
            1,
            Math.floor(
                Number(savedData.matchTargetIncrement) ||
                Number(normalizedSettings.totalMatches) ||
                defaults.settings.totalMatches
            )
        ),
        continuationPromptHandledForTarget:
            Math.max(
                0,
                Math.floor(
                    Number(
                        savedData.continuationPromptHandledForTarget
                    ) || 0
                )
            ),
        completedMatchesByCourt: normalizedCompletedMatches,
        participantsHistory:
            savedData.participantsHistory &&
            typeof savedData.participantsHistory === "object" &&
            !Array.isArray(savedData.participantsHistory)
                ? savedData.participantsHistory
                : {},
        pairHistory:
            savedData.pairHistory &&
            typeof savedData.pairHistory === "object" &&
            !Array.isArray(savedData.pairHistory)
                ? savedData.pairHistory
                : {},
        opponentHistory:
            savedData.opponentHistory &&
            typeof savedData.opponentHistory === "object" &&
            !Array.isArray(savedData.opponentHistory)
                ? savedData.opponentHistory
                : {},
        courtHistory:
            savedData.courtHistory &&
            typeof savedData.courtHistory === "object" &&
            !Array.isArray(savedData.courtHistory)
                ? savedData.courtHistory
                : {},
        roundHistory: Array.isArray(savedData.roundHistory)
            ? savedData.roundHistory
            : []
    };

    normalizeParticipants();

    validateScoreSettings();

}

// ======================================
// 起動後処理
// ======================================

function postInitialize() {

    normalizeData();

    restoreSettings();

    restoreCourts();

    restoreBench();

    restoreMatchInfo();

    applyDarkMode();

}

// ======================================
// 試合進行方式同期
// ======================================

document.addEventListener(
    "change",
    function(event){

        if (
            event.target.id ===
            "matchPlayMode"
        ) {

            appData.settings.playMode =
                event.target.value;

            const playMode =
                document.getElementById(
                    "playMode"
                );

            if (playMode) {

                playMode.value =
                    event.target.value;

            }

            updateProgressControls();

            renderCourts();

            updateMatchInfo();

            saveData();

        }

    }
);

// ======================================
// デバッグ補助
// ======================================

window.appData = appData;

window.generateRound =
    generateRound;

window.generateBestCandidate =
    generateBestCandidate;



// ======================================
// 完了
// ダブルス対戦管理
// app.js 完全版 終了
// ======================================
