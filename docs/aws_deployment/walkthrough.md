# Walkthrough: Cosmos Multisig App Deployment on AWS

`cosmos-multisig-app` を AWS Fargate と Amazon Neptune 上にデプロイするための Terraform コードと Docker 設定を実装しました。

## 変更内容

### 1. Dockerfile の作成
Next.js アプリケーションをスタンドアロンモードでビルドし、サイズを最適化した `Dockerfile` を作成しました。

### 2. Terraform ディレクトリ構造
`espresso-node` プロジェクトの構成に倣い、モジュールベースのディレクトリ構造を採用しました。

```
terraform/
├── resources/           # 再利用可能なモジュール
│   ├── vpc/             # VPC ネットワーク
│   ├── subnet/          # Public/Private サブネット
│   ├── ig/              # インターネットゲートウェイ
│   ├── rt/              # ルートテーブル
│   ├── sg/              # セキュリティグループ (ALB, ECS, Neptune)
│   ├── iam/             # ECS タスク実行ロール
│   ├── ecr/             # コンテナレジストリ
│   ├── alb/             # Application Load Balancer
│   ├── neptune/         # Amazon Neptune (GraphDB)
│   └── ecs/             # ECS Fargate クラスター & タスク定義
└── environments/
    └── dev/             # 開発環境用設定
        ├── main.tf      # モジュールの呼び出しと結合
        ├── variables.tf # 変数定義
        └── terraform.tfvars # 設定値 (パスワード等)
```

### 3. 主な構成ポイント
- **コスト最適化**: NAT Gateway を使用せず、ECS タスクをパブリックサブネットに配置してインターネットアクセス (ECR pull 等) を可能にしています。`Assign Public IP` を有効化しています。
- **セキュリティ**:
    - **VPC Security Groups**:
        - ALB SG: インターネット (0.0.0.0/0) からの HTTP (80) 受信を許可。
        - ECS SG: ALB SG からのポート 3000 受信のみを許可。
        - Neptune SG: ECS SG からのポート 8182 (Bolt) 受信のみを許可。
    - **Neptune**: IAM 認証無効化 (VPC 内セキュリティグループで制御)。
- **自動接続**: ECS タスク定義で `NEO4J_URI` 環境変数に Neptune のエンドポイントを自動的に注入しています。

## デプロイ手順

### ステップ 1: インフラ構築 (Terraform)
1. `terraform/environments/dev` ディレクトリに移動します。
    ```bash
    cd terraform/environments/dev
    ```
2. Terraform を初期化します。
    ```bash
    terraform init
    ```
3. 計画を確認します。
    ```bash
    terraform plan
    ```
4. リソースを作成します。
    ```bash
    terraform apply
    ```
    ※ 完了後、出力された `repository_url` (ECR リポジトリ) をメモします。

### ステップ 2: アプリケーションのデプロイ

#### 方法 A: GitHub Actions (推奨)
1. GitHub リポジトリの Settings > Secrets and variables > Actions に `AWS_ROLE_ARN` を設定します。
2. `main` ブランチにプッシュするか、Actions タブから `Build and Push Docker Image` ワークフローを手動実行します。

#### 方法 B: 手動 (ローカル)
1. プロジェクトルートに戻り、ヘルパースクリプトを使用してイメージをビルド・プッシュします。
    ```bash
    # 使用法: ./scripts/deploy_image.sh <AWS_REGION> <ECR_REPOSITORY_URL>
    ./scripts/deploy_image.sh ap-northeast-1 <ECR_REPOSITORY_URL>
    ```

### ステップ 3: アプリの更新 (ECS)
初回デプロイ時は、イメージプッシュ後に ECS サービスが安定するまで数分待ちます。ALB の DNS 名 (Terraform Output) にアクセスして動作を確認してください。

## 確認事項
- `terraform.tfvars` の `neo4j_password` を強力なパスワードに変更してください。
- 本番運用時は backend 設定 (S3/DynamoDB) を有効化することを推奨します。
