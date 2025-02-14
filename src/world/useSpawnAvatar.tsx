import { EntityUUID } from '@ir-engine/ecs'
import { DomainConfigState } from '@ir-engine/engine/src/assets/state/DomainConfigState'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { dispatchAction, getState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { AgentState } from '../ad4m/useADAM'

import '@ir-engine/engine/src/avatar/AvatarModule'

export const useSpawnAvatar = (neighbourhood: string) => {
  useEffect(() => {
    const agent = getState(AgentState)
    const avatarUUID = (agent!.did! + '_avatar') as EntityUUID
    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: neighbourhood as EntityUUID,
        avatarURL:
          getState(DomainConfigState).cloudDomain + '/projects/ir-engine/default-project/assets/avatars/irRobot.vrm',
        entityUUID: avatarUUID,
        name: 'My Avatar' /** @todo get name, maybe from flux? */
      })
    )
  })

  return null
}
