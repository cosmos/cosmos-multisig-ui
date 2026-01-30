# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = var.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = var.ig_id
  }

  tags = {
    Name  = "${var.name_prefix}-rt-public"
    group = "${var.tag_group}"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = var.public_subnet_id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public2" {
  subnet_id      = var.public2_subnet_id
  route_table_id = aws_route_table.public.id
}

# Route Table for Private Subnets (No Internet Access / No NAT GW)
resource "aws_route_table" "private" {
  vpc_id = var.vpc_id

  tags = {
    Name  = "${var.name_prefix}-rt-private"
    group = "${var.tag_group}"
  }
}

resource "aws_route_table_association" "private" {
  subnet_id      = var.private_subnet_id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private2" {
  subnet_id      = var.private2_subnet_id
  route_table_id = aws_route_table.private.id
}
