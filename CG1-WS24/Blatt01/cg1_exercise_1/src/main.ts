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
   scene.name = "scene"
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

   // initial transform
   const bodyInit = body.matrix.clone()

   // ========================== HEAD ==========================
   const headGeometry = new THREE.SphereGeometry(0.5, 32, 32)
   const headMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const head = new THREE.Mesh(headGeometry, headMaterial)
   head.name = "head"

   // ========================== ARMS ==========================
   const armGeometry = new THREE.BoxGeometry(1, 0.2, 0.2) // Smaller rectangle for arms
   const leftArmMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const rightArmMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const leftArm = new THREE.Mesh(armGeometry, leftArmMaterial)
   const rightArm = new THREE.Mesh(armGeometry, rightArmMaterial)
   leftArm.name = "leftArm"
   rightArm.name = "rightArm"

   // ========================== LEGS ==========================
   const legGeometry = new THREE.BoxGeometry(0.2, 1, 0.2) // Smaller rectangle for legs
   const leftLegMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const rightLegMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const leftLeg = new THREE.Mesh(legGeometry, leftLegMaterial)
   const rightLeg = new THREE.Mesh(legGeometry, rightLegMaterial)
   leftLeg.name = "leftLeg"
   rightLeg.name = "rightLeg"

   // ========================== FEET ==========================
   const footGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.5) // Smaller rectangle for feet
   const leftFootMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const rightFootMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const leftFoot = new THREE.Mesh(footGeometry, leftFootMaterial)
   const rightFoot = new THREE.Mesh(footGeometry, rightFootMaterial)
   leftFoot.name = "leftFoot"
   rightFoot.name = "rightFoot"

   // ========================== HIERARCHY ==========================

   scene.add(body)
   body.add(leftLeg)
   body.add(rightLeg)
   body.add(leftArm)
   body.add(rightArm)
   body.add(head)
   leftLeg.add(leftFoot)
   rightLeg.add(rightFoot)

   const g_bodyParts = [
      "body",
      "head",
      "leftArm",
      "rightArm",
      "leftLeg",
      "rightLeg",
      "leftFoot",
      "rightFoot",
   ]

   // ========================== POSITIONING THE OBJECTS ==========================
   // position head
   head.matrix.makeTranslation(0, 1.7, 0)

   //initial transform
   const headInit = head.matrix.clone()

   // position arms
   leftArm.matrix.makeTranslation(-1.2, 0.5, 0)
   rightArm.matrix.makeTranslation(1.2, 0.5, 0)

   //initial transform
   const leftArmInit = leftArm.matrix.clone()
   const rightArmInit = rightArm.matrix.clone()

   // position legs
   leftLeg.matrix.makeTranslation(-0.5, -1.7, 0)
   rightLeg.matrix.makeTranslation(0.5, -1.7, 0)

   //initial transform
   const leftLegInit = leftLeg.matrix.clone()
   const rightLegInit = rightLeg.matrix.clone()

   // position feet
   leftFoot.matrix.makeTranslation(0, -0.7, 0.2)
   rightFoot.matrix.makeTranslation(0, -0.7, 0.2)

   //initial transform
   const leftFootInit = leftFoot.matrix.clone()
   const rightFootInit = rightFoot.matrix.clone()

   customUpdateMatrixWorld(scene, null)

   // ========================== NAVIGATING THE OBJECTS ==========================
   let g_selectedObject: any = scene
   let g_axesHelper = new THREE.AxesHelper(1)
   let g_displayAxes = false

   document.addEventListener("keydown", (event) => {
      if (event.key === "s") {
         if (g_selectedObject && g_selectedObject.children.length > 0) {
            const firstChild = getFirstChild()
            g_selectedObject = firstChild
            hightLightObject()
            if (g_displayAxes) {
               displayAxes()
            }
         }
      } else if (event.key === "a") {
         if (g_selectedObject && g_selectedObject.parent) {
            const [siblings, index] = getSiblingsIndex()
            if (index > 0) {
               g_selectedObject = siblings[index - 1]
            }
            hightLightObject()
            if (g_displayAxes) {
               displayAxes()
            }
         }
      } else if (event.key === "d") {
         if (g_selectedObject && g_selectedObject.parent) {
            const [siblings, index] = getSiblingsIndex()
            if (index < siblings.length - 1) {
               g_selectedObject = siblings[index + 1]
            }
            hightLightObject()
            if (g_displayAxes) {
               displayAxes()
            }
         }
      } else if (event.key === "w") {
         if (g_selectedObject && g_selectedObject.parent) {
            g_selectedObject = g_selectedObject.parent
            hightLightObject()
            if (g_displayAxes) {
               displayAxes()
            }
         }
      }
      // ========================== SHOW COORDINATES ==========================
      // x axis is red, y axis is green, z axis is blue
      else if (event.key === "c") {
         g_displayAxes = !g_displayAxes
         displayAxes()
      }
      // ========================== ROTATING THE OBJECTS ==========================
      else if (event.key === "ArrowDown") {
         if (g_selectedObject) {
            const rotationMatrix = new THREE.Matrix4().makeRotationX(
               -Math.PI / 16
            )
            g_selectedObject.matrix.multiplyMatrices(
               rotationMatrix,
               g_selectedObject.matrix
            )
            customUpdateMatrixWorld(scene, null)
         }
      } else if (event.key === "ArrowLeft") {
         if (g_selectedObject) {
            const rotationMatrix = new THREE.Matrix4().makeRotationY(
               -Math.PI / 16
            )
            g_selectedObject.matrix.multiplyMatrices(
               rotationMatrix,
               g_selectedObject.matrix
            )
            customUpdateMatrixWorld(scene, null)
         }
      } else if (event.key === "ArrowRight") {
         if (g_selectedObject) {
            const rotationMatrix = new THREE.Matrix4().makeRotationY(
               Math.PI / 16
            )
            g_selectedObject.matrix.multiplyMatrices(
               rotationMatrix,
               g_selectedObject.matrix
            )
            customUpdateMatrixWorld(scene, null)
         }
      } else if (event.key === "ArrowUp") {
         if (g_selectedObject) {
            const rotationMatrix = new THREE.Matrix4().makeRotationX(
               Math.PI / 16
            )
            g_selectedObject.matrix.multiplyMatrices(
               rotationMatrix,
               g_selectedObject.matrix
            )
            customUpdateMatrixWorld(scene, null)
         }
      }
      // ========================== RESET POSITIONS ==========================
      else if (event.key === "r") {
         resetPositions(scene)
      }
   })

   function getFirstChild() {
      let firstChild: any = null
      g_selectedObject.children.forEach((child: any) => {
         if (!firstChild && g_bodyParts.includes(child.name)) {
            firstChild = child
         }
      })
      return firstChild
   }

   function getSiblingsIndex() {
      const siblings =
         g_selectedObject.name === "body"
            ? [g_selectedObject]
            : g_selectedObject.parent.children
      const index = siblings.indexOf(g_selectedObject)

      return [siblings, index]
   }

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

   function displayAxes() {
      g_axesHelper.matrix.copy(g_selectedObject.parent.matrix)
      g_selectedObject.add(g_axesHelper)

      customUpdateMatrixWorld(scene, null)
   }

   function resetPositions(scene: any) {
      scene.traverse((object: any) => {
         if (object instanceof THREE.Mesh) {
            switch (object.name) {
               case "scene":
                  object.matrix.copy(bodyInit)
                  customUpdateMatrixWorld(scene, null)
                  break
               case "body":
                  object.matrix.copy(bodyInit)
                  customUpdateMatrixWorld(scene, null)
                  break
               case "head":
                  object.matrix.copy(headInit)
                  customUpdateMatrixWorld(scene, null)
                  break
               case "leftArm":
                  object.matrix.copy(leftArmInit)
                  customUpdateMatrixWorld(scene, null)
                  break
               case "rightArm":
                  object.matrix.copy(rightArmInit)
                  customUpdateMatrixWorld(scene, null)
                  break
               case "leftLeg":
                  object.matrix.copy(leftLegInit)
                  customUpdateMatrixWorld(scene, null)
                  break
               case "rightLeg":
                  object.matrix.copy(rightLegInit)
                  customUpdateMatrixWorld(scene, null)
                  break
               case "leftFoot":
                  object.matrix.copy(leftFootInit)
                  customUpdateMatrixWorld(scene, null)
                  break
               case "rightFoot":
                  object.matrix.copy(rightFootInit)
                  customUpdateMatrixWorld(scene, null)
                  break
               default:
                  break
            }
         }
      })
   }

   function customUpdateMatrixWorld(object: any, parentMatrix: any) {
      if (parentMatrix) {
         object.matrixWorld.multiplyMatrices(parentMatrix, object.matrix)
      } else {
         object.matrixWorld.copy(object.matrix)
      }

      for (const child of object.children) {
         customUpdateMatrixWorld(child, object.matrixWorld)
      }
   }

   // ========================== RENDERER ==========================
   // start the animation loop (async)
   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
