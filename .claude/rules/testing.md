---
paths:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
---

# テストのルール

## 置き場所と対象

- テストは Vitest で書き、対象と同じディレクトリに置く。テストは2種類あり、ファイルの拡張子で実行環境が分かれる(`vitest.config.mts` の `projects`)。
    | 種類 | ファイル | 実行環境 | 対象 |
    | --- | --- | --- | --- |
    | ロジックのテスト | `*.test.ts` | `node` | UI から切り離した純粋関数(`src/lib/`・`src/components/dnd/`) |
    | コンポーネントのテスト | `*.test.tsx` | `jsdom` | コンポーネントの振る舞い |
- ロジックで押さえるべき観点は `docs/requirements.md` 6章にある。境界値や異常系の網羅はロジックのテストで行い、コンポーネントのテストで同じ組み合わせを繰り返さない。
- テストを追加したら、実装を一時的に壊すとそのテストが失敗することを確かめ、元に戻す。

## コンポーネントのテスト

- コンポーネントの振る舞いのテストには、React Testing Library(`@testing-library/react`)を優先する。`react-dom` を直接操作したり、コンポーネントの内部(state・フック・子に渡す props)を直接検証したりしない。
- ユーザーから見える操作に対する振る舞いをテストする。
    - 操作は `@testing-library/user-event` で行う(`const user = userEvent.setup()` → `await user.type(…)`・`await user.click(…)`)。`fireEvent` は user-event で再現できない場合だけ使う。
    - 要素は、ユーザーが認識する手がかりで探す。`getByRole`(アクセシブルネーム付き)を優先し、次に `getByLabelText`・`getByText` を使う。`data-testid` やクラス名で探さない。
    - 結果は、画面に表示される内容・フォーカスの位置・アクセシビリティの状態(`aria-invalid`・説明文など)・親に渡すコールバックの呼び出しで確かめる。
    - アサーションには `@testing-library/jest-dom` のマッチャー(`toHaveTextContent`・`toHaveFocus`・`toBeInvalid`・`toHaveAccessibleDescription` など)を使う。
- コールバックの props は `vi.fn()` で渡し、どの値で呼ばれたか(`toHaveBeenCalledExactlyOnceWith`)を確かめる。

## 書き方

- テスト名は、何を検証しているかが分かる日本語にする(例: `"同じ列への移動では同一の配列を返す"`、`"キャンセルを押すと onCancel を呼び、onSubmit は呼ばない"`)。関数・コンポーネントごとに `describe` でまとめる。
- 具体的な入力と、期待する出力を検証する。`expect(true).toBe(true)` のような意味のないアサーションを書かない。
- 正常系だけでなく、境界値(50/51文字など)・異常系・エラーケースを含める。
- テストのデータは `makeTask` のようなファクトリ関数で作り、各テストで変える値だけを上書きする。複数のテストで使う正規表現などは `test-patterns.ts` に置く。
- 時刻やストレージは、対象の関数の引数で差し替える。引数で差し替えられない場合だけ `vi.useFakeTimers` や `vi.spyOn` を使い、`afterEach` で元に戻す。
- モックは必要最小限にし、実際の動作に近い形で検証する(ストレージは `Map` で作った実物に近い `Storage` を渡す、など)。

## してはいけないこと

- テストを通すためだけに、本番コードにテスト用の分岐(`if (testMode)` など)や属性(`data-testid` など)を入れない。
- 期待値を実装からコピーしたマジックナンバーで埋めない。上限値などは実装の定数(`TITLE_MAX` など)を import して使う。
