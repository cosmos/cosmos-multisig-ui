resource "aws_ecr_repository" "main" {
  name                 = "${var.name_prefix}-repo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tag_group
}
