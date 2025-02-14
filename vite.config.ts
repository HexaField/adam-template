/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import packageRoot from 'app-root-path'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { defineConfig, UserConfig } from 'vite'
import manifestJson from './manifest.json'

const assets = [
  'projects/ir-engine/default-project/assets/avatars/irRobot.vrm',
  'projects/ir-engine/default-project/assets/animations/emotes.glb',
  'projects/ir-engine/default-project/assets/animations/locomotion.glb'
]

const currentDirectory = process.cwd()
console.log(`Copying assets to ${currentDirectory}/public`)

fs.rmSync(path.join(currentDirectory, 'public/projects'), { recursive: true })

// copy assets form appRootPath.path/path to public, ensuring folder structure is maintained
for (const asset of assets) {
  const assetPath = path.join(packageRoot.path, 'packages/projects', asset)
  const assetPublicPath = path.join(currentDirectory, 'public', asset)
  fs.mkdirSync(path.dirname(assetPublicPath), { recursive: true })
  fs.copyFileSync(assetPath, assetPublicPath)
  console.log(`Copied asset ${assetPath} to ${assetPublicPath}`)
}

export default defineConfig(async ({ command }) => {
  dotenv.config({
    path: packageRoot.path + '/.env.local'
  })

  const isDev = process.env.APP_ENV === 'development'

  const base = `https://${process.env['STATIC_BUILD_HOST'] ?? 'localhost:3000'}/`

  const define = { __IR_ENGINE_VERSION__: JSON.stringify(manifestJson.engineVersion) }
  for (const [key, value] of Object.entries(process.env)) {
    define[`globalThis.process.env.${key}`] = JSON.stringify(value)
  }

  const returned = {
    define: define,
    server: {
      cors: isDev ? false : true,
      hmr:
        process.env.VITE_HMR === 'true'
          ? {
              port: process.env['VITE_APP_PORT'],
              host: process.env['VITE_APP_HOST'],
              overlay: false
            }
          : false,
      host: process.env['VITE_APP_HOST'],
      port: process.env['VITE_APP_PORT'],
      headers: {
        'Origin-Agent-Cluster': '?1'
      },
      ...(isDev
        ? {
            https: {
              key: fs.readFileSync(path.join(packageRoot.path, 'certs/key.pem')),
              cert: fs.readFileSync(path.join(packageRoot.path, 'certs/cert.pem'))
            }
          }
        : {})
    },
    base,
    optimizeDeps: {
      entries: ['./src/main.tsx'],
      exclude: [],
      esbuildOptions: {
        target: 'es2020'
      }
    },
    plugins: [],
    build: {
      target: 'esnext',
      sourcemap: process.env.VITE_SOURCEMAPS === 'true' ? true : false,
      minify: 'esbuild',
      dynamicImportVarsOptions: {
        warnOnError: true
      },
      rollupOptions: {
        external: ['dotenv-flow'],
        output: {
          dir: 'dist',
          format: 'es', // 'commonjs' | 'esm' | 'module' | 'systemjs'
          // ignore files under 1mb
          experimentalMinChunkSize: 1000000
        }
      }
    }
  } as UserConfig

  return returned
})
