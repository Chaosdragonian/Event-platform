#! /bin/zsh

echo "Hello Maple World! - build"

sudo docker build -t localhost/event-platform:gateway -f ./apps/gateway/Dockefile ./
sudo docker build -t localhost/event-platform:auth -f ./apps/auth/Dockerfile ./
sudo docker build -t localhost/event-platform:event-platform -f ./apps/event-platform/Dockerfile ./

