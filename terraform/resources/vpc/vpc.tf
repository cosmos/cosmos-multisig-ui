resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.tag_group,
    {
      Name = "${var.name_prefix}-vpc"
    }
  )
}
