set shell := ["bash", "-c"]

verify:
	npm run lint
	npx tsc --noEmit
	reuse lint
