# share same shell, allows multiline, stop on error
.ONESHELL:
# which shell to share
SHELL = /bin/bash
# terminate on first error within a recipe
.SHELLFLAGS += -e
# even w/ unchanged dependencies this targes will always be executed
.PHONY: clean docs

bib:
	@rm -f pubs.bib
	@python python/bib_json_to_bibtex.py > pubs.bib
	@code pubs.bib