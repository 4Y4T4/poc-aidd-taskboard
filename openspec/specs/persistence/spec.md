# persistence Specification

## Purpose

タスクをブラウザの localStorage に保存し、起動時に復元する仕組みと、保存データが不正な場合の扱いを定める。

## Requirements

### Requirement: 保存キーと保存形式

システムは、タスクを localStorage のキー `taskboard:tasks` に、`{"version": 1, "tasks": [...]}` の形式の JSON で SHALL 保存する。`tasks` の各要素は task-model のタスクで、`assignee`・`priority`・`dueDate` は設定されている場合だけ保存する。

#### Scenario: 付加属性を持つタスクを保存する

- **GIVEN** 担当者が「山田」、優先度が高、期限が `2026-10-31` のタスクがある
- **WHEN** タスクを保存する
- **THEN** `taskboard:tasks` に `version: 1` と、`assignee: "山田"`・`priority: "high"`・`dueDate: "2026-10-31"` を持つタスクが保存される

#### Scenario: 付加属性を持たないタスクを保存する

- **GIVEN** 担当者・優先度・期限を設定していないタスクがある
- **WHEN** タスクを保存する
- **THEN** 保存されたタスクは `assignee`・`priority`・`dueDate` の項目を持たない

### Requirement: 追加・移動のたびに保存する

システムは、タスクの追加・移動のたびに、全タスクを SHALL 保存する。

#### Scenario: タスクを追加してリロードする

- **WHEN** タスクを追加してページをリロードする
- **THEN** 追加したタスクが表示される

#### Scenario: タスクを移動してリロードする

- **WHEN** タスクを完了列へ移動してページをリロードする
- **THEN** タスクは完了列に表示される

### Requirement: 起動時に復元する

システムは、起動時に保存データを読み込み、ボードに SHALL 復元する。保存データがない場合は、空のボードで開始する。

#### Scenario: 保存データがない

- **GIVEN** localStorage に `taskboard:tasks` がない
- **WHEN** ページを開く
- **THEN** 4列が空のボードが表示される

### Requirement: 以前の形式のデータを読み込む

システムは、保存形式の `version` を `1` のままとし、付加属性(`assignee`・`priority`・`dueDate`)を持たないタスクや、保留の追加前に保存された3つのステータスだけを含むデータも SHALL 読み込む。

#### Scenario: 付加属性を持たない既存データ

- **GIVEN** 付加属性の追加前に保存された、`assignee`・`priority`・`dueDate` を持たないタスクがある
- **WHEN** ページを開く
- **THEN** タスクはそのまま復元される

### Requirement: 保存データ全体が不正な場合

システムは、保存データが JSON として読めない、`version` が `1` でない、`tasks` が配列でない場合に、空のボードで SHALL 開始する。エラーは画面に表示せず、コンソールに警告を出す。保存データは次の保存時に上書きされる。

#### Scenario: JSON として読めない

- **GIVEN** `taskboard:tasks` に `"{abc"` が保存されている
- **WHEN** ページを開く
- **THEN** 空のボードが表示され、コンソールに警告が出る

#### Scenario: version が違う

- **GIVEN** `taskboard:tasks` に `{"version": 2, "tasks": []}` が保存されている
- **WHEN** ページを開く
- **THEN** 空のボードが表示され、コンソールに警告が出る

### Requirement: 一部のタスクだけが不正な場合

システムは、保存データの一部のタスクだけが有効でない場合に、不正なタスクだけを除外し、残りのタスクでボードを SHALL 復元する。除外した件数をコンソールに警告として出す。除外したタスクは次の保存時に失われ、すべてのタスクが不正な場合は空のボードで開始する。

#### Scenario: 3件のうち1件が不正

- **GIVEN** 保存データに3件のタスクがあり、1件のタイトルが空である
- **WHEN** ページを開く
- **THEN** 有効な2件だけが表示され、コンソールに1件を除外した警告が出る

### Requirement: ID が重複している場合

システムは、保存データ内で `id` が重複している場合に、配列の先頭に近いタスクを残し、後から出てくる同じ `id` のタスクを不正として SHALL 除外する。

#### Scenario: 同じ id のタスクが2件ある

- **GIVEN** 保存データに `id` が同じタスク A・B がこの順にある
- **WHEN** ページを開く
- **THEN** A だけが表示され、B は除外される

### Requirement: 有効なタスクの条件

システムは、保存データ内のタスクを、`id` が空でない文字列で、`title`・`description`・`status`・`assignee`・`priority`・`dueDate` が task-model の制約を満たし(任意の項目は項目がない場合も可)、`createdAt` が日時として解釈できる ISO 8601 形式の文字列である場合だけ SHALL 有効とする。

#### Scenario: 不正な付加属性を持つタスク

- **GIVEN** 保存データに、`priority` が `"urgent"` のタスクがある
- **WHEN** ページを開く
- **THEN** そのタスクは除外される

#### Scenario: 空の id

- **GIVEN** 保存データに、`id` が `""` のタスクがある
- **WHEN** ページを開く
- **THEN** そのタスクは除外される

### Requirement: 作成日時の判定

システムは、`createdAt` を `new Date()` で有効な日時に変換でき、かつ `toISOString()` の結果が元の文字列と一致する場合だけ、有効と SHALL 判定する。不正な日時に `toISOString()` を呼ぶと例外が発生するため、先に有効な日時かを確かめる。

#### Scenario: 日時として解釈できない作成日時

- **GIVEN** 保存データに、`createdAt` が `"abc"` のタスクがある
- **WHEN** ページを開く
- **THEN** 例外は発生せず、そのタスクは除外される

#### Scenario: ISO 8601 の形式でない作成日時

- **GIVEN** 保存データに、`createdAt` が `"2026/09/24"` のタスクがある
- **WHEN** ページを開く
- **THEN** そのタスクは除外される

### Requirement: localStorage が使えない場合

システムは、プライベートモードや容量超過などで localStorage の読み書き時に例外が発生した場合、例外を捕捉して画面の操作を SHALL 続けられるようにし、コンソールに警告を出す。その場合、リロードすると内容は失われる。

#### Scenario: 保存時に例外が発生する

- **GIVEN** localStorage への書き込みで例外が発生する
- **WHEN** タスクを追加する
- **THEN** タスクはボードに表示され、コンソールに警告が出る

### Requirement: 読み込み・保存のロジックを UI から切り離す

localStorage の読み込み・保存のロジックは、`Storage` を引数で受け取る UI から切り離した関数として SHALL 提供し、ユニットテストで確かめる。

#### Scenario: 読み込み・保存をユニットテストで確かめる

- **WHEN** `npm test` を実行する
- **THEN** データなし、データ全体が不正、一部のタスクだけが不正、`id` の重複、例外の発生、付加属性を持たない既存データ、不正な付加属性を持つタスクのテストが成功する

### Requirement: 複数のタブの間で同期しない

システムは、複数のタブで同時に開いた場合に、タブの間でデータを MUST NOT 同期する。最後に保存したタブの内容で上書きされる。

#### Scenario: 2つのタブで追加する

- **GIVEN** 2つのタブでボードを開いている
- **WHEN** タブ1でタスク A を追加し、そのあとでタブ2でタスク B を追加する
- **THEN** タブ1の表示は更新されず、保存データはタブ2の内容(B を含み、A を含まない)になる

### Requirement: サーバーに保存しない

システムは、データをサーバー側に MUST NOT 保存し、Route Handler や Server Actions を作らない。データはブラウザの localStorage にだけ保存する。

#### Scenario: タスクを追加する

- **WHEN** タスクを追加する
- **THEN** サーバーへのリクエストは発生せず、localStorage にだけ保存される
