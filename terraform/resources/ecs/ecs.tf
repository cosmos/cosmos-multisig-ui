resource "aws_ecs_cluster" "main" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }

  tags = {
    Name  = "${var.name_prefix}-cluster"
    group = "${var.tag_group}"
  }
}

resource "aws_ecs_task_definition" "main" {
  family                   = "${var.name_prefix}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.execution_role_arn # Using same role for simplicity if no specific task logic needs AWS access

  container_definitions = jsonencode([
    {
      name      = "${var.name_prefix}-container"
      image     = var.container_image
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NEO4J_URI"
          value = var.neo4j_uri
        },
        {
          name  = "NEO4J_USERNAME"
          value = var.neo4j_username
        },
        {
          name  = "NEO4J_PASSWORD"
          value = var.neo4j_password
        },
        {
          name  = "NEO4J_DATABASE"
          value = "neo4j"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.name_prefix}"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
    }
  ])

  tags = {
    Name  = "${var.name_prefix}-tg"
    group = "${var.tag_group}"
  }
}

resource "aws_ecs_service" "main" {
  name            = "${var.name_prefix}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids # Must be Public Subnets if assign_public_ip is true and no NAT GW
    security_groups  = [var.sg_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "${var.name_prefix}-container"
    container_port   = 3000
  }

  tags = {
    Name  = "${var.name_prefix}-service"
    group = "${var.tag_group}"
  }
}
