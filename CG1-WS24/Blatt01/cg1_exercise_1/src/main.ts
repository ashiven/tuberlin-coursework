import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import { Application, createWindow, Window } from "./lib/window"

import {
   body,
   head,
   leftArm,
   leftFoot,
   leftLeg,
   resetPositions,
   rightArm,
   rightFoot,
   rightLeg,
} from "./functions"
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

   // ========================== HIERARCHY ==========================
   scene.add(body)
   body.add(head)
   body.add(leftArm)
   body.add(rightArm)
   body.add(leftLeg)
   body.add(rightLeg)
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

   // ========================== NAVIGATING THE OBJECTS ==========================
   let g_selectedObject: any = scene
   let g_axesHelper = new THREE.AxesHelper(5)

   document.addEventListener("keydown", (event) => {
      if (event.key === "s") {
         if (g_selectedObject && g_selectedObject.children.length > 0) {
            let firstChild: any = null
            g_selectedObject.children.forEach((child: any) => {
               if (!firstChild && g_bodyParts.includes(child.name)) {
                  firstChild = child
               }
            })
            g_selectedObject = firstChild
            hightLightObject()
         }
      } else if (event.key === "a") {
         if (g_selectedObject && g_selectedObject.parent) {
            const siblings =
               g_selectedObject.name === "body"
                  ? [g_selectedObject]
                  : g_selectedObject.parent.children
            const index = siblings.indexOf(g_selectedObject)
            if (index > 0) {
               g_selectedObject = siblings[index - 1]
            }
            hightLightObject()
         }
      } else if (event.key === "d") {
         if (g_selectedObject && g_selectedObject.parent) {
            const siblings =
               g_selectedObject.name === "body"
                  ? [g_selectedObject]
                  : g_selectedObject.parent.children
            const index = siblings.indexOf(g_selectedObject)
            if (index < siblings.length - 1) {
               g_selectedObject = siblings[index + 1]
            }
            hightLightObject()
         }
      } else if (event.key === "w") {
         if (g_selectedObject && g_selectedObject.parent) {
            g_selectedObject = g_selectedObject.parent
            hightLightObject()
         }
      }
      // ========================== SHOW COORDINATES ==========================
      // x axis is red, y axis is green, z axis is blue
      else if (event.key === "c") {
         if (g_selectedObject.children.includes(g_axesHelper)) {
            g_selectedObject.remove(g_axesHelper)
         } else {
            g_selectedObject.add(g_axesHelper)
         }
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
            g_selectedObject.updateMatrixWorld(true)
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
            g_selectedObject.updateMatrixWorld(true)
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
            g_selectedObject.updateMatrixWorld(true)
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
            g_selectedObject.updateMatrixWorld(true)
         }
      }
      // ========================== RESET POSITIONS ==========================
      else if (event.key === "r") {
         resetPositions(scene)
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

   // ========================== RENDERER ==========================
   // start the animation loop (async)
   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
