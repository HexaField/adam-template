import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { withAd4m } from '../../tests/adam-test'
import { AdamClientState } from './useADAM'

const adamReactor = AdamClientState.reactor

describe('useADAM', () => {
  beforeEach(async () => {
    createEngine()

    // override AdamClientState to ensure reactor does not run

    AdamClientState.reactor = undefined
    getState(AdamClientState)
  })

  afterEach(() => {
    AdamClientState.reactor = adamReactor
    return destroyEngine()
  })

  const testContext = withAd4m()

  describe('usePerspectives', () => {
    it('should return perspectives of the agent', async () => {
      const ad4mClient = testContext.ad4mClient!

      // initalize state to trigger reactor
      getMutableState(AdamClientState).set(ad4mClient)

      // console.log(agent)

      // check if Ad4mConnectUI was initialized
    })
  })
})
