resource "aws_internet_gateway" "main" {
  vpc_id = var.vpc_id

  tags = merge(
    var.tag_group,
    {
      Name = "${var.name_prefix}-igw"
    }
  )
}
