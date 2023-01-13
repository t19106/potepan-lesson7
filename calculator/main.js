"use strict";

const DISPLAY = document.calculator.display;
const OPERATOR = ["+", "-", "*", "/"];
const PATTERN_OP_AND_ZERO       = /[\+\-\*\/]0$/;
const PATTERN_OP_AND_NUM        = /[\+\-\*\/][0-9]$/;
const PATTERN_NUM_DOT_NUM       = /^[0-9]+\.[0-9]+/
const PATTERN_OP_NUM_DOT_NUM_BW = /[\+\-\*\/][0-9]+\.[0-9]+$/;
const PATTERN_OP_NUM_BW         = /[\+\-\*\/][0-9]+$/;

function inputNaturalNumber (btn) {
    //表示の値が「0」あるいは「エラー」（初期状態）の場合、値を入力値に置き換える
    if (DISPLAY.value === "0" || DISPLAY.value === "エラー") {
        DISPLAY.value = btn.value;
    // 表示の値が「任意の演算子」と「0」の組み合わせによる後方一致の場合、値の末尾「0」を入力値に置き換える
    // 例：「1+0」の時に「1」を入力した場合、「1+1」となる
    } else if (PATTERN_OP_AND_ZERO.test(DISPLAY.value.slice(-2)))  {
        DISPLAY.value = DISPLAY.value.slice(0, -1);
        DISPLAY.value += btn.value;
    // 通常動作
    } else {
        DISPLAY.value += btn.value;
    }
}
function inputZero (btn) {
    // 表示の値が「0」あるいは「エラー」（初期状態）の場合、入力「0」を無効にする
    if (DISPLAY.value === "0" || DISPLAY.value === "エラー") {
        return 1;
    // 表示の値が「任意の演算子」と「0」の組み合わせによる後方一致の場合、入力「0」を無効にする
    // 例：「1+0」の場合、入力「0」を無効する
    } else if (PATTERN_OP_AND_ZERO.test(DISPLAY.value.slice(-2))) {
        return 1;
    }
    // 通常動作
    DISPLAY.value += btn.value;
}
function clearCalculator () {
    DISPLAY.value = "0";
}
function getAnswer (btn) {
    // 表示の値が「エラー」の場合、入力「=」を無効にする
    if (DISPLAY.value === "エラー") {
        return 1;
    // 表示の値が「任意の演算子」による後方一致の場合、入力「=」を無効にする
    } else if (OPERATOR.includes(DISPLAY.value.slice(-1))) {
        return 1;
    // 表示の値が「.」による後方一致の場合、末尾「.」を削除してから処理をすすめる
    } else if (DISPLAY.value.endsWith(".")) {
        DISPLAY.value = DISPLAY.value.slice(0, -1);
    }
    // 計算を行う
    DISPLAY.value = eval(DISPLAY.value);
    // 答えがNaN、Infinity等に一致する場合、値を「エラー」に置き換える
    if (DISPLAY.value === "NaN" || DISPLAY.value === "Infinity") {
        DISPLAY.value = "エラー";    
    } 
}
function inputDot (btn) {
    // 表示の値を参照するに、自身が繰り返されている場合、入力「.」を無効にする
    if (DISPLAY.value.endsWith(btn.value)) {
        return 1;
    // 表示が「0」あるいは「エラー」（初期状態）の場合、値を「0.」に置き換える
    } else if (DISPLAY.value === "0" || DISPLAY.value === "エラー") {
        DISPLAY.value = "0.";
    // 表示が「任意の演算子」による後方一致の場合、値の末尾に「.0」を入力する
    // 例：「1+」の時に「.」を入力した場合、「1+0.」となる
    } else if (OPERATOR.includes(DISPLAY.value.slice(-1))) {
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
    // 表示の値を先頭から参照する際に、最初に演算子が使用されるまでに点は打たれていないが、直近で演算子が使用されて以降、点を打った後に数字が入力されている場合、入力「.」を無効にする
    // 例：「1+0.1」の場合、入力「.」を無効にする
    } else if (PATTERN_OP_NUM_DOT_NUM_BW.test(DISPLAY.value)) {
        return 1;
    // 表示の値を先頭から参照する際に、最初に演算子が使用されるまでに点は打たれていないが、直近で演算子が使用されて以降、まだ数字しか入力されていない場合、通常動作とする
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
    if (DISPLAY.value.endsWith(btn.value)) {
        return 1; 
    }
    // 表示の値が「.」による後方一致の場合、入力「任意の演算子」を無効にする
    if (DISPLAY.value.endsWith(".")) {
        return 1; 
    }
    // 表示の値が「任意の演算子を除く演算子」による後方一致の場合、値の末尾「任意の演算子を除く演算子」を入力値に置き換える
    // 例：「1+」の時に「-」を入力した場合、「1-」となる
    if (OPERATOR.includes(DISPLAY.value.slice(-1))) {
        DISPLAY.value = DISPLAY.value.slice(0, -1);
        DISPLAY.value += btn.value;
    // 通常動作
    } else {
        DISPLAY.value += btn.value;
    }
}