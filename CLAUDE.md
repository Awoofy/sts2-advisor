# STS2 Advisor

Slay the Spire 2 のリアルタイム戦闘アドバイザー Web アプリ。
STS2MCP mod (localhost:15526) からゲーム状態を取得し、最適なプレイを提案する。

## プロジェクト概要

- **目的**: STS2 プレイ中にセカンドモニタ/ブラウザで最適なプレイをリアルタイム提案
- **ユーザー**: 開発は macOS、ゲームプレイは Windows 11 (メイン) / Steam Deck
- **技術**: React 18 + TypeScript + Vite + Tailwind CSS v4
- **API**: STS2MCP mod の REST API (GET/POST `localhost:15526/api/v1/singleplayer`)

## コーディング規約

- **言語**: TypeScript strict モード。`any` 型は禁止
- **UI テキスト**: 日本語（ユーザー向けメッセージ、アドバイス文）
- **コード/コメント**: 英語（変数名、関数名、コメント）
- **コミットメッセージ**: 英語、Conventional Commits 形式
- **スタイリング**: Tailwind CSS のユーティリティクラスのみ使用。カスタム CSS は `src/index.css` のテーマ定義のみ
- **コンポーネント**: 関数コンポーネント + React Hooks。クラスコンポーネント禁止
- **状態管理**: React hooks (useState/useEffect) のみ。外部ライブラリ不要
- **テスト**: Vitest。ロジック層 (`src/logic/`) は必ずテストを書く

## ディレクトリ構成

```
src/
├── api/           # STS2MCP API クライアント
│   └── sts2client.ts
├── types/         # TypeScript 型定義
│   └── gameState.ts
├── hooks/         # React カスタムフック
│   └── useGameState.ts    # ゲーム状態ポーリング (1.5秒間隔)
├── components/    # UI コンポーネント
│   ├── Dashboard.tsx       # state_type で画面切替するメインハブ
│   ├── PlayerStatus.tsx    # HP/Energy/Block/Gold/バフ表示
│   ├── HandDisplay.tsx     # 手札カード一覧
│   ├── EnemyPanel.tsx      # 敵 HP/Block/インテント
│   ├── CombatAdvisor.tsx   # 戦闘アドバイス表示
│   ├── MapView.tsx         # マップノード推奨
│   ├── RewardPicker.tsx    # カード報酬/休憩/ショップ/イベント
│   └── ConnectionStatus.tsx # API 接続状態
├── logic/         # ビジネスロジック（UIに依存しない純粋関数）
│   ├── damageCalculator.ts  # ダメージ計算・キルライン
│   ├── combatAnalyzer.ts    # 脅威評価・推奨プレイ順序
│   └── advisorEngine.ts     # マップ/報酬/休憩/ショップ助言
├── test/          # テストヘルパー
│   ├── setup.ts             # Vitest セットアップ
│   └── mockGameState.ts     # モックゲーム状態データ
└── main.tsx       # エントリポイント
```

## 新しいファイルを作る時のルール

- **コンポーネント**: `src/components/` に配置。Props を型定義して受け取る
- **ロジック**: `src/logic/` に配置。UIに依存せず、純粋関数で書く。**必ず `.test.ts` を作る**
- **型定義**: `src/types/gameState.ts` に追加（STS2MCP のレスポンスに対応する型）
- **フック**: `src/hooks/` に配置
- **テスト**: ロジックと同じディレクトリに `*.test.ts` として配置
- **モックデータ**: `src/test/mockGameState.ts` に追加

## STS2MCP API

### GET /api/v1/singleplayer?format=json
ゲーム状態全体を返す。`state_type` フィールドで現在のシーンを判定:
- 戦闘: `monster`, `elite`, `boss`, `hand_select`
- ナビゲーション: `map`
- 報酬: `card_reward`, `combat_rewards`, `card_select`, `relic_select`
- 場所: `shop`, `rest_site`, `event`, `treasure`
- その他: `overlay`, `menu`

### POST /api/v1/singleplayer
JSON body で `action` を指定してアクション実行:
- `play_card` (card_index, target?)
- `end_turn`
- `use_potion` (slot, target?)
- `choose_map_node` (index)
- `proceed`
- 他多数（詳細は STS2MCP の README 参照）

## コマンド

```bash
npm run dev        # 開発サーバー起動 (localhost:3000)
npm run build      # プロダクションビルド (tsc + vite build)
npm run lint       # ESLint 実行
npm test           # テスト実行 (vitest run)
npm run test:watch # テスト監視モード
```

## ゲーム知識: Slay the Spire 2

### キャラクター (5体)

| キャラ | 開始レリック | 固有リソース | アーキタイプ |
|--------|-------------|-------------|-------------|
| Ironclad | Burning Blood (戦闘後6回復) | — | Strength スケーリング / Exhaust エンジン / Barricade Block |
| Silent | Ring of the Snake (T1に+2ドロー) | — | Poison / Shiv スパム / **Sly**/Discard チェーン |
| Defect | — | Orbs, Focus | Lightning/Frost/Dark/Plasma/**Glass** Orb + Focus |
| Regent | Divine Right (戦闘開始時3 Stars) | **Stars** | Stars 蓄積 + Bombardment / **Forge** + Sovereign Blade |
| Necrobinder | — | **Osty** (ミニオン) | Summon (Osty HP追加) / **Doom** / 犠牲メカニクス |

#### キャラ固有メカニクス詳細

**Silent - Sly**: Sly カードが手札から「自分のターン中に」捨てられると、**自動的にタダでプレイされる**。Discard シナジーで連鎖的にカードを回す。

**Defect - Orbs**: Orb スロットにチャネルし、毎ターンパッシブ効果。スロット満杯時に Channel すると最古の Orb が Evoke (強力効果発動+除去)。
- Lightning: パッシブ 3 DMG / Evoke 8 DMG (ランダム敵)
- Frost: パッシブ 2 Block / Evoke 5 Block
- Dark: パッシブ +6 DMG蓄積 / Evoke 蓄積ダメージを最低HP敵に
- Plasma: パッシブ +1 Energy / Evoke +2 Energy
- Glass (STS2新): AoE ダメージ
- **Focus**: 全 Orb のパッシブ/Evoke 値を増加

**Regent - Stars**: Energy とは別の第2リソース。**ターン間で消えない**（蓄積する）。カードに Energy コストと Star コストがある。Stars OR Forge のどちらかに特化すべき（両立は非推奨）。
- **Forge**: Sovereign Blade（Retain付き2コスト攻撃、初期8ダメージ）の威力を**戦闘中永続的に**加算。40-50+ ダメージまで育つ。

**Necrobinder - Osty & Doom**:
- **Osty**: 毎ターン召喚される骨の手ミニオン。初期1HP。Summon キーワードで HP 追加。Block が割れた後の超過ダメージを Osty が吸収。**Block と違いターン間で減らない。**
- **Doom**: 敵に付与するデバフ。敵の Doom >= 敵の現在HP になると、**敵の次のターン終了時に即死**。ただし死ぬ前に1回行動される（Poison と異なる点）。

### ダメージ計算式（正確な計算順序）

```
Step 1: base = カード記載ダメージ
Step 2: base += Strength (加算。マルチヒットでは各ヒットに加算)
Step 3: base += Vigor (次の Attack のみ、消費される)
Step 4: if Weak(自分): base = floor(base * 0.75)
Step 5: if Vulnerable(敵): base = floor(base * 1.5)
Step 6: final_damage = max(0, base)
Step 7: hp_loss = max(0, final_damage - enemy.block)
```

**重要**: 乗算は加算の後。例: Strength 2 + Strike(6) on Vuln = floor((6+2)*1.5) = 12
**Weak の丸め注意**: 5x3 攻撃 + Weak = floor(5*0.75)*3 = 3*3 = 9 (ヒットごとに切り捨て)
**Block 計算**: Dexterity は Block カードに加算（Strength と同じ仕組み）

### 主要キーワード

#### カードキーワード
| キーワード | 効果 |
|-----------|------|
| Exhaust | 使用後、除外（戦闘中デッキから消える） |
| Ethereal | ターン終了時に手札にあれば Exhaust |
| Retain | ターン終了時に手札に残る |
| Innate | 戦闘開始時に必ず初手に来る |
| Unplayable | プレイ不可（Exhaust で処理する） |
| X-cost | 残りエネルギーを全消費 |

#### バフ / デバフ
| キーワード | 効果 | 種類 |
|-----------|------|------|
| Strength | 攻撃ダメージ +1/pt（加算、各ヒット） | バフ |
| Dexterity | Block +1/pt（加算） | バフ |
| Vulnerable | 被ダメージ x1.5 | デバフ |
| Weak | 与ダメージ x0.75 | デバフ |
| Artifact | 次のデバフを無効化 | バフ |
| Buffer | 次の HP 減少を無効化 | バフ |
| Intangible | 全ダメージを 1 に軽減 | バフ |
| Thorns | 攻撃されたとき反射ダメージ | バフ |
| Ritual | ターン終了時 Strength 獲得 | バフ |
| Poison | ターン開始時 Poison 分ダメージ → Poison -1 | デバフ |
| Vigor | 次の Attack にボーナスダメージ（消費） | バフ |
| Plating | ターン終了時 Block 獲得、毎ターン -1 | バフ |

#### STS2 新キーワード
| キーワード | 効果 | キャラ |
|-----------|------|-------|
| **Sly** | 手札から捨てられると自動プレイ | Silent |
| **Replay** | カードがもう1回プレイされる | 共通 |
| **Doom** | Doom >= HP で次ターン終了時に即死 | Necrobinder |
| **Summon** | Osty に HP を追加 | Necrobinder |
| **Forge** | Sovereign Blade のダメージを永続加算 | Regent |
| **Glass** | AoE ダメージ Orb | Defect |
| **Smoggy** | ターンに Skill 1枚しかプレイできない | デバフ |
| **Transform** | カードを別カードに変換 | 共通 |

### 敵インテントの種類

| Intent | 意味 | アドバイザーの対応 |
|--------|------|-----------------|
| attack | ダメージ（数値表示あり） | ブロック or 先に倒す判定 |
| multi-attack | 複数回ヒット (Y x N) | **Weak が特に有効**（ヒットごとに丸め） |
| defend | ブロックを得る | 攻撃のタイミングに注意 |
| buff | 自身を強化 | 早めに倒す優先度UP |
| debuff | プレイヤーに弱体化 | Artifact 消費 or 脅威レベル引き上げ |
| attack+buff | 攻撃+バフの複合 | 最高脅威 |
| attack+debuff | 攻撃+デバフの複合 | 高脅威 |
| summon | ミニオン召喚 | 本体優先 or 雑魚処理判定 |
| sleep | 何もしない | 全力攻撃のチャンス |
| unknown | 不明 | 警戒推奨 |

### Ascension レベル (A1-A10)

全て累積（各レベルは前レベルの効果を含む）。

| Level | 効果 |
|-------|------|
| A1 | エリート出現率増加 |
| A2 | 休憩所の回復量 80% に低下 |
| A3 | 敵/宝箱のゴールド -25% |
| A4 | ポーションスロット -1 |
| A5 | 呪いカード「Ascender's Bane」でスタート |
| A6 | 休憩所の数が減少 |
| A7 | レア/アップグレード済みカードの出現率低下 |
| A8 | 全敵の HP 増加 |
| A9 | 全敵のダメージ増加 |
| A10 | Act 3 ボスが **2連戦** |

### 戦略ヒューリスティック（アドバイザーロジック用）

#### 戦闘中の判断
1. **0コストカードは最初に使う** — エネルギー効率最大化
2. **敵を倒せるなら攻撃優先** — 死んだ敵はダメージ 0
3. **パワーカードは早めに展開** — 長く場にあるほど価値が高い
4. **スキル → アタックの順** — バフ/ブロックを先に確保
5. **HP 30% 以下でブロック最優先** — 生存が最優先
6. **受けるダメージ > 15 ならブロック推奨** — 大ダメージは防ぐべき
7. **multi-attack 敵には Weak が最高効率** — ヒットごとの丸めで実質 30-40% 軽減
8. **バフ中の敵は早めに倒す** — Ritual 等のスケーリングは時間の敵

#### マップ/ラン全体の判断
9. **Act 1 はエリート狩り** — レリック獲得がラン全体を左右する
10. **エリートは HP 70% 以上で挑む** — リターンとリスクのバランス
11. **ボス前は休憩推奨（HP 80% 以下）** — 安全マージン確保
12. **デッキ 25枚超でカードスキップ考慮** — 薄いデッキは回る
13. **スケーリング > フラットダメージ** — 長期戦はスケーリングが勝つ
14. **アーキタイプは1つに絞る** — 特に Regent は Stars OR Forge
15. **Act 1 ではポーション積極使用** — HP 温存が最優先
16. **アップグレードは回復より価値が高いことが多い** — ボス戦の勝敗を分ける
