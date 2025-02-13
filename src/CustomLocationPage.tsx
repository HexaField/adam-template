import '@ir-engine/client/src/engine'

import { getMutableState, useMutableState, useReactiveRef } from '@ir-engine/hyperflux'
import { useSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import Debug from '@ir-engine/client-core/src/components/Debug'

import React from 'react'
import { useAgent } from './ad4m/useADAM'
import { PerspectivesState } from './ad4m/usePerspectives'
import { NeighbourhoodNetworkState } from './network/useNeighbourhoodNetwork'

export default function Template() {
  const [ref, setRef] = useReactiveRef()

  useSpatialEngine()
  useEngineCanvas(ref)

  const agent = useAgent()

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
    <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', pointerEvents: 'all' }}>
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
