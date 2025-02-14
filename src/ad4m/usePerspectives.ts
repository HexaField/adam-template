import { PerspectiveProxy } from '@coasys/ad4m'
import { defineState, none, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { AdamClientState } from './useADAM'

type UUID = string

export const PerspectivesState = defineState({
  name: 'hexafield.adam-template.PerspectiveState',
  initial: {
    perspectives: {} as Record<UUID, PerspectiveProxy>,
    neighbourhoods: {} as Record<UUID, PerspectiveProxy>
  },
  reactor: () => {
    const client = useMutableState(AdamClientState).value

    const state = useMutableState(PerspectivesState)

    useEffect(() => {
      if (!client) return

      // Get all perspectives
      client.perspective.all().then((allPerspectives) => {
        console.log({ allPerspectives })
        state.perspectives.set(
          allPerspectives.reduce((acc, p) => {
            return { ...acc, [p.uuid]: p }
          }, {})
        )
      })

      client.perspective.addPerspectiveUpdatedListener((handle) => {
        client.perspective.byUUID(handle.uuid).then((perspective) => {
          if (perspective) {
            state.perspectives[handle.uuid].set(perspective)
          }
        })
        return null
      })

      // Add new incoming perspectives
      // @ts-ignore
      client.perspective.addPerspectiveAddedListener((handle) => {
        client.perspective.byUUID(handle.uuid).then((perspective) => {
          if (perspective) {
            state.perspectives[handle.uuid].set(perspective)
          }
        })
      })

      // Remove new deleted perspectives
      client.perspective.addPerspectiveRemovedListener((uuid) => {
        state.perspectives[uuid].set(none)
        return null
      })
    }, [client])

    useEffect(() => {
      state.neighbourhoods.set(
        Object.keys(state.perspectives.value).reduce((acc, key) => {
          if (state.perspectives.value[key]?.sharedUrl) {
            return {
              ...acc,
              [key]: state.perspectives.value[key]
            }
          } else {
            return acc
          }
        }, {})
      )
    }, [state.perspectives])

    return null
  }
})

export const usePerspectives = () => useMutableState(PerspectivesState).value
