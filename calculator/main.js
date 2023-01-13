"use strict";

const DISPLAY = document.calculator.display;
const OPERATOR = ["+", "-", "*", "/"];
const PATTERN_OP_AND_ZERO       = /[\+\-\*\/]0$/;
const PATTERN_NUM_DOT_NUM       = /^[0-9]+\.[0-9]+/
const PATTERN_OP_NUM_DOT_NUM_BW = /[\+\-\*\/][0-9]+\.[0-9]+$/;
const PATTERN_OP_NUM_BW         = /[\+\-\*\/][0-9]+$/;

const ERROR_VALUE = "エラー";
const INITIAL_VALUE = "0";

// 各機能の仕様については、コード中のコメントをご覧ください。
// 下記、本電卓に実装されていない仕様を説明します。
// -------------------------------------------------------- //
// 1. 通常の電卓では、演算子の後に「=」を入力すると、演算子の前に入力された数字を演算子の後に入力されていることを前提に計算されるが、この機能は持ち合わせていない
//    例：本電卓では「3+」の後に「=」を入力しても、入力「=」は無効になる（通常の電卓では「6」が表示される）
// 2. 通常の電卓では、元々の式の結果を求めた後、新たに演算子を入力するまでに「=」を連続して入力すると、結果に対して、式の演算子と、演算子の後に入力された数字を元に新たに計算を行うが、
//    この機能は持ち合わせていない
//    例：本電卓では「3+3」の後に「=」を入力して「9」を求めた場合、その後に連続して「=」を入力しても文字列「9」を評価し続ける（通常の電卓では「12」が表示される）
// -------------------------------------------------------- //
// 補足：本電卓は、Javascriptの仕様により発生する丸め誤差には対応していない

function inputNaturalNumber (btn) {
    //表示の値が「0」（初期状態）あるいは「エラー」の場合、値を入力値に置き換える
    if (isInitialOrErrorValue(DISPLAY.value)) {
        DISPLAY.value = btn.value;
    // 表示の値が「任意の演算子」と「0」の組み合わせによる後方一致の場合、値の末尾「0」を入力値に置き換える
    // 例：「1+0」の時に「1」を入力した場合、「1+1」となる
    } else if (endsWithOperatorAndZero(DISPLAY.value))  {
        DISPLAY.value = DISPLAY.value.slice(0, -1);
        DISPLAY.value += btn.value;
    // 通常動作
    } else {
        DISPLAY.value += btn.value;
    }
}
function inputZero (btn) {
    // 表示の値が「0」（初期状態）の場合、入力「0」を無効にする
    if (isInitialValue(DISPLAY.value)) {
        return 1;
    // 表示の値が「エラー」の場合、値を「0」にする
    } else if (isErrorValue(DISPLAY.value)) {
        DISPLAY.value = "0";
    // 表示の値が「任意の演算子」と「0」の組み合わせによる後方一致の場合、入力「0」を無効にする
    // 例：「1+0」の場合、入力「0」を無効する
    } else if (endsWithOperatorAndZero(DISPLAY.value)) {
        return 1;
    }
    // 通常動作
    DISPLAY.value += btn.value;
}
function inputDoubleZero (btn) {
    // 表示の値が「0」（初期状態）あるいは「エラー」の場合、入力「0」を無効にする
    if (isInitialOrErrorValue(DISPLAY.value)) {
        return 1;
    // 表示の値が「任意の演算子」による後方一致の場合、入力「00」を無効にする
    } else if (endsWithOperator(DISPLAY.value)) {
        return 1;
    // 表示の値が「任意の演算子」と「0」の組み合わせによる後方一致の場合、入力「00」を無効にする
    // 例：「1+0」の場合、入力「00」を無効する
    } else if (endsWithOperatorAndZero(DISPLAY.value)) {
        return 1;
    }
    // 通常動作
    DISPLAY.value += btn.value;
}
function getAnswer (btn) {
    // 表示の値が「エラー」の場合、入力「=」を無効にする
    if (isErrorValue(DISPLAY.value)) {
        return 1;
    // 表示の値が「任意の演算子」による後方一致の場合、入力「=」を無効にする
    } else if (endsWithOperator(DISPLAY.value)) {
        return 1;
    // 表示の値が「.」による後方一致の場合、末尾「.」を削除してから処理をすすめる
    } else if (endsWithDot(DISPLAY.value)) {
        DISPLAY.value = DISPLAY.value.slice(0, -1);
    }
    // 計算を行う
    DISPLAY.value = eval(DISPLAY.value);
    // 答えがNaN、Infinity等に一致する場合、値を「エラー」に置き換える
    if (DISPLAY.value === "NaN" || DISPLAY.value === "Infinity") {
        DISPLAY.value = ERROR_VALUE;    
    } 
}
function inputDot (btn) {
    // 表示の値を参照するに、自身が繰り返されている場合、入力「.」を無効にする
    if (isRepeated(DISPLAY.value, btn.value)) {
        return 1;
    // 表示が「0」（初期状態）あるいは「エラー」の場合、値を「0.」に置き換える
    } else if (isInitialOrErrorValue(DISPLAY.value)) {
        DISPLAY.value = "0.";
    // 表示が「任意の演算子」による後方一致の場合、値の末尾に「.0」を入力する
    // 例：「1+」の時に「.」を入力した場合、「1+0.」となる
    } else if (endsWithOperator(DISPLAY.value)) {
        DISPLAY.value += 0;
        DISPLAY.value += btn.value;
    // 表示の値を先頭から参照する際に、点が打たれている後に数字が入力されている時、
    } else if (PATTERN_NUM_DOT_NUM.test(DISPLAY.value)) {
        // 直近で演算子が使用されて以降、点を打った後に数字が入力されている場合、入力「.」を無効にする
        // 例：「0.1+0.1」の場合、入力「.」を無効にする
        if (PATTERN_OP_NUM_DOT_NUM_BW.test(DISPLAY.value)) {
            return 1;
        } else {
            // 直近で演算子が使用されて以降、まだ数字しか入力されていない場合、通常動作とする
            // 例：「0.1+0」の場合、「0.1+0.」となる
            if (PATTERN_OP_NUM_BW.test(DISPLAY.value)) {
                DISPLAY.value += btn.value;
            } else {
                // 演算子がまだ使用されていない場合、入力「.」を無効にする
                // 例：「0.1」の場合、入力「.」を無効にする
                return 1;
            }
        } 
    // 表示の値を先頭から参照する際に、最初に演算子が使用されるまでに点は打たれていないが、
    // 直近で演算子が使用されて以降、点を打った後に数字が入力されている場合、入力「.」を無効にする
    // 例：「1+0.1」の場合、入力「.」を無効にする
    } else if (PATTERN_OP_NUM_DOT_NUM_BW.test(DISPLAY.value)) {
        return 1;
    // 表示の値を先頭から参照する際に、最初に演算子が使用されるまでに点は打たれていないが、
    // 直近で演算子が使用されて以降、まだ数字しか入力されていない場合、通常動作とする
    // 例：「1+0」の場合、「1+0.」となる
    } else if (PATTERN_OP_NUM_BW.test(DISPLAY.value)) {
            DISPLAY.value += btn.value;
    // 通常動作
    } else {
        DISPLAY.value += btn.value;
    }
}
function inputOperator (btn) {
    // 自身が繰り返されている場合、入力「任意の演算子」を無効にする
    if (isRepeated(DISPLAY.value, btn.value)) {
        return 1; 
    }
    // 表示の値が「.」による後方一致の場合、入力「任意の演算子」を無効にする
    if (endsWithDot(DISPLAY.value)) {
        return 1; 
    }
    // 表示の値が「任意の演算子を除く演算子」による後方一致の場合、値の末尾「任意の演算子を除く演算子」を入力値に置き換える
    // 例：「1+」の時に「-」を入力した場合、「1-」となる
    if (endsWithOperator(DISPLAY.value)) {
        DISPLAY.value = DISPLAY.value.slice(0, -1);
        DISPLAY.value += btn.value;
    // 通常動作
    } else {
        DISPLAY.value += btn.value;
    }
}
function clearCalculator () {
    initialize();
}
// 判定処理
function isInitialOrErrorValue (_value) {
    return DISPLAY.value === INITIAL_VALUE || DISPLAY.value === ERROR_VALUE;
}
function isInitialValue (_value) {
    return DISPLAY.value === INITIAL_VALUE;
}
function isErrorValue (_value) {
    return DISPLAY.value === ERROR_VALUE;
}
function endsWithOperatorAndZero (_value) {
    return PATTERN_OP_AND_ZERO.test(_value.slice(-2));
}
function endsWithOperator (_value) {
    return OPERATOR.includes(DISPLAY.value.slice(-1));
}
function endsWithDot (_value) {
    return DISPLAY.value.endsWith(".");
}
function isRepeated (_display, _btn) {
    return _display.endsWith(_btn);
}
// 初回時の電卓初期化
function initialize () {
    DISPLAY.value = INITIAL_VALUE;
}
initialize();