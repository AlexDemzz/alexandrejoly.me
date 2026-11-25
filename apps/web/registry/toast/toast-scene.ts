import {
  CanvasTexture,
  Color,
  DataTexture,
  DataUtils,
  EquirectangularReflectionMapping,
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
  TextureLoader,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";
import type {
  Material,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture,
  WebGLProgramParametersWithUniforms,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HorizontalBlurShader } from "three/addons/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/addons/shaders/VerticalBlurShader.js";

import { toastCrumb } from "./toast-crumb";
import { toastEnvironment } from "./toast-environment";
import { FRAME, HEADROOM } from "./toast-frame";
import { toastModel } from "./toast-model";
import type { Pose } from "./toast-rig";

const CAMERA_FOV = 22.6199;
const CAMERA_POSITION = new Vector3(0, 0.41541, 1.045599);
const CAMERA_TARGET = new Vector3(0, 0.145, 0);
const KEY_POSITION = new Vector3(-1.05, 1.15, 1.05);
const KEY_TARGET = new Vector3(0, 0.14, 0);

const LEVER_TRAVEL = 0.103;
const STOP_TRAVEL = 0.0018;
const SLICE_SINK = 0.102;
const HEAT_STRENGTH = 6.5;

const EXPOSURE = 0.595;
const ENVIRONMENT_INTENSITY = 1;
const DIFFUSE_IBL = 0.45;
const KEY_INTENSITY = 19;
const KEY_ANGLE = 0.3;
const MAX_PIXEL_RATIO = 2;
const SHADOW_MAP_SIZE = 2048;

const CRUST_PALE = new Color("#d6aa6e");
const CRUST_GOLDEN = new Color("#b06c34");
const CRUST_DEEP = new Color("#4a2a16");
const CRUST_CHARRED = new Color("#14110f");
const CRUST_CHARRED_ROUGHNESS = 0.95;
const STOP_GLOW = new Color(1, 0.06, 0.03);
const STOP_GLOW_STRENGTH = 0.55;

const CONTACT_WIDTH = 0.5;
const CONTACT_DEPTH = 0.4;
const CONTACT_HEIGHT = 0.035;
const CONTACT_RESOLUTION = 512;
const CONTACT_BLUR = 3.2;
const CONTACT_DARKNESS = 1.6;
const CONTACT_OPACITY = 0.5;

const BRAND_SIZE = 1024;
const BRAND_CENTRE_V = 0.39;
const BRAND_MAX_WIDTH = 0.72;
const BRAND_FONT_SIZE = 0.16;
const BRAND_LINE_HEIGHT = 1.04;
const BRAND_WEIGHT = 900;
const BRAND_EDGE = 0.05;
const BRAND_EDGE_BLUR = 0.02;
const BRAND_FONT = `ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif`;

export interface ToastScene {
  dispose: () => void;
  render: (pose: Pose) => void;
  setMessage: (message: string) => void;
  setSize: (width: number, height: number) => void;
}

interface Options {
  onContextLost: () => void;
}

const byName = (root: Object3D, name: string) => {
  const node = root.getObjectByName(name);
  if (!node) {
    throw new Error(`The toaster model has no "${name}" node.`);
  }
  return node;
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

const brandFont = (size: number) => `${BRAND_WEIGHT} ${size}px ${BRAND_FONT}`;

const widestLine = (context: CanvasRenderingContext2D, lines: string[]) =>
  Math.max(...lines.map((line) => context.measureText(line).width));

const balancedLines = (context: CanvasRenderingContext2D, message: string) => {
  const words = message.split(" ");
  let best = [message];
  let widest = Number.POSITIVE_INFINITY;
  for (let cut = 1; cut < words.length; cut += 1) {
    const lines = [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
    const width = widestLine(context, lines);
    if (width < widest) {
      widest = width;
      best = lines;
    }
  }
  return best;
};

const layoutBrand = (context: CanvasRenderingContext2D, message: string) => {
  const maxWidth = BRAND_MAX_WIDTH * BRAND_SIZE;
  const largest = BRAND_FONT_SIZE * BRAND_SIZE;
  context.font = brandFont(largest);
  const fit = (lines: string[]) =>
    Math.min(largest, (largest * maxWidth) / widestLine(context, lines));
  const single = [message];
  const split = balancedLines(context, message);
  return fit(split) > fit(single)
    ? { fontSize: fit(split), lines: split }
    : { fontSize: fit(single), lines: single };
};

const drawBrand = (canvas: HTMLCanvasElement, message: string) => {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  const size = BRAND_SIZE;
  context.fillStyle = "#000";
  context.fillRect(0, 0, size, size);
  if (!message) {
    return;
  }
  const { fontSize, lines } = layoutBrand(context, message);
  context.font = brandFont(fontSize);
  context.textAlign = "center";
  context.textBaseline = "middle";
  const lineHeight = fontSize * BRAND_LINE_HEIGHT;
  const top = BRAND_CENTRE_V * size - ((lines.length - 1) * lineHeight) / 2;
  context.filter = `blur(${fontSize * BRAND_EDGE_BLUR}px)`;
  context.fillStyle = "#fff";
  context.strokeStyle = "#fff";
  context.lineJoin = "round";
  context.lineWidth = fontSize * BRAND_EDGE;
  for (const [index, line] of lines.entries()) {
    const y = top + index * lineHeight;
    context.strokeText(line, size / 2, y);
    context.fillText(line, size / 2, y);
  }
  context.filter = "none";
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

const patchMaterial = (
  material: Material,
  diffuseIbl: { value: number },
  more?: (shader: WebGLProgramParametersWithUniforms) => void
) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.diffuseIbl = diffuseIbl;
    shader.fragmentShader = `uniform float diffuseIbl;\n${shader.fragmentShader
      .replace("#include <lights_fragment_maps>", IBL_DIFFUSE_CHUNK)
      .replace("#include <shadowmap_pars_fragment>", SOFT_SHADOWS)}`;
    more?.(shader);
  };
  material.customProgramCacheKey = () => `toast-${material.name}`;
};

const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

const crustColour = (target: Color, browning: number) => {
  if (browning < 0.45) {
    return target.lerpColors(CRUST_PALE, CRUST_GOLDEN, browning / 0.45);
  }
  if (browning < 0.75) {
    return target.lerpColors(
      CRUST_GOLDEN,
      CRUST_DEEP,
      smoothstep(0.45, 0.75, browning)
    );
  }
  return target.lerpColors(
    CRUST_DEEP,
    CRUST_CHARRED,
    smoothstep(0.75, 1, browning)
  );
};

const CRUMB_PARS = `
uniform sampler2D goldenMap;
uniform sampler2D brandMap;
uniform float browning;

#define BRAND_SCORCH vec3( 0.17, 0.105, 0.07 )
#define BRAND_FLIP 0.67
#define BRAND_STENCIL_TOAST 0.3
#define BRAND_STENCIL_CHARRED 0.35

float toastHash( vec2 p ) {
  return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 );
}

float toastNoise( vec2 p ) {
  vec2 i = floor( p );
  vec2 f = fract( p );
  vec2 u = f * f * ( 3.0 - 2.0 * f );
  return mix(
    mix( toastHash( i ), toastHash( i + vec2( 1.0, 0.0 ) ), u.x ),
    mix( toastHash( i + vec2( 0.0, 1.0 ) ), toastHash( i + vec2( 1.0, 1.0 ) ), u.x ),
    u.y
  );
}

float toastFbm( vec2 p ) {
  float sum = 0.0;
  float amplitude = 0.5;
  for ( int i = 0; i < 4; i ++ ) {
    sum += amplitude * toastNoise( p );
    p = p * 2.03 + 17.0;
    amplitude *= 0.5;
  }
  return sum;
}
`;

const CRUMB_FRAGMENT = `
float charred = 0.0;
float brandMask = 0.0;
#ifdef USE_MAP
  vec2 uv = vMapUv;
  vec3 paleCrumb = texture2D( map, uv ).rgb;
  vec3 goldenCrumb = texture2D( goldenMap, uv ).rgb;
  const vec3 LUMA = vec3( 0.2126, 0.7152, 0.0722 );
  float relief = dot( paleCrumb, LUMA ) / 0.737;
  float toastedBand = 1.0 - dot( goldenCrumb, LUMA ) / 0.383;

  vec2 fromEdge = min( uv, 1.0 - uv );
  float edge = 1.0 - smoothstep( 0.0, 0.2, min( fromEdge.x, fromEdge.y ) );
  float middle = exp( -pow( ( uv.y - 0.5 ) / 0.2, 2.0 ) );
  float blotches = toastFbm( uv * 4.5 );
  float grain = toastFbm( uv * 26.0 + 5.3 );
  float burnsFirst = 0.5 * blotches + 0.16 * grain + 0.22 * edge + 0.14 * middle
    + 0.22 * toastedBand + 0.6 * ( relief - 1.0 );

  vec3 deepBrown = goldenCrumb * vec3( 0.115, 0.09, 0.12 );
  float ash = toastNoise( uv * 140.0 ) * smoothstep( 0.95, 1.12, relief );
  vec3 charcoal = mix( vec3( 0.011, 0.0102, 0.0095 ), vec3( 0.05, 0.048, 0.045 ), ash )
    * pow( relief, 3.0 );

  float golden = smoothstep( 0.0, 0.45, browning );
  float deep = max(
    clamp( smoothstep( 0.42, 0.8, browning ) + ( burnsFirst - 0.45 ) * smoothstep( 0.45, 0.7, browning ), 0.0, 1.0 ),
    smoothstep( 0.6, 0.82, browning )
  );
  float front = mix( 0.95, 0.2, smoothstep( 0.6, 1.0, browning ) );
  charred = smoothstep( front - 0.06, front + 0.06, burnsFirst ) * smoothstep( 0.6, 0.66, browning );
  vec3 slice = mix( mix( mix( paleCrumb, goldenCrumb, golden ), deepBrown, deep ), charcoal, charred );

  brandMask = texture2D( brandMap, uv ).r;
  vec3 scorched = slice * BRAND_SCORCH;
  vec3 stencilled = mix( paleCrumb, goldenCrumb, BRAND_STENCIL_TOAST ) * mix( 1.0, BRAND_STENCIL_CHARRED, smoothstep( BRAND_FLIP, 1.0, browning ) );
  vec3 mark = mix( scorched, stencilled, step( BRAND_FLIP, browning ) );
  diffuseColor.rgb *= mix( slice, mark, brandMask );
#endif
`;

const CRUMB_ROUGHNESS = `
#include <roughnessmap_fragment>
roughnessFactor = mix( roughnessFactor, 1.0, max( max( charred, smoothstep( 0.6, 0.9, browning ) ), brandMask ) );
`;

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
  ground.position.y = 0.0004;
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
  blurPlane.position.y = CONTACT_HEIGHT / 2;
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
    throw new Error("The toaster's environment could not be decoded.");
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

export const createToastScene = async (
  canvas: HTMLCanvasElement,
  { onContextLost }: Options
): Promise<ToastScene> => {
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
  const brandCanvas = document.createElement("canvas");
  brandCanvas.width = BRAND_SIZE;
  brandCanvas.height = BRAND_SIZE;
  drawBrand(brandCanvas, "");
  const brand = new CanvasTexture(brandCanvas);
  brand.flipY = false;
  brand.anisotropy = renderer.capabilities.getMaxAnisotropy();

  let model: Object3D | null = null;
  let environment: Texture | null = null;
  let golden: Texture | null = null;
  let contact: ReturnType<typeof createContactShadow> | null = null;

  const scene = new Scene();
  const release = () => {
    canvas.removeEventListener("webglcontextlost", handleLost);
    if (model) {
      disposeTree(model);
    }
    contact?.dispose();
    environment?.dispose();
    golden?.dispose();
    brand.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  try {
    const [gltf, equirect, goldenMap] = await Promise.all([
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(toastModel),
      loadEnvironment(toastEnvironment),
      new TextureLoader().loadAsync(toastCrumb),
    ]);
    model = gltf.scene;
    golden = goldenMap;
    environment = pmrem.fromEquirectangular(equirect).texture;
    equirect.dispose();
  } catch (error) {
    release();
    throw error;
  }

  scene.environment = environment;
  scene.environmentIntensity = ENVIRONMENT_INTENSITY;
  scene.add(model);

  const camera = new PerspectiveCamera(
    CAMERA_FOV,
    FRAME.width / FRAME.height,
    0.2,
    4
  );
  camera.position.copy(CAMERA_POSITION);
  camera.lookAt(CAMERA_TARGET);
  camera.setViewOffset(
    FRAME.width,
    FRAME.height,
    0,
    -HEADROOM,
    FRAME.width,
    FRAME.height + HEADROOM
  );

  const key = new SpotLight(0xff_ff_ff, KEY_INTENSITY, 0, KEY_ANGLE, 0.4, 2);
  key.position.copy(KEY_POSITION);
  key.target.position.copy(KEY_TARGET);
  key.castShadow = true;
  key.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
  key.shadow.camera.near = 1.2;
  key.shadow.camera.far = 2.4;
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.0004;
  key.shadow.radius = 14;
  scene.add(key, key.target);

  const lever = byName(model, "Lever");
  const dial = byName(model, "Dial");
  const stopCap = byName(model, "StopCap");
  const slice = byName(model, "Slice");
  const leverRest = lever.position.clone();
  const stopRest = stopCap.position.clone();
  const sliceRest = slice.position.clone();

  const casters = new Set([
    "Dial",
    "DialCollar",
    "Lever",
    "Slice",
    "StopCap",
    "StopCollar",
  ]);
  const receivers = new Set(["Base", "Body", "LeverTrack", "Plate"]);
  for (const node of model.children) {
    node.traverse((part) => {
      part.castShadow = casters.has(node.name);
      part.receiveShadow = receivers.has(node.name);
    });
  }

  const materials = materialsOf(model);
  const heat = materials.get("HeatElement") as MeshStandardMaterial;
  const crust = materials.get("Crust") as MeshStandardMaterial;
  const crumb = materials.get("Crumb") as MeshStandardMaterial;
  const crustRoughness = crust.roughness;
  const redPlastic = materials.get("RedPlastic") as MeshPhysicalMaterial;
  const chrome = materials.get("Chrome") as MeshStandardMaterial;

  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  golden.colorSpace = SRGBColorSpace;
  golden.flipY = false;
  golden.anisotropy = anisotropy;
  if (crumb.map) {
    crumb.map.anisotropy = anisotropy;
  }
  const browning = { value: 0 };
  const diffuseIbl = { value: DIFFUSE_IBL };
  for (const material of materials.values()) {
    patchMaterial(material, diffuseIbl);
  }
  patchMaterial(crumb, diffuseIbl, (shader) => {
    shader.uniforms.goldenMap = { value: golden };
    shader.uniforms.brandMap = { value: brand };
    shader.uniforms.browning = browning;
    shader.fragmentShader = `${CRUMB_PARS}${shader.fragmentShader
      .replace("#include <map_fragment>", CRUMB_FRAGMENT)
      .replace("#include <roughnessmap_fragment>", CRUMB_ROUGHNESS)}`;
  });
  redPlastic.emissive.copy(STOP_GLOW);
  redPlastic.emissiveIntensity = 0;
  chrome.envMapIntensity = 1;

  contact = createContactShadow(renderer, scene);
  contact.draw();

  const sliceMaterials = [crumb, crust];

  const render = (pose: Pose) => {
    if (lost) {
      return;
    }
    lever.position.set(
      leverRest.x,
      leverRest.y - pose.lever * LEVER_TRAVEL,
      leverRest.z
    );
    dial.rotation.z = pose.dial;
    stopCap.position.set(
      stopRest.x,
      stopRest.y,
      stopRest.z - pose.stop * STOP_TRAVEL
    );
    heat.emissiveIntensity = pose.heat * HEAT_STRENGTH;
    redPlastic.emissiveIntensity = pose.heat * STOP_GLOW_STRENGTH;

    const { slice: bread } = pose;
    slice.visible = bread.present && bread.opacity > 0;
    slice.position.set(
      sliceRest.x,
      sliceRest.y - bread.drop * SLICE_SINK + bread.lift,
      sliceRest.z
    );
    browning.value = bread.browning;
    crustColour(crust.color, bread.browning);
    crust.roughness =
      crustRoughness +
      (CRUST_CHARRED_ROUGHNESS - crustRoughness) *
        smoothstep(0.6, 1, bread.browning);
    for (const material of sliceMaterials) {
      material.opacity = bread.opacity;
      material.transparent = bread.opacity < 1;
    }
    renderer.render(scene, camera);
  };

  const setMessage = (message: string) => {
    drawBrand(brandCanvas, message);
    brand.needsUpdate = true;
  };

  return {
    dispose: () => {
      release();
      renderer.forceContextLoss();
    },
    render,
    setMessage,
    setSize: (width, height) => {
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)
      );
      renderer.setSize(width, height, false);
    },
  };
};
