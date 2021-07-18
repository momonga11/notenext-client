※本リポジトリはフロントエンド側のソースコードとなります。
 バックエンド側は[こちら](https://github.com/momonga11/notenext-server "github notenext-server")よりご参照ください。

<img src="https://github.com/momonga11/notenext-docs/blob/84b76f05ec137773b3269d14ccf6bb3fd30216a0/images/logo.png" alt="notenext_logo" width="400px">

<img src="https://github.com/momonga11/notenext-docs/blob/84b76f05ec137773b3269d14ccf6bb3fd30216a0/images/notenext_image.png" alt="notenext_image">

## 概要

NOTENEXTは、ノートとタスクを一緒に管理するためのアプリケーションです。

こういった課題を解決できます。

- チームの打ち合わせ中、議論をしていると新しいタスクが出てきた。議事録にメモしておこう
- 勉強用のノートを作成していると、新しく不明点が見つかった。あとで確認しよう

NOTENEXTでは、作成したノートにタスクを設定することができます。

ノートとタスクを紐付けておくことで、「あとでやること」が強調され、埋もれないようになります。

## URL

https://notenext-app.com

**※2021年7月18日現在、利用を停止しております。**

【サンプルログイン】ボタンをクリックすると、ユーザー登録なしでログインできます。サンプルユーザーは12日間ご利用いただけます。

### サポートブラウザ

| <img src="https://github.com/momonga11/notenext-docs/blob/84b76f05ec137773b3269d14ccf6bb3fd30216a0/images/googlechrome_103832.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://github.com/momonga11/notenext-docs/blob/84b76f05ec137773b3269d14ccf6bb3fd30216a0/images/safari_icon-icons.com_75763.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://github.com/momonga11/notenext-docs/blob/84b76f05ec137773b3269d14ccf6bb3fd30216a0/images/firefox_browser_logo_icon_152991.png" alt="Firefox" width="16px" height="16px" /> Firefox | <img src="https://github.com/momonga11/notenext-docs/blob/84b76f05ec137773b3269d14ccf6bb3fd30216a0/images/edge_browser_logo_icon_152998.png" alt="Edge" width="16px" height="16px" /> Edge(Chromium) | <img src="https://github.com/momonga11/notenext-docs/blob/84b76f05ec137773b3269d14ccf6bb3fd30216a0/images/wineinternetexplorer_103979.png" alt="IE" width="16px" height="16px" /> Internet Explorer |
|:------:|:------:|:-------:|:----------:|:----------------:|
|○       |△ ※1    |○        |○           |×                 |

※1: ノートの日本語入力に問題があるため、非推奨です。

## 使用技術

- フロントエンド
  - Vue.js 2.6.11
  - Vuetify
  - axios(バックエンドとの非同期通信)
  - jest(自動テスト)
  - eslint/prettier(静的解析、フォーマッター)
- バックエンド
  - Ruby 2.7.3
  - Rails 6.1.3
  - RSpec(自動テスト)
  - Rubocop(静的解析、フォーマッター)
  - nginx(Webサーバー)
  - puma(APサーバー)
  - MySQL 8.0(データベース)
- インフラ
  - AWS(Amplify, Route53, CloudFront, S3, ACM, VPC, ALB, ECS, Fargate, ECR, RDS, SSM, CloudWatch)
  - Docker/docker-compose
  - CircleCI(バックエンドのCI/CD)
  - SendGrid(メール送信)

## インフラ構成図

<img src="https://github.com/momonga11/notenext-docs/blob/438b1dfd53643e5b1696e05ee0353a9c90211ffd/%E3%82%A4%E3%83%B3%E3%83%95%E3%83%A9/%E6%A7%8B%E6%88%90%E5%9B%B3.png" alt="infra_image"/>

## 機能一覧

- ユーザーアカウント機能(devise_token_auth)
  - 認証メールの有効化によるアカウント登録機能
  - 認証メールによるパスワードリセット機能
  - ログイン、ログアウト
  - ユーザー情報の編集、削除、パスワード変更
  - ユーザー画像の登録、編集、削除(Active Storage)
- プロジェクト情報
  - 編集、削除
- フォルダ情報
  - 作成、編集、削除
  - フォルダ単位の残タスク件数の表示
- ノート情報
  - リッチテキストエディタとして利用可能(TOAST UI Editor)

    ※文字の装飾、箇条書きレイアウト、チェックリスト、テーブル、画像追加(Active Storage)、リンク設定など
  - 作成、編集、削除、コピー
  - 検索、並び替え、無限スクロール(kaminari)、タスク表示
  - タスク作成、編集、削除
- その他
  - レスポンシブ対応

## プロジェクトセットアップ手順

※本手順はNOTENEXTのフロントエンドのセットアップ手順となります。
[こちら](https://github.com/momonga11/notenext-server "github notenext-server")より、別途バックエンドのセットアップもおこなってください。

### 前提

#### プロジェクトをクローン

```
git clone git@github.com:momonga11/notenext-client.git
```

### 開発用の場合

#### vue cli service を起動

```
docker-compose -f docker-compose.dev.yml up -d
```

※起動には少々お時間がかかります。

ブラウザのURLに、http://localhost:8888 を入力すると接続できます。

#### vue cli service を廃棄

```
docker-compose -f docker-compose.dev.yml down --volumes
```

### 本番用(オンプレ環境)の場合

#### ※ローカル環境以外から利用する場合

環境変数設定ファイルの作成

```
touch .env.production
```

作成されたファイルに以下を入力する

```
VUE_APP_API_URL='http://[ご利用環境のホスト名]/v1'
```

#### デプロイ

```
docker-compose up -d
```

※起動には少々お時間がかかります。

####  廃棄

```
docker-compose down
```
