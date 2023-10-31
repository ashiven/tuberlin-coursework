import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import { Application, createWindow, Window } from "./lib/window"

import * as helper from "./helper"

var camera: THREE.PerspectiveCamera
var controls: OrbitControls
var rendererDiv: Window

function main() {
   var root = Application("Robot")
   root.setLayout([["renderer"]])
   root.setLayoutColumns(["100%"])
   root.setLayoutRows(["100%"])

   rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)

   // create renderer
   var renderer = new THREE.WebGLRenderer({
      antialias: true, // to enable anti-alias and get smoother output
   })

   // important exercise specific limitation, do not remove this line
   THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false

   // create scene
   var scene = new THREE.Scene()
   // manually set matrixWorld
   scene.matrixWorld.copy(scene.matrix)

   helper.setupLight(scene)

   // create camera
   camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)

   // create controls
   controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   // Create the body (corpus)
   const bodyGeometry = new THREE.BoxGeometry(1, 2, 0.5) // Adjust the size for the body
   const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const body = new THREE.Mesh(bodyGeometry, bodyMaterial)

   // Create the head
   const headGeometry = new THREE.BoxGeometry(1, 1, 1)
   const headMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const head = new THREE.Mesh(headGeometry, headMaterial)
   head.position.set(0, 2, 0) // Position the head above the corpus

   // Create the arms
   const armGeometry = new THREE.BoxGeometry(0.2, 1, 0.2) // Smaller rectangle for arms
   const armMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Red color
   const leftArm = new THREE.Mesh(armGeometry, armMaterial)
   const rightArm = new THREE.Mesh(armGeometry, armMaterial)
   leftArm.position.set(-1, 1.5, 0)
   rightArm.position.set(1, 1.5, 0)

   // Create the legs
   const legGeometry = new THREE.BoxGeometry(0.2, 1, 0.2) // Smaller rectangle for legs
   const legMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }) // Yellow color
   const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
   const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
   leftLeg.position.set(-0.5, -0.5, 0)
   rightLeg.position.set(0.5, -0.5, 0)

   // Create the feet
   const footGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.5) // Smaller rectangle for feet
   const footMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // Green color
   const leftFoot = new THREE.Mesh(footGeometry, footMaterial)
   const rightFoot = new THREE.Mesh(footGeometry, footMaterial)
   leftFoot.position.set(-0.5, -1.2, 0.2)
   rightFoot.position.set(0.5, -1.2, 0.2)

   // Add all objects to the scene
   scene.add(body)
   body.add(head)
   body.add(leftArm)
   body.add(rightArm)
   body.add(leftLeg)
   body.add(rightLeg)
   leftLeg.add(leftFoot)
   rightLeg.add(rightFoot)

   // start the animation loop (async)
   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
