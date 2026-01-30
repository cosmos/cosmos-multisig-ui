resource "aws_security_group" "alb" {
  name        = "${var.name_prefix}-alb-sg"
  description = "Allow HTTP inbound traffic"
  vpc_id      = var.vpc_id

  ingress {
    description      = "HTTP from Internet"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name  = "${var.name_prefix}-alb-sg"
    group = "${var.tag_group}"
  }
}

resource "aws_security_group" "ecs" {
  name        = "${var.name_prefix}-ecs-sg"
  description = "Allow traffic from ALB"
  vpc_id      = var.vpc_id

  ingress {
    description     = "HTTP from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name  = "${var.name_prefix}-ecs-sg"
    group = "${var.tag_group}"
  }
}

resource "aws_security_group" "neptune" {
  name        = "${var.name_prefix}-neptune-sg"
  description = "Allow traffic from ECS"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Bolt from ECS"
    from_port       = 7687
    to_port         = 7687
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  # Allow HTTPS (8182) generally used by Neptune as well? 
  # Usually Neptune uses 8182 for Gremlin/SparSQL. Bolt (7687) is for Neo4j.
  # The user app (cosmos-multisig-app) package.json has "neo4j-driver". 
  # Wait, Amazon Neptune supports OpenCypher on port 8182 usually. 
  # Neo4j Driver connects to Bolt port 7687 usually on Neo4j DB.
  # Does Neptune support Bolt protocol?
  # Neptune supports Bolt for openCypher since engine version 1.2.0.0. 
  # Port is usually 8182 even for Bolt in Neptune? 
  # Reference: "Neptune supports the Bolt protocol... on port 8182 (default)".
  # I should allow 8182.
  ingress {
    description     = "Neptune Port from ECS"
    from_port       = 8182
    to_port         = 8182
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name  = "${var.name_prefix}-neptune-sg"
    group = "${var.tag_group}"
  }
}
