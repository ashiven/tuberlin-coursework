import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

import * as helper from "./helper"
import ImageWidget from "./imageWidget"

import { combineTextures, createQuad } from "./functions"

import environmentFragmentShader from "./shader/environment.f.glsl?raw"
import environmentVertexShader from "./shader/environment.v.glsl?raw"
import normalMapFragmentShader from "./shader/normal.f.glsl?raw"
import normalMapVertexShader from "./shader/normal.v.glsl?raw"
import sphericalFragmentShader from "./shader/spherical.f.glsl?raw"
import sphericalVertexShader from "./shader/spherical.v.glsl?raw"
import sphericalFixedFragmentShader from "./shader/sphericalfixed.f.glsl?raw"
import sphericalFixedVertexShader from "./shader/sphericalfixed.v.glsl?raw"
import uvAttributeFragmentShader from "./shader/uvattribute.f.glsl?raw"
import uvAttributeVertexShader from "./shader/uvattribute.v.glsl?raw"

var scene: THREE.Scene
var camera: THREE.PerspectiveCamera
var ImgWid: ImageWidget
var texturePath: string = "./src/textures/earth.jpg"
var currentTexture: THREE.Texture
var currentNormals: THREE.Texture
var currentGeometry: THREE.BufferGeometry
var currentMaterial: THREE.RawShaderMaterial
var currentMesh: THREE.Mesh
var backgroundTexture: THREE.Texture | null
var canvasTexture: THREE.CanvasTexture

function updateGeometry(geometry: THREE.BufferGeometry) {
   scene.remove(currentMesh)
   currentGeometry = geometry
   currentMesh = new THREE.Mesh(currentGeometry, currentMaterial)
   scene.add(currentMesh)
}

function updateTexture(textureName: string) {
   texturePath = "./src/textures/" + textureName.toLowerCase() + ".jpg"
   textureName === "Wood"
      ? (texturePath = "./src/textures/wood_ceiling.jpg")
      : null
   textureName === "Environment"
      ? (texturePath = "./src/textures/indoor.jpg")
      : null
   ImgWid.setImage(texturePath)
   currentTexture = new THREE.TextureLoader().load(texturePath)
   currentMaterial.uniforms.textureImg.value = currentTexture
   currentMesh.material = currentMaterial
   if (backgroundTexture) {
      backgroundTexture = currentTexture.clone()
      backgroundTexture.mapping = THREE.EquirectangularReflectionMapping
      backgroundTexture.colorSpace = THREE.SRGBColorSpace
      scene.background = backgroundTexture
   }
}

function updateShader(vertexShader: any, fragmentShader: any) {
   currentMaterial = new THREE.RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
         textureImg: { value: currentMaterial.uniforms.textureImg.value },
         normalMap: { value: currentNormals },
         cameraPosition: { value: camera.position },
      },
   })
   currentMaterial.glslVersion = THREE.GLSL3
   currentMesh.material = currentMaterial
}

function updateBackground(show: boolean) {
   if (show) {
      backgroundTexture = currentTexture.clone()
      backgroundTexture.mapping = THREE.EquirectangularReflectionMapping
      backgroundTexture.colorSpace = THREE.SRGBColorSpace
      scene.background = backgroundTexture
   } else {
      backgroundTexture = null
      scene.background = null
   }
}

function updateNormals(normalName: string) {
   let normalPath: string =
      "./src/textures/" + normalName.toLowerCase() + "_normals.jpg"
   normalName === "Wood"
      ? (normalPath = "./src/textures/wood_ceiling_normals.jpg")
      : null
   currentNormals = new THREE.TextureLoader().load(normalPath)
   currentMaterial.uniforms.normalMap.value = currentNormals
}

function callback(changed: utils.KeyValuePair<helper.Settings>) {
   switch (changed.key) {
      case "geometry":
         switch (changed.value) {
            case "Quad":
               updateGeometry(createQuad())
               break
            case "Box":
               updateGeometry(helper.createBox())
               break
            case "Sphere":
               updateGeometry(helper.createSphere())
               break
            case "Knot":
               updateGeometry(helper.createKnot())
               break
            case "Bunny":
               updateGeometry(helper.createBunny())
               break
            default:
               break
         }
         break
      case "texture":
         updateTexture(changed.value)
         break
      case "shader":
         switch (changed.value) {
            case "UV attribute":
               updateShader(uvAttributeVertexShader, uvAttributeFragmentShader)
               break
            case "Spherical":
               updateShader(sphericalVertexShader, sphericalFragmentShader)
               break
            case "Spherical (fixed)":
               updateShader(
                  sphericalFixedVertexShader,
                  sphericalFixedFragmentShader
               )
               break
            case "Environment Mapping":
               updateShader(environmentVertexShader, environmentFragmentShader)
               break
            case "Normal Map":
               updateShader(normalMapVertexShader, normalMapFragmentShader)
               break
         }
         break
      case "environment":
         updateBackground(changed.value)
         break
      case "normalmap":
         updateNormals(changed.value)
         break
      default:
         break
   }
}

function main() {
   let root = Application("Texturing")
   root.setLayout([["texture", "renderer"]])
   root.setLayoutColumns(["50%", "50%"])
   root.setLayoutRows(["100%"])

   let settings = new helper.Settings()
   settings.pen = () => {
      ImgWid.clearDrawing()
      currentMaterial.uniforms.textureImg.value = currentTexture
   }
   let gui = helper.createGUI(settings)
   settings.addCallback(callback)

   let textureDiv = createWindow("texture")
   root.appendChild(textureDiv)

   ImgWid = new ImageWidget(textureDiv)
   ImgWid.setImage(texturePath)
   ImgWid.enableDrawing()

   ImgWid.DrawingCanvas.addEventListener("updated", () => {
      canvasTexture = new THREE.CanvasTexture(ImgWid.DrawingCanvas)
      let combinedTexture = combineTextures(currentTexture, canvasTexture)
      currentMaterial.uniforms.textureImg.value = combinedTexture
   })

   let rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)

   let renderer = new THREE.WebGLRenderer({
      antialias: true,
   })

   scene = new THREE.Scene()

   currentGeometry = createQuad()
   currentTexture = new THREE.TextureLoader().load(texturePath)
   currentNormals = new THREE.TextureLoader().load(
      "./src/textures/uniform_normals.jpg"
   )
   currentMaterial = new THREE.RawShaderMaterial({
      vertexShader: uvAttributeVertexShader,
      fragmentShader: uvAttributeFragmentShader,
      uniforms: { textureImg: { value: currentTexture } },
   })
   currentMaterial.glslVersion = THREE.GLSL3
   currentMesh = new THREE.Mesh(currentGeometry, currentMaterial)

   scene.add(currentMesh)

   camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)

   let controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   let wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
