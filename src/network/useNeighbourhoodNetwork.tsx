import { API, useFind } from '@ir-engine/common'
import { PUBLIC_STUN_SERVERS } from '@ir-engine/common/src/constants/STUNServers'
import { Engine } from '@ir-engine/ecs'
import {
  NetworkID,
  PeerID,
  UserID,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import {
  MessageTypes,
  NetworkActions,
  NetworkState,
  NetworkTopics,
  SendMessageType,
  StunServerState,
  WebRTCTransportFunctions,
  addNetwork,
  createNetwork,
  removeNetwork,
  useWebRTCPeerConnection
} from '@ir-engine/network'
import React, { useEffect } from 'react'
import { useBasicScene } from '../world/BasicScene'

export const NeighbourhoodNetworkState = defineState({
  name: 'hexafield.adam-template.NeighbourhoodNetworkState',
  initial: [] as string[],
  reactor: () => {
    const joinedNeighbourhoods = useMutableState(NeighbourhoodNetworkState).value

    useEffect(() => {
      /** @todo it's probably fine that we override this every time we connect to a new server, but we should maybe handle this smarter */
      getMutableState(StunServerState).set(PUBLIC_STUN_SERVERS)
    }, [])

    return (
      <>
        {joinedNeighbourhoods.map((neighbourhood) => (
          <NeighbourhoodReactor key={neighbourhood} neighbourhood={neighbourhood} />
        ))}
      </>
    )
  }
})

const NeighbourhoodReactor = (props: { neighbourhood: string }) => {
  useBasicScene(props.neighbourhood)

  return (
    <>
      {/* <ConnectionReactor networkID={props.neighbourhood as NetworkID} /> */}
    </>
  )
}

const ConnectionReactor = (props: { networkID: NetworkID }) => {
  const { networkID } = props
  const joinResponse = useHookstate<null | { index: number }>(null)

  useEffect(() => {
    const abortController = new AbortController()

    API.instance
      .service(p2pSignalingPath)
      .create({ networkID })
      .then((response) => {
        if (abortController.signal.aborted) return

        joinResponse.set(response)
      })

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    if (!joinResponse.value) return

    const topic = NetworkTopics.world

    getMutableState(NetworkState).hostIds[topic].set(networkID)

    const network = createNetwork(networkID, null, topic, {})
    addNetwork(network)

    network.ready = true

    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        $topic: network.topic,
        $to: Engine.instance.store.peerID,
        peerID: Engine.instance.store.peerID,
        peerIndex: joinResponse.value.index,
        userID: Engine.instance.userID
      })
    )

    return () => {
      dispatchAction(
        NetworkActions.peerLeft({
          $network: network.id,
          $topic: network.topic,
          $to: Engine.instance.store.peerID,
          peerID: Engine.instance.store.peerID,
          userID: Engine.instance.userID
        })
      )
      removeNetwork(network)
      getMutableState(NetworkState).hostIds[topic].set(none)
    }
  }, [joinResponse])

  if (!joinResponse.value) return null

  return <PeersReactor networkID={props.networkID} />
}

const PeersReactor = (props: { networkID: NetworkID }) => {
  const query = useFind(p2pSignalingPath, {
    query: {
      networkID: props.networkID
    }
  })

  const otherPeers = useHookstate<{ peerID: PeerID; peerIndex: number; userID: UserID }[]>([])

  useEffect(() => {
    if (query.status === 'success') {
      otherPeers.set(query.data.filter((peer) => peer.peerID !== Engine.instance.store.peerID))
    }
  }, [query.status])

  useEffect(() => {
    const interval = setInterval(() => {
      query.refetch()
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      {otherPeers.value.map((peer) => (
        <PeerReactor
          key={peer.peerID}
          peerID={peer.peerID}
          peerIndex={peer.peerIndex}
          userID={peer.userID}
          networkID={props.networkID}
        />
      ))}
    </>
  )
}

const sendMessage: SendMessageType = (networkID: NetworkID, toPeerID: PeerID, message: MessageTypes) => {
  // console.log('sendMessage', instanceID, toPeerID, message)
  API.instance.service(p2pSignalingPath).patch(null, {
    networkID: networkID,
    targetPeerID: toPeerID,
    message
  })
}

const PeerReactor = (props: { peerID: PeerID; peerIndex: number; userID: UserID; networkID: NetworkID }) => {
  const network = getState(NetworkState).networks[props.networkID]

  useWebRTCPeerConnection(network, props.peerID, props.peerIndex, props.userID, sendMessage)

  useEffect(() => {
    API.instance.service(p2pSignalingPath).on('patched', (data) => {
      // need to ignore messages from self
      if (data.fromPeerID !== props.peerID) return
      if (data.targetPeerID !== Engine.instance.store.peerID) return
      if (data.networkID !== network.id) return

      WebRTCTransportFunctions.onMessage(sendMessage, data.networkID, props.peerID, data.message)
    })
  }, [])

  return null
}
