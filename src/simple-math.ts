/**
 * 自然言語で表現された四則演算（カッコ含む）を計算します
 * @param expression 計算式を含む文字列
 * @returns 計算結果（数値）
 */
export const calculateMathExpression = (expression: string): number => {
  // 式を抽出する正規表現パターン
  const mathPattern = /[+\-*/().\d\s]+/g;

  // 式を抽出
  const matches = expression.match(mathPattern);
  if (!matches || matches.length === 0) {
    throw new Error("数式が見つかりませんでした");
  }

  // 抽出された式を結合（複数マッチした場合）
  const mathExpression = matches.join("").trim();

  // 式が空の場合はエラー
  if (!mathExpression) {
    throw new Error("有効な数式が見つかりませんでした");
  }

  try {
    // evalの代わりに安全な方法で計算
    return evaluateExpression(mathExpression);
  } catch (error) {
    throw new Error(`計算エラー: ${(error as Error).message}`);
  }
};

/**
 * 文字列の数式を安全に評価します
 * @param expression 数式の文字列
 * @returns 計算結果
 */
function evaluateExpression(expression: string): number {
  // 空白を削除
  expression = expression.replace(/\s+/g, "");

  return parseExpression(expression);
}

/**
 * 次の因数（数値またはカッコで囲まれた式）を取得します
 */
function getNextFactor(expression: string, startPos: number): { nextPos: number; value: number } {
  // 空白をスキップ
  let currentPos = startPos;
  while (currentPos < expression.length && expression[currentPos] === " ") {
    currentPos++;
  }

  // 式の終わり
  if (currentPos >= expression.length) {
    return { nextPos: currentPos, value: 0 };
  }

  // カッコで始まる場合
  if (expression[currentPos] === "(") {
    // 対応する閉じカッコを探す
    let depth = 1;
    let closePos = currentPos + 1;

    while (closePos < expression.length && depth > 0) {
      if (expression[closePos] === "(") {
        depth++;
      } else if (expression[closePos] === ")") {
        depth--;
      }
      closePos++;
    }

    if (depth !== 0) {
      throw new Error("カッコが閉じられていません");
    }

    // カッコ内の式を再帰的に評価
    const innerExpression = expression.substring(currentPos + 1, closePos - 1);
    const value = parseExpression(innerExpression);

    return { nextPos: closePos, value };
  }

  // 数値の場合
  const numMatch = /^-?\d+(\.\d+)?/.exec(expression.substring(currentPos));
  if (numMatch) {
    const value = parseFloat(numMatch[0]);
    return { nextPos: currentPos + numMatch[0].length, value };
  }

  throw new Error(`無効な式です: ${expression.substring(currentPos)}`);
}

/**
 * 次の乗算・除算の項を取得します
 */
function getNextMultiplyDivideTerm(
  expression: string,
  startPos: number,
): { nextPos: number; value: number } {
  // 最初の因数を取得
  const { nextPos: pos1, value: firstFactor } = getNextFactor(expression, startPos);

  // 演算子がない場合は最初の因数を返す
  if (pos1 >= expression.length || (expression[pos1] !== "*" && expression[pos1] !== "/")) {
    return { nextPos: pos1, value: firstFactor };
  }

  // 乗算・除算を処理
  const factors = [firstFactor];
  const operators = [];
  let currentPos = pos1;

  while (currentPos < expression.length) {
    // 演算子を取得
    const op = expression[currentPos];
    if (op !== "*" && op !== "/") {
      break;
    }
    operators.push(op);

    // 次の因数を取得
    const { nextPos, value: nextFactor } = getNextFactor(expression, currentPos + 1);
    factors.push(nextFactor);

    // 位置を更新
    currentPos = nextPos;
  }

  // 乗算と除算を実行
  let result = factors[0];
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === "*") {
      result *= factors[i + 1];
    } else {
      if (factors[i + 1] === 0) {
        throw new Error("0で割ることはできません");
      }
      result /= factors[i + 1];
    }
  }

  return { nextPos: currentPos, value: result };
}

/**
 * 足し算と引き算を処理します
 */
function parseAddSubtract(expression: string): number {
  // まず乗算と除算の項を処理
  const terms = [];
  const operators = [];

  let currentPos = 0;

  // 式を項と演算子に分解
  while (currentPos < expression.length) {
    // 現在位置から始まる乗算・除算の項を抽出
    const { nextPos, value: termValue } = getNextMultiplyDivideTerm(expression, currentPos);
    terms.push(termValue);

    // 次の位置が式の終わりか確認
    if (nextPos >= expression.length) {
      break;
    }

    // 次の演算子（+か-）を取得
    const op = expression[nextPos];
    if (op !== "+" && op !== "-") {
      throw new Error(`無効な演算子: ${op}`);
    }
    operators.push(op);

    // 位置を更新
    currentPos = nextPos + 1;
  }

  // 加算と減算を実行
  let result = terms[0];
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === "+") {
      result += terms[i + 1];
    } else {
      result -= terms[i + 1];
    }
  }

  return result;
}

/**
 * 式全体を解析します
 */
function parseExpression(expression: string): number {
  return parseAddSubtract(expression);
}
