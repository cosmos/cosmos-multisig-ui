resource "aws_internet_gateway" "main" {
  vpc_id = var.vpc_id

  tags = {
    Name  = "${var.name_prefix}-igw"
    group = "${var.tag_group}"
  }
}
