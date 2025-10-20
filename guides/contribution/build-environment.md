# Build Environment

## Use Nix as reproducible development environment

[Section titled “Use Nix as reproducible development environment”](#use-nix-as-reproducible-development-environment)

We use [Nix](https://nixos.org) for reproducible Tenzir Node builds.

Fetch the dependencies for a dynamic build by running `nix develop` from the topmost directory in the `tenzir/tenzir` source tree.

You can automatically add the dependencies to your shell environment when you cd into the source directory via [direnv](https://direnv.net). Create an `.envrc` with the content:

```plaintext
use flake
```

If you want to silence the messages about binary caches you can use a variation of `.envrc` that invokes `nix` with a lower verbosity setting:

```sh
use_flake2() {
  watch_file flake.nix
  watch_file flake.lock
  mkdir -p "$(direnv_layout_dir)"
  eval "$(nix --quiet --quiet print-dev-env --profile "$(direnv_layout_dir)/flake-profile" "$@")"
}


use_flake2
```

The `tenzir/tenzir` repository comes with a set of CMake configure and build presets that can be used in this environment:

* `nix-clang-debug`
* `nix-clang-redeb`
* `nix-clang-release`
* `nix-gcc-debug`
* `nix-gcc-redeb`
* `nix-gcc-release`

Note

This build environment is currently only tested on Linux.

### Compile static binaries

[Section titled “Compile static binaries”](#compile-static-binaries)

Static binaries require a that the dependencies were built in static mode as well. That means we need to use a different environment; you can enter it with:

```sh
nix develop .#tenzir-static
```

The CMake presets for that mode are:

* `nix-gcc-static-debug`
* `nix-gcc-static-redeb`
* `nix-gcc-static-release`