set shell := ["bash", "-c"]

verify:
	npm run lint
	npx tsc --noEmit
	command -v reuse > /dev/null 2>&1 && reuse lint || echo "reuse not installed — skipping REUSE lint"

release part:
	#!/usr/bin/env bash
	set -euo pipefail
	case "{{ part }}" in
		patch|minor|major) ;;
		*) echo "Invalid part '{{ part }}'. Use patch|minor|major"; exit 2 ;;
	esac
	uvx --from "bump-my-version==1.2.6" bump-my-version bump {{ part }}

release-dry part *args:
	#!/usr/bin/env bash
	set -euo pipefail
	_short=false
	for _arg in {{args}}; do [[ "$_arg" == "--short" ]] && _short=true; done
	if $_short; then
		uvx --from "bump-my-version==1.2.6" bump-my-version bump {{part}} --dry-run --allow-dirty --verbose 2>&1 \
			| grep -E 'current version|New version will be|Dry run'
	else
		uvx --from "bump-my-version==1.2.6" bump-my-version bump {{part}} --dry-run --allow-dirty --verbose
	fi

pin-core version:
	sed -i 's/uv tool install zenzic.*/uv tool install zenzic=={{version}}/' README.md
	sed -i 's/pip install zenzic.*/pip install zenzic=={{version}}/' README.md
	sed -i 's/| \*\*Pinned Core\*\* | .* |/| \*\*Pinned Core\*\* | `zenzic>={{version}}` |/' RELEASE.md

pin-core-dry version:
	@echo "Would update core version to {{version}} in README.md and RELEASE.md"

versions:
	#!/usr/bin/env bash
	set -euo pipefail
	PINNED=$(grep -oP '\|\s*\*\*Pinned Core\*\*\s*\|\s*`zenzic>=\K[0-9.]+' RELEASE.md)
	echo "extension:   $(uvx --from 'bump-my-version==1.2.6' bump-my-version show current_version)"
	echo "core-pinned: $PINNED"
