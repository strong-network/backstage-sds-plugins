echo $GH_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker image build . -f packages/backend/Dockerfile -t ghcr.io/aleksadjeka/backstage-sds-plugins/backstage:latest
docker push ghcr.io/aleksadjeka/backstage-sds-plugins/backstage:latest