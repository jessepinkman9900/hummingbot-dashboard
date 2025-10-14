[private]
default:
    just --list


[group('npm')]
publish:
  bash build-npm-package.sh
  cd dist-npm && pnpm publish --no-git-checks

[group('npm')]
npx-pack:
  bash build-npm-package.sh
  cd dist-npm && npm pack
