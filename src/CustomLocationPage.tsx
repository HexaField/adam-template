import React, { useEffect } from 'react'

import Debug from '@etherealengine/client-core/src/components/Debug'
import { defineState, getMutableState, getState, useMutableState, useReactiveRef } from '@etherealengine/hyperflux'
import '@etherealengine/spatial/src/renderer/WebGLRendererSystem'

import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

import { useEngineCanvas } from '@etherealengine/client-core/src/hooks/useEngineCanvas'
import { UndefinedEntity, createEntity, defineSystem, getComponent, setComponent } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { Vector3_Up } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { TransformSystem, computeTransformMatrix } from '@etherealengine/spatial/src/transform/systems/TransformSystem'

const SceneState = defineState({
  name: 'ee.minimalist.SceneState',
  initial: {
    entity: UndefinedEntity
  }
})

const UpdateSystem = defineSystem({
  uuid: 'ee.minimalist.UpdateSystem',
  insert: { before: TransformSystem },
  execute: () => {
    const entity = getState(SceneState).entity
    if (!entity) return

    const elapsedSeconds = getState(ECSState).elapsedSeconds
    const transformComponent = getComponent(entity, TransformComponent)
    transformComponent.rotation.setFromAxisAngle(Vector3_Up, elapsedSeconds)
  },
  reactor: function () {
    const viewerEntity = useMutableState(EngineState).viewerEntity.value

    useEffect(() => {
      if (!viewerEntity) return

      // Create a new entity
      const entity = createEntity()
      setComponent(entity, TransformComponent)
      setComponent(entity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

      // Create a box at the origin
      const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }))
      addObjectToGroup(entity, mesh)
      setComponent(entity, NameComponent, 'Box')
      setComponent(entity, VisibleComponent)

      // Make the camera look at the box
      const cameraTransform = getComponent(viewerEntity, TransformComponent)
      const camera = getComponent(viewerEntity, CameraComponent)
      cameraTransform.position.set(5, 2, 0)
      cameraTransform.rotation.copy(camera.quaternion)
      computeTransformMatrix(viewerEntity)
      camera.lookAt(0, 0, 0)

      getMutableState(SceneState).entity.set(entity)
    }, [viewerEntity])

    return null
  }
})

export default function Template() {
  const [ref, setRef] = useReactiveRef()

  useEngineCanvas(ref)

  return (
    <>
      <div ref={setRef} style={{ width: '100%', height: '100%' }} />
      <Debug />
    </>
  )
}
