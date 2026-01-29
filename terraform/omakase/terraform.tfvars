aws_region  = "ap-northeast-1"
name_prefix = "cosmos-multisig-dev"
vpc_cidr    = "10.0.0.0/16"

tag_group = {
  Project     = "cosmos-multisig"
  Environment = "dev"
  ManagedBy   = "terraform"
}

neptune_instance_class = "db.t4g.medium"

neo4j_username = "neo4j"
neo4j_password = "ChangeMe123!" # Replace with secure password or pass via -var
