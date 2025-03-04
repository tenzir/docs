# This Makefile does the necessary pre-processing and conversion of files such
# that they can be added to the website.


CONTRIBUTION_GUIDE := src/content/docs/guides/contribution

DOT_GITHUB := dot-github
.PHONY: dot-github

all: dot-github

check-submodule:
	@if ! [ -f $(DOT_GITHUB)/.git ]; then \
	  printf "initializing tenzir/.github submodule\n" >&2; \
	  git submodule update --init $(DOT_GITHUB); \
	fi

dot-github: \
  check-submodule \
  $(CONTRIBUTION_GUIDE)/code-of-conduct.mdx \
  $(CONTRIBUTION_GUIDE)/coding-style.mdx \
  $(CONTRIBUTION_GUIDE)/security.mdx \
  $(CONTRIBUTION_GUIDE)/workflow.mdx \
  $(CONTRIBUTION_GUIDE)/git-branching-model.svg

$(CONTRIBUTION_GUIDE)/code-of-conduct.mdx:
	@printf "copying $@\n"
	@printf -- "---\ntitle: Code of Conduct\n---\n\n" > $@
	@awk 'NR > 2' $(DOT_GITHUB)/CODE-OF-CONDUCT.md >> $@

$(CONTRIBUTION_GUIDE)/coding-style.mdx:
	@printf "copying $@\n"
	@printf -- "---\ntitle: Coding Style\n---\n\n" > $@
	@awk 'NR > 2' $(DOT_GITHUB)/coding-style.md >> $@

$(CONTRIBUTION_GUIDE)/security.mdx:
	@printf "copying $@\n"
	@printf -- "---\ntitle: Security Policy\n---\n\n" > $@
	@awk "NR > 2" $(DOT_GITHUB)/SECURITY.md >> $@

$(CONTRIBUTION_GUIDE)/workflow.mdx:
	@printf "copying $@\n"
	@printf -- "---\ntitle: Git and GitHub Workflow\n---\n\n" > $@
	@awk "NR > 2" $(DOT_GITHUB)/workflow.md >> $@

$(CONTRIBUTION_GUIDE)/git-branching-model.svg:
	@printf "copying $@\n"
	@cp $(DOT_GITHUB)/git-branching-model.svg $@

clean:
	rm -f $(CONTRIBUTION_GUIDE)/code-of-conduct.mdx
	rm -f $(CONTRIBUTION_GUIDE)/coding-style.mdx
	rm -f $(CONTRIBUTION_GUIDE)/security.mdx
	rm -f $(CONTRIBUTION_GUIDE)/workflow.mdx
	rm -f $(CONTRIBUTION_GUIDE)/git-branching-model.svg
