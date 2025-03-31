# Changelog

This directory accumulates changelog files from our various repositories.

For every new commit to `main`, a GitHub Action workflow looks for changes in
this directory and—on change—re-creates the changelog that we serve at
`/changelog`.

## Usage

We provide a Python script to generate the Markdown pages.

First, install the dependencies:

```sh
poetry install --no-root
```

Then run the script in this directory:

```sh
poetry run ./changelog.py
```

This generates two things: (i) a directory `mdx` with the generated MDX files,
and (ii) a file `sidebar-changelog.ts` to be included during the build process.

To overwrite the generated files in this repository—which you want for
production invocations in CI—call the script with the following arguments
relative to this directory:

```sh
poetry run ./changelog.py \
  --output-dir ../src/content/docs/changelog/ \
  --sidebar-file ../src/sidebar-changelog.ts
```

Finally, use `git status` to understand what changed compared to the previous
version.
