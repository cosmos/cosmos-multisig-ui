output "cluster_id" {
  value = aws_ecs_cluster.main.id
}
output "service_name" {
  value = aws_ecs_service.main.name
}
