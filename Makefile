.PHONY: help

help:
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

redeploy: ## Publish image to ACR and redeploy to Azure App Service
	bash ./redeploy.sh

ghcr_publish: ## Publish image to GH Container Registry 
	bash ./ghcr_publish.sh