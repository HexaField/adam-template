import React, { useEffect } from 'react'

import Debug from '@etherealengine/client-core/src/components/Debug'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { defineSystem, startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { EngineRenderer, WebGLRendererSystem } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { defineState, dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import 'tailwindcss/tailwind.css'
import '@etherealengine/client/src/themes/base.css'
import '@etherealengine/client/src/themes/components.css'
import '@etherealengine/client/src/themes/utilities.css'
import 'daisyui/dist/full.css'

import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { V_010 } from '@etherealengine/engine/src/common/constants/MathConstants'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { TransformSystem } from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'

const SceneState = defineState({
  name: 'ee.minimalist.SceneState',
  initial: () => ({
    entity: createEntity()
  })
})

const UpdateSystem = defineSystem({
  uuid: 'ee.minimalist.UpdateSystem',
  execute: () => {
    const entity = getState(SceneState).entity
    const elapsedSeconds = getState(EngineState).elapsedSeconds

    const transformComponent = getComponent(entity, TransformComponent)

    if (transformComponent) {
      transformComponent.rotation.setFromAxisAngle(V_010, elapsedSeconds)
    }

    getComponent(Engine.instance.cameraEntity, CameraComponent).lookAt(0, 0, 0)
  },
  reactor: function () {
    const state = getMutableState(SceneState)

    useEffect(() => {
      const entity = state.entity.value as Entity
      const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }))
      addObjectToGroup(entity, mesh)
      setComponent(entity, NameComponent, 'Box')
    }, [])

    return null
  }
})

export const startClientSystems = () => {
  startSystems([UpdateSystem], { before: TransformSystem })
  startSystems([WebGLRendererSystem], { with: PresentationSystemGroup })
}

export default function Template() {
  const engineState = useHookstate(getMutableState(EngineState))

  useEffect(() => {
    if (getMutableState(EngineState).isEngineInitialized.value) return
    dispatchAction(EngineActions.initializeEngine({ initialised: true }))

    startClientSystems()
  }, [])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <Debug />
    </>
  )
}
