# NeetDivision LoL 申請管理

## 要件仕様

- Googleフォームの申請からGoogleスプレッドシート上でNeetDivisionの参加状況を管理する？
- GASを利用してRiotAPIから参加者の情報を抽出して情報を補完する？

## 追加要件

1. 募集しているレーン、チャンピオンと申請者が利用しているレーン、チャンピオンを突合し、該当する情報を色付けして確認できるようにする
   1. 該当情報が何件存在するか集計できるようにする
2. OPGGのURLを申請時に記載してもらい、情報を抽出する。
   1. 足りない情報、補えない情報が存在する場合はRiotAPIを利用？

## 参考ドキュメント

- [RiotAPI 公式ドキュメント](https://developer.riotgames.com/apis)
- [OPGG](https://op.gg/ja)
