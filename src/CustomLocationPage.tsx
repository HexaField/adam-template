import React, { useEffect } from 'react'

import Debug from '@etherealengine/client-core/src/components/Debug'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'
import '@etherealengine/spatial/src/renderer/WebGLRendererSystem'

import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

import { Entity, createEntity, defineSystem, getComponent, setComponent } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { V_010 } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { TransformSystem, computeTransformMatrix } from '@etherealengine/spatial/src/transform/systems/TransformSystem'

const SceneState = defineState({
  name: 'ee.minimalist.SceneState',
  initial: () => {
    const entity = createEntity()
    setComponent(entity, TransformComponent)
    return {
      entity
    }
  }
})

const UpdateSystem = defineSystem({
  uuid: 'ee.minimalist.UpdateSystem',
  insert: { before: TransformSystem },
  execute: () => {
    const entity = getState(SceneState).entity
    const elapsedSeconds = getState(ECSState).elapsedSeconds
    const transformComponent = getComponent(entity, TransformComponent)
    transformComponent.rotation.setFromAxisAngle(V_010, elapsedSeconds)
  },
  reactor: function () {
    const state = getMutableState(SceneState)

    useEffect(() => {
      // Create a box at the origin
      const entity = state.entity.value as Entity
      const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }))
      addObjectToGroup(entity, mesh)
      setComponent(entity, NameComponent, 'Box')
      setComponent(entity, VisibleComponent)

      // Make the camera look at the box
      const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
      const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
      cameraTransform.position.set(5, 2, 0)
      cameraTransform.rotation.copy(camera.quaternion)
      computeTransformMatrix(Engine.instance.cameraEntity)
      camera.lookAt(0, 0, 0)
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
