'use strict';

// HTML - ストップウォッチ部分
const millisecondDisplay = document.getElementById('millisecond');
const secondDisplay      = document.getElementById('second');
const minuteDisplay      = document.getElementById('minute');
const hourDisplay        = document.getElementById('hour');
// HTML - ボタン群
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
// 関数間で使用する変数
let STATE = 'startOrReset';
let TIMER_PROCESS; //タイマーの処理
let ELAPSED_MS = 0; //経過時間

// ボタンを押した時の処理
startButton.addEventListener('click', () => {
    if (STATE === 'startOrReset') {
        STATE = 'pause';
        startButton.setAttribute("disabled", true);
        resetButton.setAttribute("disabled", true);
        pauseButton.removeAttribute("disabled");
        runTimer();
    }
})
pauseButton.addEventListener('click', () => {
    if (STATE === 'pause') {
        STATE = 'startOrReset';
        startButton.removeAttribute("disabled");
        resetButton.removeAttribute("disabled");
        pauseButton.setAttribute("disabled", true);
        pauseTimer();
    }
})
resetButton.addEventListener('click', () => {
    if (STATE === 'startOrReset') {
        resetButton.setAttribute("disabled", true);
        resetTimer();
    }
})

// 関数群
function runTimer () {
    // スタートボタンを押した時の時間を入れる
    let startMs = Date.now();
    // 一時停止していたタイマーを再開する際は、一時停止していただけの時間を除外する必要がある（一番最初にスタートボタンを押した時間へと戻る）
    // そのためには、ボタンを押した時の時間から、保持していた経過時間を減算する
    startMs -= ELAPSED_MS;
    TIMER_PROCESS = setInterval(() => {
        // 1ミリ秒ごとに、開始（再開）時点Dateオブジェクトと最新Dateオブジェクトとの差分を計算する
        const nowMs = Date.now();
        ELAPSED_MS  = nowMs - startMs;
        setTimerDisplay();
    }, 10);
}
function pauseTimer () {
    clearInterval(TIMER_PROCESS);
}
function resetTimer () {
    clearInterval(TIMER_PROCESS);
    ELAPSED_MS = 0;
    resetTimerDisplay();
}
function calculateMillisecond (elapsedTime) {
    // ミリ秒数: 大元から最初の3桁を取り出す（1000で除算したときの余剰を算出する）
    // 3桁台のみ表示するので、取り出した3桁を常に100で割り続け、それを整数として返す
    let ms  = Math.floor(elapsedTime % 1000);
    ms = Math.floor(ms / 100);
    return ms;
}
function calculateSecond (elapsedTime) {
    // 秒数: ミリ秒を秒に直すのに、大元を1000で除算する
    // 60秒になってから再び0へと折り返すのに、結果を60で除算したときの余剰を算出し、それを整数として返す
    const s  = Math.floor(elapsedTime / 1000) % 60;
    return s;
}
function calculateMinute (elapsedTime) {
    // 分数: 秒から分にするので、秒の結果を60で除算する
    // 60分になってから再び0へと折り返すのに、結果を60で除算したときの余剰を算出し、それを整数として返す
    const m = Math.floor(((elapsedTime / 1000) / 60) % 60);
    return m;
}
function calculateHour (elapsedTime) {
    // 時間: 分をさらに60で除算する
    // 周期を設定しない（どんどん増えていく）ので、余剰を求めず、除算結果を整数として返す
    const h = Math.floor(((elapsedTime / 1000) / 60) / 60);
    return h;
}
function setTimerDisplay () {
    const ms = calculateMillisecond(ELAPSED_MS);
    const s  = calculateSecond(ELAPSED_MS);
    const m  = calculateMinute(ELAPSED_MS);
    const h  = calculateHour(ELAPSED_MS);
    millisecondDisplay.innerHTML = ms;
    secondDisplay.innerHTML      = s;
    minuteDisplay.innerHTML      = m;
    hourDisplay.innerHTML        = h;
}
function resetTimerDisplay () {
    millisecondDisplay.innerHTML = 0;
    secondDisplay.innerHTML      = 0;
    minuteDisplay.innerHTML      = 0;
    hourDisplay.innerHTML        = 0;
}