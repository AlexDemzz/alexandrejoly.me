import {
  DataTexture,
  DataUtils,
  DirectionalLight,
  EquirectangularReflectionMapping,
  HalfFloatType,
  ImageLoader,
  InstancedMesh,
  LinearFilter,
  LinearSRGBColorSpace,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  NeutralToneMapping,
  OrthographicCamera,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  RGBAFormat,
  SRGBColorSpace,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  ShadowMaterial,
  SpotLight,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";
import type { Material, MeshStandardMaterial, Object3D, Texture } from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HorizontalBlurShader } from "three/addons/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/addons/shaders/VerticalBlurShader.js";

import { carouselEnvironment } from "./carousel-environment";
import {
  CAMERA,
  FOCUS_KNOB,
  FRAME,
  KEY,
  KEY_LIGHT,
  LENS,
  SLIDE_TRAVEL,
  TIMER_SWITCH,
  TRAY,
  WALL_LIGHT,
} from "./carousel-frame";
import { carouselModel } from "./carousel-model";
import type { Pose } from "./carousel-rig";

const CAMERA_POSITION = new Vector3(...CAMERA.position);
const CAMERA_TARGET = new Vector3(...CAMERA.target);
const KEY_POSITION = new Vector3(...KEY_LIGHT.position);
const KEY_TARGET = new Vector3(...KEY_LIGHT.target);

const TRAY_AXIS = new Vector3(...TRAY.axis);
const PITCH = (2 * Math.PI) / TRAY.slots;
const LENS_AXIS = new Vector3(...LENS.axis);
const KEY_AXIS = new Vector3(...KEY.axis);
const TIMER_AXIS = new Vector3(...TIMER_SWITCH.axis);
const FOCUS_AXIS = new Vector3(...FOCUS_KNOB.axis);

const EXPOSURE = 0.595;
const DIFFUSE_IBL = 0.45;
const STUDIO = {
  angle: 0.3,
  color: 0xff_ff_ff,
  environment: 1,
  far: 2.5,
  intensity: 19,
  mapSize: 2048,
  near: 1.2,
  position: KEY_POSITION,
  radius: 14,
};
const WALL_DISTANCE = 1.3;
const DIM = {
  angle: 0.36,
  color: 0xff_dc_b4,
  environment: 0.15,
  far: 2.2,
  intensity: 11.5,
  mapSize: 1024,
  near: 0.6,
  position: new Vector3(...WALL_LIGHT)
    .sub(KEY_TARGET)
    .normalize()
    .multiplyScalar(WALL_DISTANCE)
    .add(KEY_TARGET),
  radius: 34,
};
const FILL = { color: 0xff_e0_c2, intensity: 0.12 };
const LAMP_GAIN = 1;
const GROUND = { fade: 0.05, opacity: 0.5, size: 2 };
const MAX_PIXEL_RATIO = 2;

const CONTACT_CENTRE = { x: -0.003, z: -0.05 };
const CONTACT_WIDTH = 0.5;
const CONTACT_DEPTH = 0.62;
const CONTACT_HEIGHT = 0.05;
const CONTACT_RESOLUTION = 512;
const CONTACT_BLUR = 3.2;
const CONTACT_DARKNESS = 1.6;
const CONTACT_OPACITY = 0.5;

export interface CarouselScene {
  dispose: () => void;
  render: (pose: Pose) => void;
  setSize: (width: number, height: number) => void;
  setSlides: (count: number) => void;
}

interface Options {
  dim: boolean;
  onContextLost: () => void;
}

const byName = (root: Object3D, name: string) => {
  const node = root.getObjectByName(name);
  if (!node) {
    throw new Error(`The carousel model has no "${name}" node.`);
  }
  return node;
};

const meshOf = (node: Object3D) => {
  let found: Mesh | null = null;
  node.traverse((part) => {
    if (!found && part instanceof Mesh) {
      found = part;
    }
  });
  if (!found) {
    throw new Error(`The carousel model's "${node.name}" node has no mesh.`);
  }
  return found as Mesh;
};

const materialsOf = (root: Object3D) => {
  const found = new Map<string, Material>();
  root.traverse((node) => {
    if (node instanceof Mesh) {
      const list: Material[] = Array.isArray(node.material)
        ? node.material
        : [node.material];
      for (const material of list) {
        found.set(material.name, material);
      }
    }
  });
  return found;
};

const IBL_DIFFUSE_CHUNK = `
#include <lights_fragment_maps>
iblIrradiance *= diffuseIbl;
`;

const PCF_TAPS =
  /shadow = \(\s*texture\( shadowMap, vec3\( shadowCoord\.xy \+ vogelDiskSample\( 0, 5, phi \)[\s\S]*?\) \* 0\.2;/u;
const SOFT_PCF = `shadow = 0.0;
for ( int i = 0; i < 16; i ++ ) {
  shadow += texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( i, 16, phi ) * radius, shadowCoord.z ) );
}
shadow /= 16.0;`;
const SOFT_SHADOWS = ShaderChunk.shadowmap_pars_fragment.replace(
  PCF_TAPS,
  SOFT_PCF
);

const createGroundShadow = (fade: { value: Vector2 }) => {
  const geometry = new PlaneGeometry(GROUND.size, GROUND.size).rotateX(
    -Math.PI / 2
  );
  const material = new ShadowMaterial({
    depthWrite: false,
    opacity: GROUND.opacity,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.fade = fade;
    shader.fragmentShader = `uniform vec2 fade;\n${shader.fragmentShader
      .replace("#include <shadowmap_pars_fragment>", SOFT_SHADOWS)
      .replace(
        "opacity * ( 1.0 - getShadowMask() )",
        "opacity * ( 1.0 - getShadowMask() ) * smoothstep( 0.0, fade.y, min( gl_FragCoord.y, min( gl_FragCoord.x, fade.x - gl_FragCoord.x ) ) )"
      )}`;
  };
  const ground = new Mesh(geometry, material);
  ground.name = "GroundShadow";
  ground.position.y = 0.0002;
  ground.receiveShadow = true;
  ground.renderOrder = -1;
  return ground;
};

const patchMaterial = (material: Material, diffuseIbl: { value: number }) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.diffuseIbl = diffuseIbl;
    shader.fragmentShader = `uniform float diffuseIbl;\n${shader.fragmentShader
      .replace("#include <lights_fragment_maps>", IBL_DIFFUSE_CHUNK)
      .replace("#include <shadowmap_pars_fragment>", SOFT_SHADOWS)}`;
  };
  material.customProgramCacheKey = () => `carousel-${material.name}`;
};

const createContactShadow = (renderer: WebGLRenderer, scene: Scene) => {
  const target = new WebGLRenderTarget(CONTACT_RESOLUTION, CONTACT_RESOLUTION);
  const blurTarget = new WebGLRenderTarget(
    CONTACT_RESOLUTION,
    CONTACT_RESOLUTION
  );
  target.texture.generateMipmaps = false;
  blurTarget.texture.generateMipmaps = false;

  const geometry = new PlaneGeometry(CONTACT_WIDTH, CONTACT_DEPTH).rotateX(
    Math.PI / 2
  );
  const material = new MeshBasicMaterial({
    depthWrite: false,
    map: target.texture,
    opacity: CONTACT_OPACITY,
    toneMapped: false,
    transparent: true,
  });
  const ground = new Mesh(geometry, material);
  ground.name = "ContactShadow";
  ground.scale.y = -1;
  ground.position.set(CONTACT_CENTRE.x, 0.0004, CONTACT_CENTRE.z);
  ground.renderOrder = -1;
  scene.add(ground);

  const camera = new OrthographicCamera(
    -CONTACT_WIDTH / 2,
    CONTACT_WIDTH / 2,
    CONTACT_DEPTH / 2,
    -CONTACT_DEPTH / 2,
    0,
    CONTACT_HEIGHT
  );
  camera.position.set(CONTACT_CENTRE.x, 0, CONTACT_CENTRE.z);
  camera.rotation.x = Math.PI / 2;

  const depth = new MeshDepthMaterial();
  depth.depthTest = false;
  depth.depthWrite = false;
  depth.onBeforeCompile = (shader) => {
    shader.uniforms.darkness = { value: CONTACT_DARKNESS };
    shader.fragmentShader = `uniform float darkness;\n${shader.fragmentShader.replace(
      "gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );",
      "gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );"
    )}`;
  };

  const horizontal = new ShaderMaterial(HorizontalBlurShader);
  const vertical = new ShaderMaterial(VerticalBlurShader);
  horizontal.depthTest = false;
  vertical.depthTest = false;
  const blurPlane = new Mesh(geometry, horizontal);
  blurPlane.position.set(
    CONTACT_CENTRE.x,
    CONTACT_HEIGHT / 2,
    CONTACT_CENTRE.z
  );
  const blurScene = new Scene();
  blurScene.add(blurPlane);

  const blur = (amount: number) => {
    blurPlane.material = horizontal;
    horizontal.uniforms.tDiffuse.value = target.texture;
    horizontal.uniforms.h.value = amount / 256;
    renderer.setRenderTarget(blurTarget);
    renderer.render(blurScene, camera);
    blurPlane.material = vertical;
    vertical.uniforms.tDiffuse.value = blurTarget.texture;
    vertical.uniforms.v.value = amount / 256;
    renderer.setRenderTarget(target);
    renderer.render(blurScene, camera);
  };

  const draw = () => {
    ground.visible = false;
    const hidden = scene.getObjectByName("GroundShadow");
    if (hidden) {
      hidden.visible = false;
    }
    const { background } = scene;
    scene.background = null;
    scene.overrideMaterial = depth;
    const clear = renderer.getClearAlpha();
    renderer.setClearAlpha(0);
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, camera);
    scene.overrideMaterial = null;
    blur(CONTACT_BLUR);
    blur(CONTACT_BLUR * 0.4);
    renderer.setRenderTarget(null);
    renderer.setClearAlpha(clear);
    scene.background = background;
    ground.visible = true;
    if (hidden) {
      hidden.visible = true;
    }
  };

  const dispose = () => {
    target.dispose();
    blurTarget.dispose();
    geometry.dispose();
    material.dispose();
    depth.dispose();
    horizontal.dispose();
    vertical.dispose();
  };

  return { dispose, draw };
};

const RGBE_SHIFT = 136;

const loadEnvironment = async (url: string) => {
  const image = await new ImageLoader().loadAsync(url);
  const width = image.naturalWidth;
  const height = image.naturalHeight / 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height * 2;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("The carousel's environment could not be decoded.");
  }
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, width, height * 2);
  const texels = new Uint16Array(width * height * 4);
  const exponents = width * height * 4;
  const one = DataUtils.toHalfFloat(1);
  for (let index = 0; index < width * height; index += 1) {
    const at = index * 4;
    const exponent = data[exponents + at];
    const scale = exponent === 0 ? 0 : 2 ** (exponent - RGBE_SHIFT);
    texels[at] = DataUtils.toHalfFloat(data[at] * scale);
    texels[at + 1] = DataUtils.toHalfFloat(data[at + 1] * scale);
    texels[at + 2] = DataUtils.toHalfFloat(data[at + 2] * scale);
    texels[at + 3] = one;
  }
  const texture = new DataTexture(
    texels,
    width,
    height,
    RGBAFormat,
    HalfFloatType
  );
  texture.colorSpace = LinearSRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.flipY = true;
  texture.mapping = EquirectangularReflectionMapping;
  texture.needsUpdate = true;
  return texture;
};

const disposeTree = (root: Object3D) => {
  const textures = new Set<Texture>();
  root.traverse((node) => {
    if (!(node instanceof Mesh)) {
      return;
    }
    node.geometry.dispose();
    const list: Material[] = Array.isArray(node.material)
      ? node.material
      : [node.material];
    for (const material of list) {
      for (const value of Object.values(material)) {
        if (value && typeof value === "object" && "isTexture" in value) {
          textures.add(value as Texture);
        }
      }
      material.dispose();
    }
  });
  for (const texture of textures) {
    texture.dispose();
  }
};

const slotOf = (tray: number) =>
  ((Math.round(tray) % TRAY.slots) + TRAY.slots) % TRAY.slots;

export const createCarouselScene = async (
  canvas: HTMLCanvasElement,
  { dim, onContextLost }: Options
): Promise<CarouselScene> => {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    powerPreference: "high-performance",
    premultipliedAlpha: true,
  });
  renderer.setClearColor(0x00_00_00, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = EXPOSURE;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  let lost = false;
  const handleLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    onContextLost();
  };
  canvas.addEventListener("webglcontextlost", handleLost);

  const pmrem = new PMREMGenerator(renderer);
  let model: Object3D | null = null;
  let environment: Texture | null = null;
  let contact: ReturnType<typeof createContactShadow> | null = null;
  let slides: InstancedMesh | null = null;
  let ground: Mesh<PlaneGeometry, ShadowMaterial> | null = null;

  const lighting = dim ? DIM : STUDIO;
  const fade = { value: new Vector2() };

  const scene = new Scene();
  const release = () => {
    canvas.removeEventListener("webglcontextlost", handleLost);
    if (model) {
      disposeTree(model);
    }
    slides?.dispose();
    contact?.dispose();
    if (ground) {
      ground.geometry.dispose();
      ground.material.dispose();
    }
    environment?.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  try {
    const [gltf, equirect] = await Promise.all([
      new GLTFLoader()
        .setMeshoptDecoder(MeshoptDecoder)
        .loadAsync(carouselModel),
      loadEnvironment(carouselEnvironment),
    ]);
    model = gltf.scene;
    environment = pmrem.fromEquirectangular(equirect).texture;
    equirect.dispose();
  } catch (error) {
    release();
    throw error;
  }

  try {
    scene.environment = environment;
    scene.environmentIntensity = lighting.environment;
    scene.add(model);

    const camera = new PerspectiveCamera(
      CAMERA.fov,
      FRAME.width / FRAME.height,
      0.2,
      4
    );
    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(CAMERA_TARGET);

    const key = new SpotLight(
      lighting.color,
      lighting.intensity,
      0,
      lighting.angle,
      0.4,
      2
    );
    key.position.copy(lighting.position);
    key.target.position.copy(KEY_TARGET);
    key.castShadow = true;
    key.shadow.mapSize.set(lighting.mapSize, lighting.mapSize);
    key.shadow.camera.near = lighting.near;
    key.shadow.camera.far = lighting.far;
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.0004;
    key.shadow.radius = lighting.radius;
    scene.add(key, key.target);
    if (dim) {
      const fill = new DirectionalLight(FILL.color, FILL.intensity);
      fill.position.copy(CAMERA_POSITION);
      ground = createGroundShadow(fade);
      scene.add(fill, ground);
    }

    const tray = byName(model, "Tray");
    const slide = byName(model, "Slide");
    const lens = byName(model, "Lens");
    const forward = byName(model, "Forward");
    const reverse = byName(model, "Reverse");
    const timer = byName(model, "Timer");
    const focus = byName(model, "Focus");
    const lensRest = lens.position.clone();
    const forwardRest = forward.position.clone();
    const reverseRest = reverse.position.clone();
    const timerRest = timer.position.clone();
    const gate = slide.position.clone().sub(tray.position).divide(tray.scale);
    const slideScale = slide.scale.clone().divide(tray.scale);
    const slideDrop = SLIDE_TRAVEL / tray.scale.y;
    const trayRest = tray.quaternion.clone();
    const slideMesh = meshOf(slide);
    slide.visible = false;

    const casters = new Set([
      "Fittings",
      "Focus",
      "Forward",
      "Lens",
      "Reverse",
      "Timer",
      "Tray",
    ]);
    const receivers = new Set(["Base", "Body", "Deck"]);
    for (const node of model.children) {
      node.traverse((part) => {
        part.castShadow = dim || casters.has(node.name);
        part.receiveShadow = receivers.has(node.name);
      });
    }

    const materials = materialsOf(model);
    const diffuseIbl = { value: DIFFUSE_IBL };
    for (const material of materials.values()) {
      patchMaterial(material, diffuseIbl);
    }
    (materials.get("Chrome") as MeshStandardMaterial).envMapIntensity = 1;

    contact = createContactShadow(renderer, scene);
    contact.draw();

    const matrix = new Matrix4();
    const turn = new Quaternion();
    const at = new Vector3();
    let count = 0;
    let placed = { drop: -1, slot: -1 };

    const placeSlides = (slot: number, drop: number) => {
      if (!slides || (placed.slot === slot && placed.drop === drop)) {
        return;
      }
      placed = { drop, slot };
      for (let index = 0; index < count; index += 1) {
        turn.setFromAxisAngle(TRAY_AXIS, -TRAY.forward * index * PITCH);
        at.copy(gate).applyQuaternion(turn);
        if (index === slot) {
          at.addScaledVector(TRAY_AXIS, -drop * slideDrop);
        }
        slides.setMatrixAt(index, matrix.compose(at, turn, slideScale));
      }
      slides.instanceMatrix.needsUpdate = true;
    };

    const setSlides = (next: number) => {
      const wanted = Math.min(Math.max(0, next), TRAY.slots);
      if (wanted === count) {
        return;
      }
      if (slides) {
        tray.remove(slides);
        slides.dispose();
        slides = null;
      }
      count = wanted;
      placed = { drop: -1, slot: -1 };
      if (count === 0) {
        return;
      }
      slides = new InstancedMesh(slideMesh.geometry, slideMesh.material, count);
      slides.name = "Slides";
      slides.castShadow = true;
      slides.frustumCulled = false;
      tray.add(slides);
    };

    const render = (pose: Pose) => {
      if (lost) {
        return;
      }
      tray.quaternion
        .setFromAxisAngle(TRAY_AXIS, TRAY.forward * pose.tray * PITCH)
        .multiply(trayRest);
      placeSlides(slotOf(pose.gate.slot), pose.gate.drop);
      lens.position
        .copy(lensRest)
        .addScaledVector(LENS_AXIS, pose.focus * LENS.travel);
      forward.position
        .copy(forwardRest)
        .addScaledVector(KEY_AXIS, pose.forward * KEY.travel);
      reverse.position
        .copy(reverseRest)
        .addScaledVector(KEY_AXIS, pose.reverse * KEY.travel);
      timer.position
        .copy(timerRest)
        .addScaledVector(TIMER_AXIS, pose.timer * TIMER_SWITCH.travel);
      focus.quaternion.setFromAxisAngle(
        FOCUS_AXIS,
        FOCUS_KNOB.sharp - pose.focus * FOCUS_KNOB.sweep
      );
      if (dim) {
        key.intensity = lighting.intensity * (1 + LAMP_GAIN * pose.shutter);
      }
      renderer.render(scene, camera);
    };

    return {
      dispose: () => {
        release();
        renderer.forceContextLoss();
      },
      render,
      setSize: (width, height) => {
        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)
        );
        renderer.setSize(width, height, false);
        fade.value.set(canvas.width, canvas.height * GROUND.fade);
      },
      setSlides,
    };
  } catch (error) {
    release();
    throw error;
  }
};
