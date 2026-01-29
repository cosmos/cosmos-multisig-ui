# 実装計画: Cosmos Multisig App on AWS

## ゴール
`cosmos-multisig-app` を AWS 上に以下の要件・制約でデプロイするための Terraform コードおよび関連ファイルを作成する。
- **Web App**: AWS Fargate (最小構成: 0.25 vCPU, 0.5 GB RAM)
- **Database**: Amazon Neptune (GraphDB, 最小インスタンス)
- **Network**: VPC 構築, ALB/NLB によるアクセス (TLS は Cloudflare 想定のため ALB は HTTP で可)
- **コスト**: 最優先。NAT Gateway を排除した構成を目指す。

## ユーザーレビューが必要な事項
- **NAT Gateway の省略**: コスト削減のため、Fargate タスクをパブリックサブネットに配置し、パブリック IP を付与してインターネットアクセス (ECR pull 等) を確保します。DB (Neptune) はプライベートサブネットに配置し、VPC 内ルーティングで接続します。これにより NAT Gateway 料金 ($0.045/h + データ処理料) を削減します。
- **Neptune インスタンス**: 開発・小規模用として `db.t4g.medium` (または `db.t3.medium`) を使用します。
- **シークレット管理**: 簡易化のため、DB パスワード等は Terraform の変数として渡すか、SSM Parameter Store を利用する構成にします (今回は Terraform 変数経由で Task Definition の環境変数に注入する最もシンプルな形を提案します)。

## 提案する変更

### `cosmos-multisig-app` (Root)

#### [NEW] `Dockerfile`
- Next.js アプリケーションをビルドし、スタンドアロンモードで実行するための Dockerfile を作成します。
- `docker build` と `docker push` を行うための簡易スクリプト (`scripts/deploy_image.sh` 等) を作成します。

#### [NEW] `terraform/resources/` (Modules)
- `espresso-node` の構成に倣い、リソースごとにモジュールを分割します。
- **`terraform/resources/vpc`**: VPC 定義。
- **`terraform/resources/subnet`**: Public/Private Subnets 定義。
- **`terraform/resources/sg`**: Security Groups (ALB, ECS, Neptune) 定義。
- **`terraform/resources/neptune`**: Neptune Cluster & Instance, Subnet Group 定義。
- **`terraform/resources/ecs`**: ECS Cluster, Task Definition, Service 定義。
- **`terraform/resources/alb`**: ALB, Target Group, Listener 定義。
- **`terraform/resources/ecr`**: ECR Repository 定義。
- **`terraform/resources/iam`**: ECS Task Execution Role 等の定義。

#### [NEW] `terraform/environments/dev/` (Root Module)
- **`main.tf`**: 各モジュール (`../resources/*`) を呼び出し、変数を渡して環境を構築します。
- **`variables.tf`**: 環境固有の変数定義。
- **`terraform.tfvars`**: 具体的な設定値。

## 検証計画

### 自動テスト (Terraform Validate)
- `terraform validate` を実行し、構文エラーがないことを確認。

### 手動検証手順
1. **Docker イメージのビルド**: 作成した Dockerfile でビルド可能か確認。
    ```bash
    docker build -t cosmos-multisig-app .
    ```
2. **Terraform Plan の確認**:
    - ユーザーの AWS 環境に対して `terraform plan` を実行 (可能な場合)。
    - リソースの依存関係 (VPC -> Neptune/ECS) が正しいか確認。
3. **コスト最適化構成の確認**:
    - NAT Gateway が作成されない構成になっているかコードレビューで再確認。

---
承認いただければ、Terraform コードの実装を開始します。
