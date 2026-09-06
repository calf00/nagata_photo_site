# Nagata Koshi — Photography

ビルド不要のHTML / CSS / JavaScript製ポートフォリオです。
`index.html`をブラウザで開くか、このフォルダで次を実行してください。

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

その後 http://localhost:8000/ を開きます。

## 絞りの演出

- GSAP / ScrollTrigger 3.13.0 は `js/vendor/` に同梱。実行時のCDN接続は不要です。
- 8枚のSVG羽根を45度ずつ配置し、回転と外側・接線方向への移動で開口を作ります。
- `scrub: true` でスクロール位置に直接同期。追従の遅延、スクロールの乗っ取り、自動再生はありません。
- `position: fixed` のoverlayの奥に、同じHero画像とサイト本体が最初から存在します。
- CSSのstickyでHeroを保持し、演出後は通常のスクロールに接続します。
- `prefers-reduced-motion: reduce` では演出と余分なスクロール距離を省略します。
- ライブラリ未読込、JavaScript無効時は静的なHero。初期化が4秒を超えた場合も静的表示を維持します。
- キーボード用の本文リンク、演出スキップ、操作を通すoverlayを備えています。

## 調整箇所

- 演出のスクロール距離: `css/style.css` の `.aperture-story`（320svh = Hero 1画面 + 演出約2.2画面）。
- 開く速度とテキスト表示のタイミング: `js/main.js` の `timeline`。0〜1が演出全体です。
- 写真と文章: `index.html`。Heroの最初の写真を変更するときはhead内の画像preloadも合わせます。

画像は元ファイルを保持したままWebPを追加しています。Heroは画面サイズに応じて3サイズから選び、先読みする画像はHeroのみです。Google Fontsが使えない場合はシステムフォントで表示します。

GSAP: https://gsap.com/standard-license/
