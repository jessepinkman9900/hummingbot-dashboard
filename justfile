[private]
default:
    just --list


[group('npm')]
publish:
  cd npx-cli && pnpm version patch --no-git-tag-version
  bash build-npm-package.sh
  cd dist-npm && pnpm publish --no-git-checks
  git add npx-cli/package.json
  git commit -m "Bump npx-cli version to $(node -p "require('./npx-cli/package.json').version")"
  git tag -a "v$(node -p "require('./npx-cli/package.json').version")" -m "Release v$(node -p "require('./npx-cli/package.json').version")"
  git push origin --tags

[group('npm')]
npx-local:
  bash build-npm-package.sh
  cd dist-npm && npm pack && npx ./hummingbot-dashboard-*.tgz

[group('npm')]
npx-pack:
  bash build-npm-package.sh
  cd dist-npm && npm pack

[group('local')]
run:
  cd deploy && docker compose up -d
  cd frontend && pnpm i && pnpm dev
