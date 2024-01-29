import React, { useEffect } from 'react'

import Debug from '@etherealengine/client-core/src/components/Debug'
import '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'

import '@etherealengine/client/src/themes/base.css'
import '@etherealengine/client/src/themes/components.css'
import '@etherealengine/client/src/themes/utilities.css'
import 'daisyui/dist/full.css'
import 'tailwindcss/tailwind.css'

import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

import { Entity, createEntity, defineSystem, getComponent, setComponent } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { V_010 } from '@etherealengine/engine/src/common/constants/MathConstants'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { TransformSystem } from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { addObjectToGroup } from '@etherealengine/engine/src/renderer/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/common/NameComponent'

const SceneState = defineState({
  name: 'ee.minimalist.SceneState',
  initial: () => ({
    entity: createEntity()
  })
})

const UpdateSystem = defineSystem({
  uuid: 'ee.minimalist.UpdateSystem',
  insert: { before: TransformSystem },
  execute: () => {
    const entity = getState(SceneState).entity
    const elapsedSeconds = getState(ECSState).elapsedSeconds

    const transformComponent = getComponent(entity, TransformComponent)

    if (transformComponent) {
      transformComponent.rotation.setFromAxisAngle(V_010, elapsedSeconds)
    }
  },
  reactor: function () {
    const state = getMutableState(SceneState)

    useEffect(() => {
      // Create a box at the origin
      const entity = state.entity.value as Entity
      const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }))
      addObjectToGroup(entity, mesh)
      setComponent(entity, NameComponent, 'Box')

      // Make the camera look at the box
      const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
      camera.lookAt(0, 0, 0)
      const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
      cameraTransform.rotation.copy(camera.quaternion)
    }, [])

    return null
  }
})

export default function Template() {
  return (
    <>
      <Debug />
    </>
  )
}
