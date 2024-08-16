# ee-static-build-template

Build the Ethereal Engine client by itself from scratch.

## Deploy to github pages

- Set STATIC_BUILD_ENABLED to `true` in repo secrets
- Set GITHUB_PAGES to `true` in repo secrets
- Set STATIC_BUILD_HOST to your github pages url in repo secrets without https:// (example: `username.github.io/repo-name`)

## Live Example
https://etherealengine.github.io/ee-static-build-template/

## How to use

- Create your new repository by clicking the "Use this template" button
- Clone your new repository to /packages/projects/projects to your local dev environment
- `cd` into the cloned repository and run `npm run dev`
- The page will launch at `localhost:3000` and you can begin editing the code found in the `/src` folder
