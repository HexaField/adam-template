import '@ir-engine/client/src/engine'
import '@ir-engine/engine'

import Debug from '@ir-engine/client-core/src/components/Debug'
import { getMutableState, useMutableState, useReactiveRef, UserID } from '@ir-engine/hyperflux'
import { useSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'

import { EngineState } from '@ir-engine/ecs'
import { DomainConfigState } from '@ir-engine/engine/src/assets/state/DomainConfigState'
import React, { useEffect } from 'react'
import { AgentState } from './ad4m/useADAM'
import { NeighbourhoodNetworkState } from './ad4m/useNeighbourhoodNetwork'
import { PerspectivesState } from './ad4m/usePerspectives'

export default function Template() {
  const [ref, setRef] = useReactiveRef()

  useSpatialEngine()
  useEngineCanvas(ref)

  useEffect(() => {
    const domain =
      globalThis.process.env.APP_ENV === 'development'
        ? 'https://' + globalThis.process.env.VITE_APP_HOST + ':' + globalThis.process.env.VITE_APP_PORT
        : globalThis.process.env.BASE_URL!
    console.log(
      globalThis.process.env.APP_ENV,
      globalThis.process.env.VITE_APP_HOST,
      globalThis.process.env.VITE_APP_PORT,
      globalThis.process.env.BASE_URL
    )
    getMutableState(DomainConfigState).publicDomain.set(domain)
    getMutableState(DomainConfigState).cloudDomain.set(domain)
  }, [])

  const agent = useMutableState(AgentState).value

  useEffect(() => {
    if (!agent) return
    getMutableState(EngineState).userID.set(agent.did as UserID)
  }, [agent?.did])

  return (
    <>
      <div ref={setRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />
      <Debug />
      {agent ? <NeighbourhoodSelector /> : <h1>Connecting...</h1>}
    </>
  )
}

const NeighbourhoodSelector = () => {
  const { perspectives, neighbourhoods } = useMutableState(PerspectivesState).value

  console.log('perspectives', perspectives, 'neighbourhoods', neighbourhoods)

  const onJoinNeighbourhood = (uuid: string) => getMutableState(NeighbourhoodNetworkState).set([uuid])

  return (
    <div style={{ display: 'flex', width: '30%', height: 'auto', flexDirection: 'column', pointerEvents: 'all' }}>
      <h1>Neighbourhood Selector</h1>
      <p>Choose a neighbourhood to join</p>
      {Object.values(neighbourhoods).map((n) => (
        <button key={n.uuid} onClick={() => onJoinNeighbourhood(n.uuid)}>
          {n.name}
        </button>
      ))}
    </div>
  )
}
