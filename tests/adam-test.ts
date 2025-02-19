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
import { Ad4mClient } from '@coasys/ad4m'
import { ChildProcess } from 'child_process'
import fs from 'fs-extra'
import fetch from 'node-fetch'
import { fileURLToPath } from 'node:url'
import path from 'path'
import { afterAll, beforeAll } from 'vitest'
import { apolloClient, runHcLocalServices, sleep, startExecutor } from './adam-utils'

//@ts-ignore
global.fetch = fetch

// @ts-ignore
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEST_DIR = `${__dirname}/../tst-tmp`

export class TestContext {
  //#ad4mClient: Ad4mClient | undefined
  #alice: Ad4mClient | undefined
  #bob: Ad4mClient | undefined

  #aliceCore: ChildProcess | undefined
  #bobCore: ChildProcess | undefined

  get ad4mClient(): Ad4mClient {
    return this.#alice!
  }

  get alice(): Ad4mClient {
    return this.#alice!
  }

  get bob(): Ad4mClient {
    return this.#bob!
  }

  set alice(client: Ad4mClient) {
    this.#alice = client
  }

  set bob(client: Ad4mClient) {
    this.#bob = client
  }

  set aliceCore(aliceCore: ChildProcess) {
    this.#aliceCore = aliceCore
  }

  set bobCore(bobCore: ChildProcess) {
    this.#bobCore = bobCore
  }

  async makeAllNodesKnown() {
    const aliceAgentInfo = await this.#alice!.runtime.hcAgentInfos()
    const bobAgentInfo = await this.#bob!.runtime.hcAgentInfos()
    await this.#alice!.runtime.hcAddAgentInfos(bobAgentInfo)
    await this.#bob!.runtime.hcAddAgentInfos(aliceAgentInfo)
  }
}
let testContext: TestContext = new TestContext()

export const withAd4m = () => {
  //@ts-ignore
  this.timeout(200000)
  const appDataPath = path.join(TEST_DIR, 'agents', 'alice')
  const bootstrapSeedPath = path.join(`${__dirname}/../bootstrapSeed.json`)
  const gqlPort = 15300
  const hcAdminPort = 15301
  const hcAppPort = 15302

  let executorProcess: ChildProcess | null = null

  let proxyUrl: string | null = null
  let bootstrapUrl: string | null = null
  let localServicesProcess: ChildProcess | null = null

  beforeAll(async () => {
    if (!fs.existsSync(TEST_DIR)) {
      throw Error('Please ensure that prepare-test is run before running tests!')
    }
    if (!fs.existsSync(path.join(TEST_DIR, 'agents'))) fs.mkdirSync(path.join(TEST_DIR, 'agents'))
    if (!fs.existsSync(appDataPath)) fs.mkdirSync(appDataPath)

    let localServices = await runHcLocalServices()
    proxyUrl = localServices.proxyUrl
    bootstrapUrl = localServices.bootstrapUrl
    localServicesProcess = localServices.process

    executorProcess = await startExecutor(
      appDataPath,
      bootstrapSeedPath,
      gqlPort,
      hcAdminPort,
      hcAppPort,
      false,
      undefined,
      proxyUrl!,
      bootstrapUrl!
    )

    testContext.alice = new Ad4mClient(apolloClient(gqlPort))
    testContext.aliceCore = executorProcess
  })

  afterAll(async () => {
    if (executorProcess) {
      while (!executorProcess?.killed) {
        let status = executorProcess?.kill()
        console.log('killed executor with', status)
        await sleep(500)
      }
    }
    if (localServicesProcess) {
      while (!localServicesProcess?.killed) {
        let status = localServicesProcess?.kill()
        console.log('killed local services with', status)
        await sleep(500)
      }
    }
  })

  return testContext
}
