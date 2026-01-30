resource "aws_neptune_subnet_group" "main" {
  name       = "${var.name_prefix}-neptune-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name  = "${var.name_prefix}-neptune-subnet-group"
    group = "${var.tag_group}"
  }
}

resource "aws_neptune_cluster" "main" {
  cluster_identifier                  = "${var.name_prefix}-neptune-cluster"
  engine                              = "neptune"
  skip_final_snapshot                 = true
  apply_immediately                   = true
  neptune_subnet_group_name           = aws_neptune_subnet_group.main.name
  vpc_security_group_ids              = [var.sg_id]
  iam_database_authentication_enabled = false # Using password auth if possible, or IAM. Neo4j often uses Auth. 
  # Note: Neptune default is IAM Auth disabled? 
  # Actually Neptune doesn't support Username/Password auth in the traditional SQL sense easily without IAM or it uses default.
  # "Neptune supports IAM database authentication."
  # If IAM is disabled, it relies on VPC security controls.
  # Wait, how does the app connect? App uses "neo4j-driver". 
  # Neo4j driver usually expects Bolt connection.
  # Neptune Bolt endpoint: "bolt://<cluster-endpoint>:8182"
  # Authentication: IAM or None (within VPC).
  # If I disable IAM auth, then it is "None" (trusted network).

  tags = {
    Name  = "${var.name_prefix}-neptune-cluster"
    group = "${var.tag_group}"
  }
}

resource "aws_neptune_cluster_instance" "main" {
  cluster_identifier = aws_neptune_cluster.main.id
  instance_class     = var.instance_class
  engine             = "neptune"
  apply_immediately  = true
  identifier         = "${var.name_prefix}-neptune-instance-1"

  tags = {
    Name  = "${var.name_prefix}-neptune-instance-1"
    group = "${var.tag_group}"
  }
}
