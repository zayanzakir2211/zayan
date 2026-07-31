import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type HydraSceneProps = {
  onReady?: () => void
}

type HeadRig = {
  pivot: THREE.Group
  eyes: THREE.Mesh[]
  hitMesh: THREE.Mesh
  home: THREE.Vector3
  phase: number
}

/**
 * An original, procedural hydra built entirely from Three.js primitives.
 * No downloaded model or franchise artwork is used. Lower-powered devices get
 * fewer heads and particles while preserving the scene's visual identity.
 */
export default function HydraScene({ onReady }: HydraSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const onReadyRef = useRef(onReady)

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const compact = window.innerWidth < 760
    const lowPower = compact || (navigator.hardwareConcurrency ?? 8) <= 4
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050505, 0.092)

    const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 70)
    camera.position.set(compact ? 0 : 0.9, compact ? 0.15 : 0.3, compact ? 13.8 : 11.5)

    const renderer = new THREE.WebGLRenderer({
      antialias: !lowPower,
      alpha: true,
      powerPreference: lowPower ? 'low-power' : 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.65))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.84
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    const world = new THREE.Group()
    const worldBaseY = compact ? 1.35 : 0.35
    world.position.set(compact ? 0 : 2.65, worldBaseY, 0)
    world.rotation.x = -0.04
    scene.add(world)

    // Procedural scale texture gives the beast an organic skin without an asset download.
    const scaleCanvas = document.createElement('canvas')
    scaleCanvas.width = 256
    scaleCanvas.height = 256
    const ctx = scaleCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#172019'
      ctx.fillRect(0, 0, 256, 256)
      for (let y = -16; y < 272; y += 24) {
        for (let x = -16; x < 272; x += 24) {
          const offset = (Math.floor(y / 24) % 2) * 12
          ctx.beginPath()
          ctx.ellipse(x + offset, y, 11, 15, 0, 0, Math.PI * 2)
          ctx.fillStyle = '#28372b'
          ctx.fill()
          ctx.strokeStyle = '#080b09'
          ctx.lineWidth = 3
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(x + offset - 3, y - 4, 2, 0, Math.PI * 2)
          ctx.fillStyle = '#516153'
          ctx.fill()
        }
      }
    }
    const scaleTexture = new THREE.CanvasTexture(scaleCanvas)
    scaleTexture.wrapS = scaleTexture.wrapT = THREE.RepeatWrapping
    scaleTexture.repeat.set(3.2, 3.2)
    scaleTexture.colorSpace = THREE.SRGBColorSpace

    const skin = new THREE.MeshStandardMaterial({
      color: 0x18251c,
      map: scaleTexture,
      bumpMap: scaleTexture,
      bumpScale: 0.11,
      roughness: 0.78,
      metalness: 0.08,
    })
    const darkSkin = new THREE.MeshStandardMaterial({
      color: 0x0b100d,
      roughness: 0.95,
      metalness: 0.05,
    })
    const bone = new THREE.MeshStandardMaterial({
      color: 0x393d31,
      roughness: 0.88,
    })
    const membrane = new THREE.MeshStandardMaterial({
      color: 0x2f0c0b,
      roughness: 0.9,
      side: THREE.DoubleSide,
    })
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcfff45,
      emissive: 0x86c526,
      emissiveIntensity: 4.2,
      roughness: 0.18,
    })

    // Heavy chest mass anchoring the necks in shadow.
    const torso = new THREE.Mesh(new THREE.IcosahedronGeometry(1.62, lowPower ? 1 : 2), skin)
    torso.scale.set(1.45, 0.92, 0.74)
    torso.position.set(0, -1.65, -0.65)
    world.add(torso)

    const breast = new THREE.Mesh(new THREE.SphereGeometry(1.25, 20, 12), darkSkin)
    breast.scale.set(1.55, 0.72, 0.5)
    breast.position.set(0, -2.05, -0.08)
    world.add(breast)

    const headBlueprints = compact
      ? [
          { x: -1.65, y: 0.62, z: 0.22, phase: 0.2 },
          { x: 0, y: 1.4, z: -0.12, phase: 1.8 },
          { x: 1.65, y: 0.55, z: 0.25, phase: 3.4 },
        ]
      : [
          { x: -2.7, y: 0.05, z: -0.25, phase: 0.1 },
          { x: -1.45, y: 1.22, z: 0.1, phase: 1.4 },
          { x: 0, y: 1.88, z: -0.3, phase: 2.7 },
          { x: 1.48, y: 1.18, z: 0.08, phase: 3.8 },
          { x: 2.72, y: 0.03, z: -0.25, phase: 5.1 },
        ]

    const heads: HeadRig[] = []
    const hitMeshes: THREE.Mesh[] = []
    const eyeGeometry = new THREE.SphereGeometry(0.065, 12, 8)

    headBlueprints.forEach((blueprint, index) => {
      const end = new THREE.Vector3(blueprint.x, blueprint.y, blueprint.z)
      const start = new THREE.Vector3((blueprint.x / 2.8) * 0.9, -1.5, -0.55)
      const mid = new THREE.Vector3(blueprint.x * 0.62, blueprint.y * 0.18 - 0.45, blueprint.z - 0.28)
      const curve = new THREE.CatmullRomCurve3([start, mid, end])
      const neck = new THREE.Mesh(
        new THREE.TubeGeometry(curve, lowPower ? 16 : 28, compact ? 0.32 : 0.38, lowPower ? 7 : 10, false),
        skin,
      )
      world.add(neck)

      // Irregular dorsal spines make every silhouette feel hand-grown rather than cloned.
      if (!lowPower || index === 1) {
        for (let spike = 1; spike < 5; spike += 1) {
          const p = curve.getPoint(spike / 6)
          const spine = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55 - spike * 0.045, 5), bone)
          spine.position.copy(p)
          spine.position.z -= 0.25
          spine.rotation.x = -0.35
          spine.rotation.z = (index - 2) * 0.12
          world.add(spine)
        }
      }

      const pivot = new THREE.Group()
      pivot.position.copy(end)
      pivot.userData.phase = blueprint.phase
      world.add(pivot)

      const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.64, lowPower ? 1 : 2), skin)
      skull.scale.set(0.78, 0.66, 1.15)
      skull.position.z = 0.1
      pivot.add(skull)

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.34, 2, 1, 1), darkSkin)
      brow.position.set(0, 0.18, 0.45)
      brow.rotation.x = -0.22
      pivot.add(brow)

      const snout = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), skin)
      snout.scale.set(0.82, 0.42, 1.08)
      snout.position.set(0, -0.08, 0.62)
      pivot.add(snout)

      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.7, 2, 1, 2), darkSkin)
      jaw.position.set(0, -0.33, 0.5)
      jaw.rotation.x = 0.08
      pivot.add(jaw)

      // Small asymmetrical fangs catch the torchlight and sharpen the silhouette.
      ;[-1, 1].forEach((side) => {
        const fang = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.22, 5), bone)
        fang.position.set(side * 0.16, -0.23 + (side > 0 ? 0.025 : 0), 0.79)
        fang.rotation.z = Math.PI
        pivot.add(fang)
      })

      // Paired rear horns.
      ;[-1, 1].forEach((side) => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.8, 6), bone)
        horn.position.set(side * 0.34, 0.37, -0.12)
        horn.rotation.set(side * -0.28, 0, side * -0.38)
        pivot.add(horn)
      })

      // Deep red neck fins, deliberately subtle until caught by a rim light.
      const finGeometry = new THREE.BufferGeometry()
      finGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 0.42, -0.34, 0, 0.97, -0.45, 0, 0.22, 0.2], 3),
      )
      finGeometry.computeVertexNormals()
      const fin = new THREE.Mesh(finGeometry, membrane)
      pivot.add(fin)

      const eyes: THREE.Mesh[] = []
      ;[-1, 1].forEach((side) => {
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial)
        eye.position.set(side * 0.245, 0.13, 0.61)
        eye.scale.set(1.2, 0.58, 0.72)
        pivot.add(eye)
        eyes.push(eye)
      })

      skull.userData.isHydraHead = true
      hitMeshes.push(skull, snout)
      heads.push({ pivot, eyes, hitMesh: skull, home: end, phase: blueprint.phase })
    })

    const ambient = new THREE.HemisphereLight(0x5e755f, 0x050505, 0.64)
    scene.add(ambient)
    const toxicRim = new THREE.PointLight(0x9cda3a, 24, 13, 2)
    toxicRim.position.set(-4.2, 3.3, 4.5)
    scene.add(toxicRim)
    const bloodRim = new THREE.PointLight(0x8d1712, 18, 12, 2)
    bloodRim.position.set(5, -0.2, 3.4)
    scene.add(bloodRim)
    const faceLight = new THREE.DirectionalLight(0xaab7a4, 1.1)
    faceLight.position.set(0, 4, 7)
    scene.add(faceLight)

    // Shared smoke point cloud. Each point loops outward from one of the mouths.
    const smokeCount = lowPower ? 24 : 72
    const smokePositions = new Float32Array(smokeCount * 3)
    const smokeSeeds = Array.from({ length: smokeCount }, (_, index) => ({
      head: index % heads.length,
      offset: Math.random(),
      drift: (Math.random() - 0.5) * 0.7,
    }))
    const smokeGeometry = new THREE.BufferGeometry()
    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3))
    const smokeMaterial = new THREE.PointsMaterial({
      color: 0x75866e,
      size: lowPower ? 0.08 : 0.115,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const smoke = new THREE.Points(smokeGeometry, smokeMaterial)
    world.add(smoke)

    // Abyssal motes occupy depth around the creature.
    const moteCount = lowPower ? 45 : 140
    const motePositions = new Float32Array(moteCount * 3)
    for (let i = 0; i < moteCount; i += 1) {
      motePositions[i * 3] = (Math.random() - 0.5) * 15
      motePositions[i * 3 + 1] = (Math.random() - 0.5) * 9
      motePositions[i * 3 + 2] = (Math.random() - 0.5) * 9
    }
    const moteGeometry = new THREE.BufferGeometry()
    moteGeometry.setAttribute('position', new THREE.BufferAttribute(motePositions, 3))
    const moteMaterial = new THREE.PointsMaterial({
      color: 0xb4d681,
      size: 0.025,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
    })
    const motes = new THREE.Points(moteGeometry, moteMaterial)
    scene.add(motes)

    const pointer = new THREE.Vector2(0, 0)
    const pointerWorld = new THREE.Vector3(0, 0, 5)
    const raycaster = new THREE.Raycaster()
    let pointerActive = false
    let sectionBias = 0
    let dangerCooldown = 0
    let scrollY = window.scrollY

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
      pointerActive = true
      if (!reduceMotion) {
        raycaster.setFromCamera(pointer, camera)
        const hit = raycaster.intersectObjects(hitMeshes, false)[0]
        const now = performance.now()
        if (hit && now > dangerCooldown) {
          dangerCooldown = now + 1700
          window.dispatchEvent(new CustomEvent('hydra-danger'))
        }
      }
    }

    const onSection = (event: Event) => {
      const detail = (event as CustomEvent<{ index: number }>).detail
      sectionBias = ((detail?.index ?? 0) % 5 - 2) * 0.12
    }

    const onScroll = () => {
      scrollY = window.scrollY
    }

    const onResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 760 ? 1 : 1.65))
      renderer.render(scene, camera)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('hydra-section', onSection)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    const lookDummy = new THREE.Object3D()
    let animationFrame = 0

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      const scrollProgress = Math.min(scrollY / Math.max(window.innerHeight, 1), 3)
      const breathe = reduceMotion ? 1 : 1 + Math.sin(elapsed * 1.18) * 0.025
      torso.scale.y = 0.92 * breathe
      torso.position.y = -1.65 + (reduceMotion ? 0 : Math.sin(elapsed * 1.18) * 0.035)

      // Unproject the visitor's pointer onto a plane in front of the beast.
      pointerWorld.set(pointer.x, pointer.y, 0.25).unproject(camera)
      const direction = pointerWorld.sub(camera.position).normalize()
      const distance = (3.7 - camera.position.z) / direction.z
      pointerWorld.copy(camera.position).add(direction.multiplyScalar(distance))
      pointerWorld.y += sectionBias - Math.min(scrollProgress, 2) * 0.08

      heads.forEach((head, index) => {
        const idleTarget = new THREE.Vector3(
          head.home.x * 0.18 + Math.sin(elapsed * 0.37 + head.phase) * 0.22,
          0.25 + Math.cos(elapsed * 0.46 + head.phase) * 0.16,
          5,
        )
        const target = pointerActive && !reduceMotion ? pointerWorld : idleTarget
        lookDummy.position.copy(head.pivot.position)
        lookDummy.lookAt(target)
        head.pivot.quaternion.slerp(lookDummy.quaternion, reduceMotion ? 1 : 0.035 + index * 0.002)

        if (!reduceMotion) {
          head.pivot.position.y = head.home.y + Math.sin(elapsed * 0.82 + head.phase) * 0.07
          head.pivot.rotation.z += Math.sin(elapsed * 0.34 + head.phase) * 0.0006
          const blinkCycle = (elapsed * 0.62 + head.phase) % 5.2
          const blink = blinkCycle > 4.94 ? 0.05 : 0.58
          head.eyes.forEach((eye) => {
            eye.scale.y = THREE.MathUtils.lerp(eye.scale.y, blink, 0.22)
          })
        }
      })

      if (!reduceMotion) {
        const positions = smokeGeometry.attributes.position as THREE.BufferAttribute
        smokeSeeds.forEach((seed, index) => {
          const head = heads[seed.head]
          const cycle = (elapsed * 0.11 + seed.offset) % 1
          positions.setXYZ(
            index,
            head.pivot.position.x + seed.drift * cycle,
            head.pivot.position.y - 0.14 + Math.sin(cycle * Math.PI * 2 + seed.offset) * 0.1 + cycle * 0.5,
            head.pivot.position.z + 0.5 + cycle * 4.4,
          )
        })
        positions.needsUpdate = true
        smokeMaterial.opacity = 0.11 + Math.sin(elapsed * 0.7) * 0.04
        motes.rotation.y = elapsed * 0.012
        motes.position.y = Math.sin(elapsed * 0.18) * 0.2
        toxicRim.intensity = 20 + Math.sin(elapsed * 2.3) * 3.2 + Math.sin(elapsed * 7.1) * 1.4
        world.position.y += (worldBaseY - Math.min(scrollProgress, 2.2) * 0.32 - world.position.y) * 0.035
        world.rotation.y = Math.sin(elapsed * 0.11) * 0.025
      }

      renderer.render(scene, camera)
      if (!reduceMotion) animationFrame = window.requestAnimationFrame(animate)
    }

    animate()
    onReadyRef.current?.()

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('hydra-section', onSection)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry?.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material?.dispose())
        }
      })
      scaleTexture.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="hydra-canvas" aria-hidden="true" />
}
