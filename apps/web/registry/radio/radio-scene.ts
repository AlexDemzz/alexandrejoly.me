import {
  BufferGeometry,
  Color,
  DataTexture,
  DataUtils,
  EquirectangularReflectionMapping,
  Float32BufferAttribute,
  Group,
  HalfFloatType,
  ImageLoader,
  LinearFilter,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  NeutralToneMapping,
  OrthographicCamera,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RGBAFormat,
  SRGBColorSpace,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SpotLight,
  UnsignedByteType,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";
import type { Material, MeshStandardMaterial, Object3D, Texture } from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HorizontalBlurShader } from "three/addons/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/addons/shaders/VerticalBlurShader.js";

import { radioEnvironment } from "./radio-environment";
import {
  CAMERA,
  DIAL,
  FRAME,
  HALO,
  KEY,
  KEY_LIGHT,
  LIT,
  POINTER,
  TUNING_KNOB,
  VOLUME_KNOB,
} from "./radio-frame";
import { radioModel } from "./radio-model";
import type { Pose } from "./radio-rig";

const CAMERA_POSITION = new Vector3(...CAMERA.position);
const CAMERA_TARGET = new Vector3(...CAMERA.target);
const KEY_POSITION = new Vector3(...KEY_LIGHT.position);
const KEY_TARGET = new Vector3(...KEY_LIGHT.target);

const KEY_AXIS = new Vector3(...KEY.axis);
const VOLUME_AXIS = new Vector3(...VOLUME_KNOB.axis);
const TUNING_AXIS = new Vector3(...TUNING_KNOB.axis);
const POINTER_AXIS = new Vector3(...POINTER.axis);

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
  radius: 14,
};
const MAX_PIXEL_RATIO = 2;
const CLOTH_SHADE = 0.62;

const CONTACT_CENTRE = { x: 0, z: 0 };
const CONTACT_WIDTH = 0.46;
const CONTACT_DEPTH = 0.34;
const CONTACT_HEIGHT = 0.05;
const CONTACT_RESOLUTION = 512;
const CONTACT_BLUR = 3.2;
const CONTACT_DARKNESS = 1.6;
const CONTACT_OPACITY = 0.5;

const HALO_TEXELS = { height: 32, width: 128 };
const KEY_EXPORTED_X = -KEY.row / 2 + (KEY.width + KEY.gap) / 2;
const HALO_END = 0.09;

export interface RadioScene {
  dispose: () => void;
  render: (pose: Pose) => void;
  setBands: (count: number) => void;
  setSize: (width: number, height: number) => void;
}

interface Options {
  onContextLost: () => void;
}

const byName = (root: Object3D, name: string) => {
  const node = root.getObjectByName(name);
  if (!node) {
    throw new Error(`The radio model has no "${name}" node.`);
  }
  return node;
};

const pivotAt = (node: Object3D, origin: readonly number[]) => {
  const pivot = new Group();
  pivot.name = `${node.name}Pivot`;
  pivot.position.set(origin[0], origin[1], origin[2]);
  node.parent?.add(pivot);
  pivot.updateMatrixWorld(true);
  pivot.attach(node);
  return pivot;
};

const keyTemplate = (mesh: Mesh) => {
  mesh.updateWorldMatrix(true, false);
  const source = mesh.geometry.getAttribute("position");
  const at = new Vector3();
  const template = new Float32Array(source.count * 3);
  for (let index = 0; index < source.count; index += 1) {
    at.fromBufferAttribute(source, index).applyMatrix4(mesh.matrixWorld);
    template[index * 3] = at.x - KEY_EXPORTED_X;
    template[index * 3 + 1] = at.y - KEY.hinge[1];
    template[index * 3 + 2] = at.z - KEY.hinge[2];
  }
  return template;
};

const widenKey = (mesh: Mesh, template: Float32Array, width: number) => {
  const shift = (width - KEY.width) / 2;
  const positions = template.slice();
  for (let index = 0; index < positions.length; index += 3) {
    positions[index] += Math.sign(positions[index]) * shift;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", mesh.geometry.getAttribute("normal"));
  geometry.setIndex(mesh.geometry.getIndex());
  return geometry;
};

const lineStep = (count: number) =>
  Math.min(DIAL.pitch, DIAL.span / Math.max(count - 1, 1));

const scaleLine = (band: number, count: number) => {
  const step = lineStep(count);
  const tight = step / DIAL.pitch;
  const v = step * ((count - 1) / 2 - band);
  const [pitch, every] = DIAL.rhythms[band % DIAL.rhythms.length];
  const { half, rule, tick } = DIAL;
  const rects: number[][] = [[-half, v - rule, half, v + rule]];
  const intervals = Math.round((2 * half) / pitch);
  for (let index = 0; index <= intervals; index += 1) {
    const u = -half + (2 * half * index) / intervals;
    const height = (index % every === 0 ? tick.tall : tick.short) * tight;
    rects.push([u - tick.half, v, u + tick.half, v + height]);
  }
  if (band === count - 1) {
    const { above, below, line, margin } = DIAL.box;
    const [u0, u1] = [-half - margin, half + margin];
    const [v0, v1] = [v - below * tight, v + above * tight];
    rects.push(
      [u0, v0, u1, v0 + line],
      [u0, v1 - line, u1, v1],
      [u0, v0, u0 + line, v1],
      [u1 - line, v0, u1, v1]
    );
  }
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  for (const [u0, v0, u1, v1] of rects) {
    const first = positions.length / 3;
    positions.push(u0, v0, 0, u1, v0, 0, u1, v1, 0, u0, v1, 0);
    normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
    indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return { geometry, v };
};

const meshesOf = (node: Object3D) => {
  const found: Mesh[] = [];
  node.traverse((part) => {
    if (part instanceof Mesh) {
      found.push(part);
    }
  });
  return found;
};

const materialsOf = (root: Object3D) => {
  const found = new Set<Material>();
  for (const mesh of meshesOf(root)) {
    const list: Material[] = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const material of list) {
      found.add(material);
    }
  }
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

const patchMaterial = (material: Material, diffuseIbl: { value: number }) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.diffuseIbl = diffuseIbl;
    shader.fragmentShader = `uniform float diffuseIbl;\n${shader.fragmentShader
      .replace("#include <lights_fragment_maps>", IBL_DIFFUSE_CHUNK)
      .replace("#include <shadowmap_pars_fragment>", SOFT_SHADOWS)}`;
  };
  material.customProgramCacheKey = () => `radio-${material.name}`;
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

  const draw = (hidden: Object3D[]) => {
    ground.visible = false;
    for (const each of hidden) {
      each.visible = false;
    }
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
    ground.visible = true;
    for (const each of hidden) {
      each.visible = true;
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
    throw new Error("The radio's environment could not be decoded.");
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

const smoother = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

const createHaloTexture = () => {
  const { height, width } = HALO_TEXELS;
  const texels = new Uint8Array(width * height * 4);
  for (let row = 0; row < height; row += 1) {
    const v = Math.abs((row + 0.5) / height - 0.5);
    const across = 1 - smoother(v / 0.5);
    for (let column = 0; column < width; column += 1) {
      const u = Math.abs((column + 0.5) / width - 0.5);
      const along = 1 - smoother((u - (0.5 - HALO_END / 2)) / (HALO_END / 2));
      const at = (row * width + column) * 4;
      texels[at] = 255;
      texels[at + 1] = 255;
      texels[at + 2] = 255;
      texels[at + 3] = Math.round(255 * across * along);
    }
  }
  const texture = new DataTexture(
    texels,
    width,
    height,
    RGBAFormat,
    UnsignedByteType
  );
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
};

const disposeTree = (root: Object3D) => {
  const textures = new Set<Texture>();
  for (const mesh of meshesOf(root)) {
    mesh.geometry.dispose();
    const list: Material[] = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const material of list) {
      for (const value of Object.values(material)) {
        if (value && typeof value === "object" && "isTexture" in value) {
          textures.add(value as Texture);
        }
      }
      material.dispose();
    }
  }
  for (const texture of textures) {
    texture.dispose();
  }
};

export const createRadioScene = async (
  canvas: HTMLCanvasElement,
  { onContextLost }: Options
): Promise<RadioScene> => {
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
  let release = () => {};
  const handleLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    release();
    onContextLost();
  };
  canvas.addEventListener("webglcontextlost", handleLost);

  const pmrem = new PMREMGenerator(renderer);
  let model: Object3D | null = null;
  let environment: Texture | null = null;
  let contact: ReturnType<typeof createContactShadow> | null = null;
  let haloTexture: Texture | null = null;
  let halos: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  let keySource: BufferGeometry | null = null;

  const scene = new Scene();
  let released = false;
  release = () => {
    if (released) {
      return;
    }
    released = true;
    canvas.removeEventListener("webglcontextlost", handleLost);
    if (model) {
      disposeTree(model);
    }
    contact?.dispose();
    for (const halo of halos) {
      halo.material.dispose();
    }
    halos[0]?.geometry.dispose();
    keySource?.dispose();
    haloTexture?.dispose();
    environment?.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  try {
    const [gltf, equirect] = await Promise.all([
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(radioModel),
      loadEnvironment(radioEnvironment),
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
    scene.environmentIntensity = STUDIO.environment;
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
      STUDIO.color,
      STUDIO.intensity,
      0,
      STUDIO.angle,
      0.4,
      2
    );
    key.position.copy(KEY_POSITION);
    key.target.position.copy(KEY_TARGET);
    key.castShadow = true;
    key.shadow.mapSize.set(STUDIO.mapSize, STUDIO.mapSize);
    key.shadow.camera.near = STUDIO.near;
    key.shadow.camera.far = STUDIO.far;
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.0004;
    key.shadow.radius = STUDIO.radius;
    scene.add(key, key.target);

    model.updateMatrixWorld(true);
    const root = model;
    const volume = pivotAt(byName(model, "Volume"), VOLUME_KNOB.origin);
    const tuning = pivotAt(byName(model, "Tuning"), TUNING_KNOB.origin);
    const pointer = byName(model, "Pointer");
    const pointerRest = pointer.position.clone();
    const mark = byName(model, "Mark");
    const markRest = mark.position.x;

    const keyNode = byName(model, "Key");
    const [keyMesh] = meshesOf(keyNode);
    const template = keyTemplate(keyMesh);
    keySource = keyMesh.geometry;
    keyNode.removeFromParent();
    let keys: Group[] = [];
    let lines: MeshStandardMaterial[] = [];
    let built = -1;
    let lineMeshes: Mesh[] = [];

    const casters = new Set(["Fittings", "Grille", "Tuning", "Volume"]);
    const receivers = new Set(["Cabinet", "Glass", "Grille"]);
    for (const node of model.children) {
      const name = node.name.replace(/Pivot$/u, "");
      node.traverse((part) => {
        part.castShadow = casters.has(name);
        part.receiveShadow = receivers.has(name);
      });
    }

    const diffuseIbl = { value: DIFFUSE_IBL };
    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    for (const material of materialsOf(model)) {
      patchMaterial(material, diffuseIbl);
      const { map, normalMap } = material as MeshStandardMaterial;
      for (const texture of [map, normalMap]) {
        if (texture) {
          texture.anisotropy = anisotropy;
        }
      }
      if (material.name === "Chrome") {
        (material as MeshStandardMaterial).envMapIntensity = 1;
      }
      if (material.name === "Cloth") {
        (material as MeshStandardMaterial).color.multiplyScalar(CLOTH_SHADE);
      }
    }

    const print = [...materialsOf(model)].find(
      (material) => material.name === "Print"
    ) as MeshStandardMaterial | undefined;
    if (!print) {
      throw new Error('The radio model has no "Print" material.');
    }
    haloTexture = createHaloTexture();
    contact = createContactShadow(renderer, scene);
    const shadow = contact;

    const clearBands = () => {
      for (const pivot of keys) {
        pivot.removeFromParent();
      }
      (keys[0]?.children[0] as Mesh | undefined)?.geometry.dispose();
      for (const mesh of lineMeshes) {
        mesh.removeFromParent();
        mesh.geometry.dispose();
      }
      for (const material of lines) {
        material.dispose();
      }
      for (const halo of halos) {
        halo.removeFromParent();
        halo.material.dispose();
      }
      halos[0]?.geometry.dispose();
    };

    const setBands = (count: number) => {
      if (lost || count === built) {
        return;
      }
      built = count;
      clearBands();
      const pitch = KEY.row / (count + 1);
      const keyGeometry = widenKey(keyMesh, template, pitch - KEY.gap);
      mark.position.x = markRest - KEY.row / 2 + pitch / 2 - KEY_EXPORTED_X;
      keys = Array.from({ length: count + 1 }, (_, index) => {
        const pivot = new Group();
        pivot.name = `Key${index}Pivot`;
        pivot.position.set(
          -KEY.row / 2 + (index + 0.5) * pitch,
          KEY.hinge[1],
          KEY.hinge[2]
        );
        const mesh = new Mesh(keyGeometry, keyMesh.material);
        mesh.castShadow = true;
        pivot.add(mesh);
        root.add(pivot);
        return pivot;
      });

      const tight = lineStep(count) / DIAL.pitch;
      const haloGeometry = new PlaneGeometry(
        2 * DIAL.half + HALO.extra,
        HALO.height * tight
      );
      lines = [];
      lineMeshes = [];
      halos = [];
      for (let band = 0; band < count; band += 1) {
        const { geometry, v } = scaleLine(band, count);
        const lit = print.clone();
        lit.emissive = new Color(LIT.color);
        lit.emissiveIntensity = 0;
        patchMaterial(lit, diffuseIbl);
        const mesh = new Mesh(geometry, lit);
        mesh.name = `Scale${band}`;
        mesh.position.set(DIAL.middle[0], DIAL.middle[1], DIAL.middle[2]);
        root.add(mesh);
        lines.push(lit);
        lineMeshes.push(mesh);

        const halo = new Mesh(
          haloGeometry,
          new MeshBasicMaterial({
            color: new Color(HALO.color).multiplyScalar(HALO.strength),
            depthWrite: false,
            map: haloTexture,
            opacity: 0,
            transparent: true,
          })
        );
        halo.name = "Halo";
        halo.position.set(
          DIAL.middle[0],
          DIAL.middle[1] + v + HALO.rise * tight,
          DIAL.middle[2] - HALO.out
        );
        halo.visible = false;
        halos.push(halo);
        scene.add(halo);
      }
      shadow.draw(halos);
    };

    const render = (pose: Pose) => {
      if (lost) {
        return;
      }
      for (let index = 0; index < keys.length; index += 1) {
        keys[index].quaternion.setFromAxisAngle(
          KEY_AXIS,
          (pose.keys[index] ?? 0) * KEY.touch
        );
      }
      volume.quaternion.setFromAxisAngle(
        VOLUME_AXIS,
        VOLUME_KNOB.min - pose.volume * VOLUME_KNOB.sweep
      );
      tuning.quaternion.setFromAxisAngle(
        TUNING_AXIS,
        -pose.tuning * TUNING_KNOB.turns * 2 * Math.PI
      );
      pointer.position
        .copy(pointerRest)
        .addScaledVector(POINTER_AXIS, pose.tuning * POINTER.travel);
      for (let index = 0; index < lines.length; index += 1) {
        const lamp = pose.lamps[index] ?? 0;
        lines[index].emissiveIntensity = lamp * LIT.strength;
        halos[index].visible = lamp > 0;
        halos[index].material.opacity = lamp * HALO.gain;
      }
      renderer.render(scene, camera);
    };

    return {
      dispose: () => {
        if (!lost) {
          release();
          renderer.forceContextLoss();
        }
      },
      render,
      setBands,
      setSize: (width, height) => {
        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)
        );
        renderer.setSize(width, height, false);
      },
    };
  } catch (error) {
    release();
    throw error;
  }
};
