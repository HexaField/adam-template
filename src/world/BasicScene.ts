import { GLTF } from '@gltf-transform/core'
import { EntityUUID, getMutableComponent, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { AssetState, SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { useEffect } from 'react'
import { Cache } from 'three'
import { v4 as uuidv4 } from 'uuid'

// create scene with a rigidbody loaded offset from the origin
const createSceneGLTF = (): GLTF.IGLTF => ({
  asset: {
    version: '2.0',
    generator: 'iR Engine'
  },
  scenes: [{ nodes: [0] }],
  scene: 0,
  nodes: [
    {
      matrix: [100, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 100, 0, 0, 1, 0, 1],
      name: 'Rigidbody',
      extensions: {
        EE_uuid: uuidv4(),
        EE_visible: true,
        EE_rigidbody: {
          type: 'fixed'
        },
        EE_collider: {
          shape: 'box'
        },
        EE_shadow: {
          cast: true,
          receive: true
        },
        EE_primitive_geometry: {
          geometryType: 0,
          geometryParams: {
            width: 1,
            height: 1,
            depth: 1
          }
        }
      }
    }
  ],
  extensionsUsed: ['EE_uuid', 'EE_visible', 'EE_rigidbody', 'EE_collider', 'EE_primitive_geometry']
})

export const useBasicScene = (sceneID: string) => {
  const gltfEntityState = useHookstate(UndefinedEntity)
  const { viewerEntity, originEntity } = useMutableState(ReferenceSpaceState).value

  useEffect(() => {
    if (!viewerEntity || !originEntity) return

    const gltf = createSceneGLTF()

    const sceneURL = `/${sceneID}.gltf`

    Cache.enabled = true
    Cache.add(sceneURL, gltf)

    const gltfEntity = AssetState.load(sceneURL, sceneURL as EntityUUID, originEntity)
    getMutableComponent(viewerEntity, RendererComponent).scenes.merge([gltfEntity])
    setComponent(gltfEntity, SceneComponent, { active: true })
    getMutableState(SceneState)[sceneURL].set(gltfEntity)

    gltfEntityState.set(gltfEntity)

    return () => {
      gltfEntityState.set(UndefinedEntity)
      AssetState.unload(gltfEntity)
      getMutableState(SceneState)[sceneURL].set(gltfEntity)
    }
  }, [viewerEntity, originEntity])

  return gltfEntityState.value
}
