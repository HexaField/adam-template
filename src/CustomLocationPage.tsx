import React, { useEffect } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { WebGLRendererSystem } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'


export const startClientSystems = () => {
  /** Render */
  startSystems([WebGLRendererSystem], {
    with: PresentationSystemGroup
  })
}


export default function Template(props: { projectName?: string, sceneName?: string }) {
  const engineState = useHookstate(getMutableState(EngineState))

  useEffect(() => {
    if (getMutableState(EngineState).isEngineInitialized.value) return
    dispatchAction(EngineActions.initializeEngine({ initialised: true }))

    startClientSystems()
  }, [])


  // useLoadScene({ projectName: props.projectName ?? 'default-project', sceneName: props.sceneName ?? 'default' })
  // useOfflineScene({ spectate: true })
  // useLoadLocationScene()
  // useLoadEngineWithScene({ spectate: true })
  // useDefaultLocationSystems(true)

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
    </>
  )
}
