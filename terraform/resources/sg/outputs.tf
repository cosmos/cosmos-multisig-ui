output "alb_sg_id" {
  value = aws_security_group.alb.id
}
output "ecs_sg_id" {
  value = aws_security_group.ecs.id
}
output "neptune_sg_id" {
  value = aws_security_group.neptune.id
}
