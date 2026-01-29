# Cosmoshub Multisig App

このアプリは、Stargate 対応チェーン上でマルチシグを作成・署名・ブロードキャストするための Next.js 製 UI です。
バックエンドに Amazon Neptune (GraphDB) を使用し、AWS Fargate 上で動作するように設計されています。

## AWS デプロイ手順 (Terraform)

このリポジトリは、AWS 上に以下のインフラを構築するための Terraform コードを含んでいます。
- **Web App**: AWS Fargate (Next.js Standalone)
- **Database**: Amazon Neptune (GraphDB)
- **Network**: VPC, Public Subnets (No NAT Gateway), Security Groups, ALB

### 1. Terraform の設定

`terraform/environments/dev/terraform.tfvars` を作成し、必要な環境変数を設定してください。

```hcl
neo4j_password = "YOUR_SECURE_PASSWORD" # Neptune (Neo4j) 用パスワード
```

### 2. インフラの構築

```bash
cd terraform/environments/dev
terraform init
terraform apply
```

完了後、Output として表示される `repository_url` (ECR) と `lb_dns_name` (ALB) をメモしてください。

### 3. Docker イメージのビルドとプッシュ

**手動でプッシュする場合:**

```bash
./scripts/deploy_image.sh ap-northeast-1 <ECR_REPOSITORY_URL>
```

**GitHub Actions で自動化する場合:**

`main` ブランチへのプッシュ、または手動トリガー (`workflow_dispatch`) で GitHub Actions がコンテナをビルドし、ECR にプッシュします。

GitHub Secrets に以下を設定してください (OIDC を使用する場合は Role ARN のみで可)。
- `AWS_ROLE_ARN`: GitHub Actions 用の IAM Role ARN

## ローカル開発

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```
