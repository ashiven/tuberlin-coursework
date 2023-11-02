import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import { Application, createWindow, Window } from "./lib/window"

import * as helper from "./helper"

var camera: THREE.PerspectiveCamera
var controls: OrbitControls
var rendererDiv: Window

function main() {
   // ========================== HTML ==========================
   var root = Application("Robot")
   root.setLayout([["renderer"]])
   root.setLayoutColumns(["100%"])
   root.setLayoutRows(["100%"])
   rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)

   // ========================== RENDERER ==========================
   var renderer = new THREE.WebGLRenderer({
      antialias: true,
   })
   THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false

   // ========================== SCENE ==========================
   var scene = new THREE.Scene()
   scene.matrixWorld.copy(scene.matrix)
   helper.setupLight(scene)
   camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)
   controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   // ========================== BODY ==========================
   const bodyGeometry = new THREE.BoxGeometry(1, 2, 0.5)
   const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
   body.name = "body"

   // ========================== HEAD ==========================
   const headGeometry = new THREE.SphereGeometry(0.5, 32, 32)
   const headMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const head = new THREE.Mesh(headGeometry, headMaterial)
   head.name = "head"

   // position head
   head.matrix.makeTranslation(0, 2, 0)

   // update matrix world
   head.updateMatrixWorld(true)

   // ========================== ARMS ==========================
   const armGeometry = new THREE.BoxGeometry(1, 0.2, 0.2) // Smaller rectangle for arms
   const leftArmMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const rightArmMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const leftArm = new THREE.Mesh(armGeometry, leftArmMaterial)
   const rightArm = new THREE.Mesh(armGeometry, rightArmMaterial)
   leftArm.name = "leftArm"
   rightArm.name = "rightArm"

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
   const leftLegMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const rightLegMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const leftLeg = new THREE.Mesh(legGeometry, leftLegMaterial)
   const rightLeg = new THREE.Mesh(legGeometry, rightLegMaterial)
   leftLeg.name = "leftLeg"
   rightLeg.name = "rightLeg"

   // position legs
   leftLeg.matrix.makeTranslation(-0.5, -2, 0)
   rightLeg.matrix.makeTranslation(0.5, -2, 0)

   // update matrix world
   leftLeg.updateMatrixWorld(true)
   rightLeg.updateMatrixWorld(true)

   // ========================== FEET ==========================
   const footGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.5) // Smaller rectangle for feet
   const leftFootMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const rightFootMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const leftFoot = new THREE.Mesh(footGeometry, leftFootMaterial)
   const rightFoot = new THREE.Mesh(footGeometry, rightFootMaterial)
   leftFoot.name = "leftFoot"
   rightFoot.name = "rightFoot"

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

   // log the names of the child nodes of the body
   //body.children.forEach((child) => {
   //   console.log(child.name)
   //})

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
   let g_selectedObject: any = scene

   document.addEventListener("keydown", (event) => {
      if (event.key === "s") {
         if (g_selectedObject && g_selectedObject.children.length > 0) {
            let firstChild: any = null
            g_selectedObject.children.forEach((child: any) => {
               if (
                  !firstChild &&
                  [
                     "body",
                     "head",
                     "leftArm",
                     "rightArm",
                     "leftLeg",
                     "rightLeg",
                     "leftFoot",
                     "rightFoot",
                  ].includes(child.name)
               ) {
                  firstChild = child
               }
            })
            g_selectedObject = firstChild
            hightLightObject()
         }
      } else if (event.key === "a") {
         if (g_selectedObject && g_selectedObject.parent !== scene) {
            const siblings = g_selectedObject.parent.children
            printNames(siblings)
            const index = siblings.indexOf(g_selectedObject)
            if (index > 0) {
               g_selectedObject = siblings[index - 1]
            }
            hightLightObject()
         }
      } else if (event.key === "d") {
         if (g_selectedObject && g_selectedObject.parent !== scene) {
            const siblings = g_selectedObject.parent.children
            printNames(siblings)
            const index = siblings.indexOf(g_selectedObject)
            if (index < siblings.length - 1) {
               g_selectedObject = siblings[index + 1]
            }
            hightLightObject()
         }
      } else if (event.key === "w") {
         if (g_selectedObject && g_selectedObject.parent !== scene) {
            g_selectedObject = g_selectedObject.parent
            hightLightObject()
         }
      }
   })

   function hightLightObject() {
      console.log("Selected object: ", g_selectedObject.name)
      scene.traverse((object) => {
         if (object instanceof THREE.Mesh) {
            object.material.color.set(0x0000ff)
         }
      })
      if (g_selectedObject instanceof THREE.Mesh) {
         g_selectedObject.material.color.set(0xff0000)
      }
   }

   function printNames(list: any) {
      list.forEach((element: any) => {
         console.log(element.name)
      })
   }

   // ========================== RENDERER ==========================
   // start the animation loop (async)
   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
