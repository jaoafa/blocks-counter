(function () {
    'use strict';

    // 座標入力の追加
    var addPoint = document.getElementById('addPoint');
    addPoint.addEventListener('click', function () {
        let form = document.getElementById('blocksCounter');
        let div = document.createElement('div');
        div.classList.add('points');
        let xInput = document.createElement('input');
        let zInput = document.createElement('input');

        xInput.setAttribute('type', 'number');
        xInput.classList.add('point', 'xPoint');
        xInput.setAttribute('placeholder', 'x');
        zInput.setAttribute('type', 'number');
        zInput.classList.add('point', 'zPoint');
        zInput.setAttribute('placeholder', 'z');
        div.appendChild(xInput);
        div.appendChild(zInput);
        form.insertBefore(div, addPoint);
    });

    // リセットボタン
    var reset = document.getElementById('reset');
    reset.addEventListener('click', function () {
        var points = document.getElementsByClassName("point");
        for (let i = 0; i < points.length; i++) {
            points[i].value = "";
        }
        document.getElementById('requestTextArea').value = "";
        document.getElementById("calcBlocks").click(); // 計算しなおす
    });

    // チャンク数計算
    var calcBlocks = document.getElementById('calcBlocks');
    calcBlocks.addEventListener('click', function () {
        let result = document.getElementById('blocks');

        // 座標情報取得
        const points = getPoints('point');
        // ブロック数計算
        const blocks = calcBlockNumber(points);
        result.innerText = blocks + " Blocks";

        var blocksmsg = document.getElementById('blocksMessage');
        if (!checkBlocks(points)) {
            result.style.color = "crimson";
            blocksmsg.innerHTML = "範囲指定が不適切です。時計回りまたは反時計回りに指定してください。";
            return;
        }

        if (Math.round(blocks) !== blocks) {
            result.style.color = "orange";
            blocksmsg.innerHTML = "ブロック数が不適切(整数でない)です。範囲が正確に指定されていない可能性があります。";
        } else if (blocks >= 2500000) {
            result.style.color = "red";
            blocksmsg.innerHTML = "拡張最大制限ブロック数(2,500,000ブロック)以上です。";
        } else if (blocks >= 250000) {
            result.style.color = "tomato";
            blocksmsg.innerHTML = "初期規定ブロック数(250,000ブロック)以上です。新規登録の場合は「規定ブロック数を超える明確な理由」が必要です。";
        } else if (Math.round(blocks) == 0) {
            result.style.color = "black";
            blocksmsg.innerHTML = "範囲情報を入力してください。";
        } else {
            result.style.color = "black";
            blocksmsg.innerHTML = "特に問題はありません。";
        }
    });

    /**
     * 入力された座標情報を取得
     * @param   {string}  クラス名
     * @return  {Object}  座標情報
     */
    function getPoints(className) {
        let data = document.getElementsByClassName(className);
        let points = {
            x: [],
            z: [],
        }
        for (let i = 0; i < data.length; i = i + 2) {
            points.x.push(Number(data[i].value));
            points.z.push(Number(data[i + 1].value));
        }
        return points;
    }

    /**
     * 座標情報から指定範囲内のブロック数を計算
     * @param   {Object}  座標情報
     * @return  {number}  ブロック数
     */
    function calcBlockNumber(points) {
        let size = 0; // 面積
        let side = 0; // 辺の長さ
        let blocks = 0; // ブロック数

        let x1 = 0; // 1点目のX座標値
        let x2 = 0; // 2点目のX座標値
        let z1 = 0; // 1点目のZ座標値
        let z2 = 0; // 2点目のZ座標値

        /* 図形の面積を計算 */
        for (let i = 0; i < points.x.length; i++) {
            if ((i + 1) >= points.x.length) {
                x1 = points.x[i];
                x2 = points.x[0];
                z1 = points.z[i];
                z2 = points.z[0];
            } else {
                x1 = points.x[i];
                x2 = points.x[i + 1];
                z1 = points.z[i];
                z2 = points.z[i + 1];
            }
            // 外積を計算して加算
            size += (x1 * z2) - (x2 * z1);
        }
        size = size / 2;
        size = Math.abs(size);

        /* 図形の辺の長さを計算 */
        for (let i = 0; i < points.x.length; i++) {
            if ((i + 1) >= points.x.length) {
                side = side +
                    Math.abs(points.x[i] - points.x[0]) +
                    Math.abs(points.z[i] - points.z[0]);
            } else {
                side = side +
                    Math.abs(points.x[i] - points.x[i + 1]) +
                    Math.abs(points.z[i] - points.z[i + 1]);
            }
        }

        /* ブロック数を計算 */
        if (size > 0) {
            // ブロック数 = 面積 + (辺の長さ / 2) + 1
            blocks = size + (side / 2) + 1;
        }
        return blocks;
    }

    /**
     * 座標情報が妥当(時計回り・反時計回り)かをチェック
     * @param   {string}  座標情報
     * @return  {boolean}  妥当か
     */
    function checkBlocks(points) {
        let oldx = points.x[0];
        let oldz = points.z[0];
        let changed = null; // 変化したのがXかZか。最初はnull、XまたはZを代入
        for (let i = 1; i <= points.x.length; i++) {
            let x;
            let z;
            if (i == points.x.length) {
                x = points.x[0];
                z = points.z[0];
            } else {
                x = points.x[i];
                z = points.z[i];
            }
            if (changed == null) {
                // 最初だけ動作
                if (oldx != x && oldz == z) {
                    // Xが変わってZは変わっていない
                    console.log("[checkBlocks|FIRST] changed X, not changed Z | " + x + " " + z + " | " + oldx + " " + oldz);
                    oldx = x;
                    changed = "X";
                } else if (oldx == x && oldz != z) {
                    // Xが変わっていなくてZは変わっている
                    console.log("[checkBlocks|FIRST] not changed X, changed Z | " + x + " " + z + " | " + oldx + " " + oldz);
                    oldz = z;
                    changed = "Z";
                } else {
                    // XとZ両方変わっているもしくは両方変わっていない
                    console.log("[checkBlocks|FIRST] changed X, changed Z or... | " + x + " " + z + " | " + oldx + " " + oldz);
                    return false;
                }
            } else {
                // 最初以外動作
                if (changed == "Z" && oldx != x && oldz == z) {
                    // 前回Zが変わっていて、Xが変わってZは変わっていない
                    console.log("[checkBlocks] changed X, not changed Z | " + x + " " + z + " | " + oldx + " " + oldz);
                    oldx = x;
                    changed = "X";
                } else if (changed == "X" && oldx == x && oldz != z) {
                    // 前回Xが変わっていて、Xが変わっていなくてZは変わっている
                    console.log("[checkBlocks] not changed X, changed Z | " + x + " " + z + " | " + oldx + " " + oldz);
                    oldz = z;
                    changed = "Z";
                } else {
                    // XとZ両方変わっているもしくは両方変わっていない
                    // またはX,Zが連続して変わった
                    console.log("[checkBlocks|FIRST] changed X, changed Z or... | " + x + " " + z + " | " + oldx + " " + oldz);
                    return false;
                }
            }
        }
        console.log("[checkBlocks] allow");
        return true;
    }
})();