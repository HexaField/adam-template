import { Ad4mClient, Agent } from '@coasys/ad4m'
import Ad4mConnectUI, { getAd4mClient } from '@coasys/ad4m-connect'
import { defineState, getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'

export const AdamClientState = defineState({
  name: 'hexafield.adam-template.AdamClientState',
  initial: null as Ad4mClient | null,
  reactor: () => {
    const ad4mConnect = useHookstate(() => {
      return Ad4mConnectUI({
        appName: 'iR Engine',
        appDesc: 'Immersive Collaboration',
        appUrl: window.location.origin,
        appDomain: window.location.origin,
        appIconPath: window.location.origin + '/icon.png',
        capabilities: [{ with: { domain: '*', pointers: ['*'] }, can: ['*'] }],
        hosting: false,
        mobile: true
      })
    }).value

    const authenticatedState = useHookstate(false)

    useEffect(() => {
      document.body.style.pointerEvents = 'all'

      ad4mConnect.isAuthenticated().then((authenticated) => {
        authenticatedState.set(authenticated)
        document.body.style.pointerEvents = 'none'
      })
    }, [])

    const authState = useHookstate(ad4mConnect.authState)

    useEffect(() => {
      getAd4mClient().then((client) => {
        getMutableState(AdamClientState).set(client)
      })

      const onAuthStateChange = (e) => {
        const oldState = authState.value
        authState.set(ad4mConnect.authState)
        console.log('auth state changed', e, ad4mConnect.authState)
        if (ad4mConnect.authState === 'authenticated' && oldState !== 'authenticated') {
          // window.location.reload()
        }
      }

      ad4mConnect.addEventListener('authstatechange', onAuthStateChange)

      return () => {
        ad4mConnect.removeEventListener('authstatechange', onAuthStateChange)
      }
    }, [authenticatedState.value])

    return null
  }
})

export const AgentState = defineState({
  name: 'hexafield.adam-template.AgentState',
  initial: null as Agent | null,
  reactor: () => {
    const adam = useMutableState(AdamClientState).value

    useEffect(() => {
      if (!adam) return

      adam.agent.me().then((response) => {
        getMutableState(AgentState).set(response)
      })
    }, [adam])
  }
})
