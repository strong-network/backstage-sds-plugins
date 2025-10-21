az acr login --name strongnetworkstagings
docker login strongnetworkstagings.azurecr.io  -u Azure-ACR-Staging-Token -p $(cat /secrets/ACR_TOKEN)
docker image build . -f packages/backend/Dockerfile -t strongnetworkstagings.azurecr.io/backstage:latest 
docker push strongnetworkstagings.azurecr.io/backstage:latest
az webapp restart --name backstage-staging --resource-group strong_network_staging