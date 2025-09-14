![ニーディビロゴ](https://neetdi.vision/ndlogo.png)

# ニーディビLoL部情報登録フォームのGASスクリプト

![workflow](https://github.com/Slum-Dev/neetdiv_form/actions/workflows/test.yml/badge.svg)

## 概要

ニートディビジョンLoL部募集用フォームの登録データを処理・整理するためのGASスクリプトです。

## 開発環境構築

本リポジトリは言語にTypeScriptを起用しており、またリンター・フォーマッターにBiome、テストにVitestなどを使用しているため開発環境の構築が必要となります。

### Node.js & npm

1. [Node.jsのHP](https://nodejs.org/ja/)から最新のLTSをダウンロードしインストール
2. `node --version` と `npm --version` でインストール完了を確認
3. 本プロジェクトのフォルダーで `npm install` を実行し必要なパッケージを導入

### VS Code

以下の拡張機能を追加するのを**強く**推奨します。（推奨拡張機能にも追加済）

- EditorConfig for VS Code
- Biome
- Vitest

以下の便利系拡張機能も合わせてオススメします。

- Code Spell Checker
- Git Graph

## デプロイ

`main`ブランチへマージされると、GitHub Actionsで自動でデプロイが行われます。
