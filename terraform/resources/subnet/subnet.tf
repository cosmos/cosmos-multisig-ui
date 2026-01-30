# Public Subnets (for ALB and Fargate Tasks to access internet w/o NAT GW)
resource "aws_subnet" "public" {
  vpc_id                  = var.vpc_id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 1) # e.g., 10.0.1.0/24
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name  = "${var.name_prefix}-subnet-public-1"
    group = "${var.tag_group}"
  }
}

resource "aws_subnet" "public2" {
  vpc_id                  = var.vpc_id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 2) # e.g., 10.0.2.0/24
  availability_zone       = "${var.aws_region}c"           # Use 'c' or 'b' depending on region availability. 'c' is often safe in ap-northeast-1
  map_public_ip_on_launch = true

  tags = {
    Name  = "${var.name_prefix}-subnet-public-2"
    group = "${var.tag_group}"
  }
}

# Private Subnets (for Neptune)
resource "aws_subnet" "private" {
  vpc_id            = var.vpc_id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 3) # e.g., 10.0.3.0/24
  availability_zone = "${var.aws_region}a"

  tags = {
    Name  = "${var.name_prefix}-subnet-private-1"
    group = "${var.tag_group}"
  }
}

resource "aws_subnet" "private2" {
  vpc_id            = var.vpc_id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 4) # e.g., 10.0.4.0/24
  availability_zone = "${var.aws_region}c"

  tags = {
    Name  = "${var.name_prefix}-subnet-private-2"
    group = "${var.tag_group}"
  }
}
