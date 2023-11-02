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

   var renderer = new THREE.WebGLRenderer({
      antialias: true,
   })
   THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false
   var scene = new THREE.Scene()
   scene.matrixWorld.copy(scene.matrix)
   helper.setupLight(scene)
   camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)
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
   const armGeometry = new THREE.BoxGeometry(1, 0.2, 0.2) // Smaller rectangle for arms
   const leftArmMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Red color
   const rightArmMaterial = new THREE.MeshBasicMaterial({ color: 0xfff000 }) // Yellow color
   const leftArm = new THREE.Mesh(armGeometry, leftArmMaterial)
   const rightArm = new THREE.Mesh(armGeometry, rightArmMaterial)

   // position arms
   leftArm.matrix.makeTranslation(-1.5, 0.5, 0)
   rightArm.matrix.makeTranslation(1.5, 0.5, 0)

   // rotate arms
   //const rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2) // 90 degrees in radians
   //const rotationMatrix2 = new THREE.Matrix4().makeRotationY(Math.PI / 2) // 90 degrees in radians
   //leftArm.matrix.multiplyMatrices(rotationMatrix, leftArm.matrix)
   //leftArm.matrix.multiplyMatrices(rotationMatrix2, leftArm.matrix)

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

   // ========================== SHOW COORDINATES ==========================
   // x axis is red, y axis is green, z axis is blue
   var axesHelper = new THREE.AxesHelper(5)

   // add an event listener that toggles between showing the axeshelper and not showing it when pressing C
   document.addEventListener("keydown", (event) => {
      if (event.key === "c") {
         if (scene.children.includes(axesHelper)) {
            scene.remove(axesHelper)
         } else {
            scene.add(axesHelper)
         }
      }
   })

   // ========================== NAVIGATING THE OBJECTS ==========================
   let selectedObject: any = body

   // add an event listener that selects the object that is clicked on
   document.addEventListener("keydown", (event) => {
      if (event.key === "s") {
         if (selectedObject && selectedObject.children.length > 0) {
            selectedObject = selectedObject.children[0]
            hightLightObject()
         }
      } else if (event.key === "a") {
         if (selectedObject && selectedObject.parent) {
            const siblings = selectedObject.parent.children
            const index = siblings.indexOf(selectedObject)
            if (index > 0) {
               selectedObject = siblings[index - 1]
            }
            hightLightObject()
         }
      } else if (event.key === "d") {
         if (selectedObject && selectedObject.parent) {
            const siblings = selectedObject.parent.children
            const index = siblings.indexOf(selectedObject)
            if (index < siblings.length - 1) {
               selectedObject = siblings[index + 1]
            }
            hightLightObject()
         }
      } else if (event.key === "w") {
         if (selectedObject && selectedObject.parent) {
            selectedObject = selectedObject.parent
            hightLightObject()
         }
      }
   })

   function hightLightObject() {
      scene.traverse((thing) => {
         if (thing instanceof THREE.Mesh) {
            thing.material.color.set(0x0000ff)
         }
      })
      if (selectedObject instanceof THREE.Mesh) {
         selectedObject.material.color.set(0xff0000)
      }
   }

   // ========================== RENDERER ==========================
   // start the animation loop (async)
   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
