output "endpoint" {
  value = aws_neptune_cluster.main.endpoint
}
output "reader_endpoint" {
  value = aws_neptune_cluster.main.reader_endpoint
}
