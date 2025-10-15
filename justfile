[private]
default:
    just --list


[group('npm')]
publish:
  bash build-npm-package.sh
  cd dist-npm && pnpm publish --no-git-checks

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
