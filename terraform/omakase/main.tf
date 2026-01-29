terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tag_group
  }
}

module "vpc" {
  source      = "../../resources/vpc"
  vpc_cidr    = var.vpc_cidr
  name_prefix = var.name_prefix
  tag_group   = var.tag_group
}

module "ig" {
  source      = "../../resources/ig"
  vpc_id      = module.vpc.id
  name_prefix = var.name_prefix
  tag_group   = var.tag_group
}

module "subnet" {
  source      = "../../resources/subnet"
  vpc_id      = module.vpc.id
  vpc_cidr    = var.vpc_cidr
  aws_region  = var.aws_region
  name_prefix = var.name_prefix
  tag_group   = var.tag_group
}

module "rt" {
  source             = "../../resources/rt"
  vpc_id             = module.vpc.id
  ig_id              = module.ig.id
  public_subnet_id   = module.subnet.public_id
  public2_subnet_id  = module.subnet.public2_id
  private_subnet_id  = module.subnet.private_id
  private2_subnet_id = module.subnet.private2_id
  name_prefix        = var.name_prefix
  tag_group          = var.tag_group
}

module "sg" {
  source      = "../../resources/sg"
  vpc_id      = module.vpc.id
  name_prefix = var.name_prefix
  tag_group   = var.tag_group
}

module "iam" {
  source      = "../../resources/iam"
  name_prefix = var.name_prefix
  tag_group   = var.tag_group
}

module "ecr" {
  source      = "../../resources/ecr"
  name_prefix = var.name_prefix
  tag_group   = var.tag_group
}

module "alb" {
  source      = "../../resources/alb"
  vpc_id      = module.vpc.id
  subnet_ids  = [module.subnet.public_id, module.subnet.public2_id]
  sg_id       = module.sg.alb_sg_id
  name_prefix = var.name_prefix
  tag_group   = var.tag_group
}

module "neptune" {
  source         = "../../resources/neptune"
  subnet_ids     = [module.subnet.private_id, module.subnet.private2_id]
  sg_id          = module.sg.neptune_sg_id
  instance_class = var.neptune_instance_class
  name_prefix    = var.name_prefix
  tag_group      = var.tag_group
}

module "ecs" {
  source             = "../../resources/ecs"
  name_prefix        = var.name_prefix
  tag_group          = var.tag_group
  aws_region         = var.aws_region
  subnet_ids         = [module.subnet.public_id, module.subnet.public2_id] # Public because no NAT GW
  sg_id              = module.sg.ecs_sg_id
  execution_role_arn = module.iam.execution_role_arn
  target_group_arn   = module.alb.target_group_arn
  container_image    = "${module.ecr.repository_url}:latest" # Ensure you push image tagged 'latest'

  # Neo4j connection details
  neo4j_uri      = "bolt://${module.neptune.endpoint}:8182"
  neo4j_username = var.neo4j_username # Neptune doesn't use username/pass by default but app needs it?
  neo4j_password = var.neo4j_password # If IAM auth disabled, these might be ignored by Neptune but required by Driver
}
