variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "tag_group" {
  description = "Common tags for resources"
  type        = string
}
