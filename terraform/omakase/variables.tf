variable "aws_region" {
  description = "AWS Region to deploy resources"
  type        = string
}

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "tag_group" {
  description = "Tags to apply to resources"
  type        = map(string)
}

variable "neptune_instance_class" {
  description = "Instance class for Neptune cluster"
  type        = string
}

variable "neo4j_username" {
  description = "Username for Neo4j/Neptune"
  type        = string
  sensitive   = true
}

variable "neo4j_password" {
  description = "Password for Neo4j/Neptune"
  type        = string
  sensitive   = true
}
