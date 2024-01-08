import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

import * as helper from "./helper"
import ImageWidget from "./imageWidget"

import { createQuad } from "./functions"

var scene: THREE.Scene
var ImgWid: ImageWidget
var texturePath: string = "./src/textures/earth.jpg"
var currentGeometry: THREE.BufferGeometry
var currentMaterial: THREE.Material
var currentMesh: THREE.Mesh

function callback(changed: utils.KeyValuePair<helper.Settings>) {
   switch (changed.key) {
      case "geometry":
         switch (changed.value) {
            case "Quad":
               scene.remove(currentMesh)
               currentGeometry = createQuad()
               currentMesh = new THREE.Mesh(currentGeometry, currentMaterial)
               scene.add(currentMesh)
               break
            case "Box":
               scene.remove(currentMesh)
               currentGeometry = helper.createBox()
               currentMesh = new THREE.Mesh(currentGeometry, currentMaterial)
               scene.add(currentMesh)
               break
            case "Sphere":
               scene.remove(currentMesh)
               currentGeometry = helper.createSphere()
               currentMesh = new THREE.Mesh(currentGeometry, currentMaterial)
               scene.add(currentMesh)
               break
            case "Knot":
               scene.remove(currentMesh)
               currentGeometry = helper.createKnot()
               currentMesh = new THREE.Mesh(currentGeometry, currentMaterial)
               scene.add(currentMesh)
               break
            case "Bunny":
               scene.remove(currentMesh)
               currentGeometry = helper.createBunny()
               currentMesh = new THREE.Mesh(currentGeometry, currentMaterial)
               scene.add(currentMesh)
               break
            default:
               break
         }
         break
      case "texture":
         texturePath = "./src/textures/" + changed.value.toLowerCase() + ".jpg"
         ImgWid.setImage(texturePath)
         currentMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(texturePath),
         })
         currentMesh.material = currentMaterial
         break
      case "shader":
         break
      case "environment":
         break
      case "normalmap":
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
   let gui = helper.createGUI(settings)
   settings.addCallback(callback)

   let textureDiv = createWindow("texture")
   root.appendChild(textureDiv)

   ImgWid = new ImageWidget(textureDiv)
   ImgWid.setImage(texturePath)

   let rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)

   let renderer = new THREE.WebGLRenderer({
      antialias: true,
   })

   scene = new THREE.Scene()

   currentGeometry = createQuad()
   currentMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(texturePath),
   })
   currentMesh = new THREE.Mesh(currentGeometry, currentMaterial)
   scene.add(currentMesh)

   let camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)

   let controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   let wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
