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

   // ========================== BODY ==========================
   const bodyGeometry = new THREE.BoxGeometry(1, 2, 0.5) // Adjust the size for the body
   const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const body = new THREE.Mesh(bodyGeometry, bodyMaterial)

   // ========================== HEAD ==========================
   const headGeometry = new THREE.SphereGeometry(0.5, 32, 32) // Adjust the size for the head
   const headMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const head = new THREE.Mesh(headGeometry, headMaterial)

   // position head
   head.matrix.makeTranslation(0, 2, 0)

   // update matrix world
   head.updateMatrixWorld(true)

   // ========================== ARMS ==========================
   const armGeometry = new THREE.BoxGeometry(0.2, 1, 0.2) // Smaller rectangle for arms
   const armMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Red color
   const leftArm = new THREE.Mesh(armGeometry, armMaterial)
   const rightArm = new THREE.Mesh(armGeometry, armMaterial)

   // position arms
   leftArm.matrix.makeTranslation(-1, 1.5, 0)
   rightArm.matrix.makeTranslation(1, 1.5, 0)

   // rotate arms
   const rotationMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 2) // 90 degrees in radians
   leftArm.matrix.multiplyMatrices(rotationMatrix, leftArm.matrix)

   // update matrix world
   leftArm.updateMatrixWorld(true)
   rightArm.updateMatrixWorld(true)

   // ========================== LEGS ==========================
   const legGeometry = new THREE.BoxGeometry(0.2, 1, 0.2) // Smaller rectangle for legs
   const legMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }) // Yellow color
   const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
   const rightLeg = new THREE.Mesh(legGeometry, legMaterial)

   // position legs
   leftLeg.matrix.makeTranslation(-0.5, -2, 0)
   rightLeg.matrix.makeTranslation(0.5, -2, 0)

   // update matrix world
   leftLeg.updateMatrixWorld(true)
   rightLeg.updateMatrixWorld(true)

   // ========================== FEET ==========================
   const footGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.5) // Smaller rectangle for feet
   const footMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // Green color
   const leftFoot = new THREE.Mesh(footGeometry, footMaterial)
   const rightFoot = new THREE.Mesh(footGeometry, footMaterial)

   // position feet
   leftFoot.matrix.makeTranslation(-0.5, -3, 0)
   rightFoot.matrix.makeTranslation(0.5, -3, 0)

   // update matrix world
   leftFoot.updateMatrixWorld(true)
   rightFoot.updateMatrixWorld(true)

   // ========================== HIERARCHY ==========================
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
