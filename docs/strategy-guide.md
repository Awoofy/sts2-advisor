# STS2 攻略知識 — トッププレイヤーの戦略フレームワーク

YouTube/コミュニティのトッププレイヤーから学んだ戦略知識。
アドバイザーロジックの根拠として参照する。

## 情報ソース

### English
- **Baalorlord** — 高Ascension ラン実況、Untapped.gg とコラボでビルドガイド
- **Jorbs** — "Jobs" フレームワーク考案者、体系的な意思決定分析
- **FrostPrime** — カード評価・Tier List の定番
- **Northernlion** — 初心者向け実況、プレイ意図を言語化
- **Lifecoach** — 競技カードゲーム出身、深い分析プレイ

### 日本語
- **GAH-LINK** (note.com/gahlink) — 全キャラ A10 クリア、全カード Tier 表作成
- **シソー** (@shisooooo) — Regent A10 クリア、Stars 軸無限ループ戦略
- **リンス** (note.com/l1nc3) — Silent A10 クリア、詳細攻略記事
- **上杉真人** (@dbs_curry) — ゲームデザイナー視点分析、Necrobinder A10 クリア
- **朽尾明核** (note.com/baroque_core) — 体系的データ整理

### 日本語 Wiki
- wikiwiki.jp/sts2/ — 有志 Wiki
- kamigame.jp — 神ゲー攻略
- gamerch.com/slaythespire2 — Gamerch

---

## 1. カード評価: "Jobs" フレームワーク (Jorbs)

カードを「今のデッキに何の仕事をさせるか」で評価する。

| Job | 説明 | 重要なタイミング |
|-----|------|---------------|
| Frontloaded Damage | セットアップ不要の即ダメージ | Act 1（敵のHP低い） |
| Scaling | ターン経過で成長する力 (バフ/デバフ/パワー) | Act 2+ ボス戦 |
| Block / Mitigation | ダメージを防ぐ | 常に（特に大ダメージ敵） |
| Draw / Cycling | キーカードを引く速度 | 中〜終盤のエンジンデッキ |
| Utility / Removal | 悪いカード除去、エネルギー生成 | ラン全体 |

**トレードオフ**: Scaling を取るには Frontload を犠牲にする。
Act 1 で Frontload 2-3枚取り → Act 1 終盤〜Act 2 で Scaling にピボット。

## 2. マップルート判断

- **Act 1 前半**: 通常戦でゴールド＆カード獲得 → エリート前に強化
- **エリート**: HP が高い時のみ。レリックの主要入手源
- **休憩所**: 困難な戦闘（エリート、ボス）の前に配置
- **「負けるなら早く」** — 明らかに厳しいランにリソースを投資しない

## 3. ターンごとの判断: Damage vs Block

- **敵のインテントを最初に読む** — 最も重要な戦闘スキル
- 大ダメージ intent → **Block 優先**、残りエネルギーで攻撃
- バフ/準備 intent → **全力攻撃**、これがチャンス
- **Weak はマルチヒット敵に最高効率** — ヒットごとの丸めで実質 30-40% 軽減
- **純防御は禁物** — 大半の戦闘で敵もスケーリングする

## 4. レリック評価

最強レリックの条件:
1. **エネルギー生成** (Ice Cream がコンセンサス S-tier — 未使用エネルギー持ち越し)
2. **パッシブスケーリング** — カードプレイ不要で成長
3. **状態異常防御** — Corrosion、Afflictions 対策

**Ice Cream** と **Gambling Chip** がコミュニティ S-tier。

## 5. キャラ別アーキタイプ優先度

### Ironclad
| Tier | アーキタイプ | キーカード | 戦略 |
|------|------------|----------|------|
| S | Exhaust Loop | Corruption + Dark Embrace + Feel No Pain | Skill を 0 コストに → Exhaust でドロー＋Block＋ダメージ |
| A | Strength | Demon Form + Heavy Blade + Limit Break | Strength 倍増でワンパンチ |
| A | Block/Barricade | Barricade + Body Slam + Entrench | Block 蓄積 → Body Slam で変換 |

**Stoke が最強 Ironclad カード** (コミュニティ評価)

### Silent
| Tier | アーキタイプ | キーカード | 戦略 |
|------|------------|----------|------|
| S | Sly/Discard | Sly カード + Calculated Gamble + Tactician | Discard で Sly が自動プレイ → 無限連鎖 |
| A | Poison | Noxious Fumes + Catalyst + Corpse Explosion | Poison スタックで時間経過ダメージ |
| A | Shiv | Blade Dance + Accuracy + After Image | 0 コスト攻撃を大量生成 |

### Defect
| Tier | アーキタイプ | キーカード | 戦略 |
|------|------------|----------|------|
| S | Frost/Focus | Glacier + Defragment + Chill | Frost Orb + Focus でターン毎に大量 Block |
| A | Lightning | Electrodynamics + Storm + Thunder Strike | AoE ダメージ特化 |
| A | Dark | Doom and Gloom + Darkness | Dark Orb 蓄積 → Evoke で大ダメージ |

### Regent
| Tier | アーキタイプ | キーカード | 戦略 |
|------|------------|----------|------|
| S | Stars | Genesis + Bombardment + Hidden Cache | Stars 蓄積 → Bombardment で大ダメージ。**Stars と Forge を混ぜない** |
| A | Forge | Temper Steel + Masterwork + Sovereign Blade | Sovereign Blade を育てて毎ターン高ダメージ |

### Necrobinder
| Tier | アーキタイプ | キーカード | 戦略 |
|------|------------|----------|------|
| S | Doom | No Escape + Death's Door | Doom 蓄積 → HP 以上で即死 |
| A | Summon/Osty | Bodyguard + Unleash | Osty HP 追加 → Unleash で攻撃 + 壁 |

## 6. Act ごとの意識

### Act 1
- Frontload ダメージを確保
- エリート 1-2 体倒してレリック獲得
- ポーション積極使用（HP 温存）
- カード除去でデッキスリム化開始

### Act 2
- Scaling カードへピボット
- アーキタイプを 1 つに絞る
- AoE が重要になる
- ショップでカード除去 + キーレリック

### Act 3 + Boss
- デッキ完成を目指す
- ボス前に休憩で HP 確保（80% 以下なら）
- A10 は 2 連戦ボス — Scaling + 持久力の両立必須
- ポーション全投入

---

## 7. STS2 新システム（STS1 からの変更点）

| 変更 | 戦略的影響 |
|------|----------|
| **Ancient（ボスレリック代替）** | 「Energy レリック」を単純に取る時代ではない。強力だがトレードオフあり。デッキ方向性に合うものを選ぶ |
| **Enchantment システム** | カードに永続的な修飾子を付与（ダブルエッジの場合も）。1枚に重ねがけで固有コンボが発生 |
| **Sly キーワード** | Silent の性質が STS1 の Poison/Shiv 中心から Discard エンジンに完全シフト |
| **Doom メカニクス** | HP を削り切らず「処刑閾値」で敵を倒す。コントロール型の新プレイスタイル |
| **二重リソース (Regent)** | Energy + Stars の 2 リソース管理。STS1 に無い次元の判断要素 |
| **Co-op マルチプレイヤー** | 敵 HP がプレイヤー数でスケール。ボスに強化防御メカニクス |
| **敵が全体的に強化** | HP 増加。ただしシナジーも強力でスノーボールしやすい |
| **新状態異常** | Corrosion、Afflictions は STS1 に無い新脅威 |

## 8. エンコード可能な判断ルール（アドバイザーロジック用）

### カードピック
- **必ず**: Strike と Defend は可能な限り除去する（ショップ、Ancient、イベント）
- **必ず**: Act 1 ではダメージカードを優先 — 「Strike だけではエリート/ボスに勝てない」
- **禁止**: 全てのカード報酬を取る — デッキ肥大が初心者の最大の失敗
- **原則**: 「今」の戦略を改善するカードだけ取る。「後で使えるかも」は取らない
- **原則**: 小さく集中したデッキは常に大きく散漫なデッキに勝る

### 戦闘中
- **もし** 大ダメージ intent **なら** Block 優先、残りで攻撃
- **もし** バフ/準備 intent **なら** ダメージ最大化
- **もし** 戦闘が長引いている **なら** Scaling 不足（純防御は負ける）

### ルート
- **もし** Act 1 序盤 **なら** エリート前に通常戦で強化
- **もし** HP 高い + ダメージ計画あり **なら** エリートに挑む
- **もし** HP 低い **なら** 休憩所ルート、エリート回避
- **禁止**: エリートを完全スキップ — レリックが重要すぎる

### キャラ固有
- **Ironclad**: Corruption + Dark Embrace + Feel No Pain = 聖三位一体。Exhaust 軸なら Skill カード優先
- **Silent**: Sly キーワード + 0 コスト Discard カード (Prepared, Hidden Daggers) = コアエンジン
- **Necrobinder**: Osty を守ることが最優先。Act 1 で Doom 付与カードを優先
- **Regent**: Stars と Forge を序盤で混ぜない — 1 軸にコミット

## 9. リファレンスリンク

### English
- [Untapped.gg — "Jobs" フレームワーク](https://sts2.untapped.gg/en/articles/slay-the-spire-deckbuilding-strategy-solving-the-spire-with-jobs)
- [Untapped.gg — Core Deckbuilding Concepts](https://sts2.untapped.gg/en/articles/core-deckbuilding-concepts-in-slay-the-spire)
- [Mobalytics — Card Tier List](https://mobalytics.gg/slay-the-spire-2/tier-lists/cards)
- [Mobalytics — Relic Tier List](https://mobalytics.gg/slay-the-spire-2/tier-lists/relics)

### 日本語
- [GAH-LINK — 全キャラA10 Tier表](https://note.com/gahlink/n/nd6f537b73aba)
- [リンス — サイレントA10攻略](https://note.com/l1nc3/n/na787f022cae9)
- [wikiwiki.jp — STS2攻略Wiki](https://wikiwiki.jp/sts2/)
