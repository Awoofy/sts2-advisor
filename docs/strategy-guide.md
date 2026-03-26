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
