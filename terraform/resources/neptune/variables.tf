variable "name_prefix" { type = string }
variable "tag_group" { type = map(string) }
variable "subnet_ids" { type = list(string) }
variable "sg_id" { type = string }
variable "instance_class" { type = string }
