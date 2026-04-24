# share same shell, allows multiline, stop on error
.ONESHELL:
# which shell to share
SHELL = /bin/bash
# terminate on first error within a recipe
.SHELLFLAGS += -e
# even w/ unchanged dependencies these targets will always be executed
.PHONY: bib typecheck serve

# Regenerate pubs.bib from data/pubs.json and open it in VS Code
bib:
	@rm -f pubs.bib
	@python3 python/bib_json_to_bibtex.py > pubs.bib
	@code pubs.bib

# Run the TypeScript checker (zero-build — no files are emitted)
typecheck:
	@./node_modules/.bin/tsc --noEmit

# Preview the site locally at http://localhost:8000
serve:
	@echo "Serving at http://localhost:8000 — Ctrl+C to stop"
	@python3 -m http.server 8000
