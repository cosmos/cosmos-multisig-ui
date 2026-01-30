resource "aws_ecr_repository" "main" {
  name                 = "${var.name_prefix}-repo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name  = "${var.name_prefix}-repo"
    group = "${var.tag_group}"
  }
}
