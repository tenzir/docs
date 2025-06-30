# Tenzir Documentation

This repository hosts the documentation of [Tenzir](https://tenzir.com) at
[docs.tenzir.com](https://docs.tenzir.com).

## ✊ Usage

Our
[documentation](https://docs.tenzir.com/guides/contribution/documentation/)
has up-to-date instructions on how to build, view, and edit content in this
repository.

### Link Checking

This project includes automated link checking to ensure all internal and
external links are valid:

- **Local testing**: Run `pnpm lint:linkcheck` to check for broken links locally
- **CI integration**: Link checking runs automatically on all builds and pull
  requests
- **Scheduled checks**: Weekly automated link checking runs on Sundays to catch
  broken external links
- **Error reporting**: Broken links cause builds to fail and create GitHub
  issues automatically

The link checker validates:

- Internal page references
- Anchor links within pages
- External URLs (with appropriate exclusions)
- Relative links between documentation files

To disable link checking for specific paths, update the `exclude` array in the `starlightLinksValidator` configuration in `astro.config.mjs`.
