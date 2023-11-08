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
   const bodyGeometry = new THREE.BoxGeometry(1, 1.75, 0.5)
   const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
   body.name = "body"

   // ========================== HEAD ==========================
   const headGeometry = new THREE.SphereGeometry(0.4, 25, 32)
   customTranslateGeometry(headGeometry, 0, 0.4, 0)
   const headMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const head = new THREE.Mesh(headGeometry, headMaterial)
   head.name = "head"

   // ========================== ARMS ==========================
   const leftArmGeometry = new THREE.BoxGeometry(1, 0.2, 0.2)
   const rightArmGeometry = new THREE.BoxGeometry(1, 0.2, 0.2)
   customTranslateGeometry(leftArmGeometry, -0.5, 0, 0)
   customTranslateGeometry(rightArmGeometry, 0.5, 0, 0)
   const leftArmMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const rightArmMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial)
   const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial)
   leftArm.name = "leftArm"
   rightArm.name = "rightArm"

   // ========================== LEGS ==========================
   const leftLegGeometry = new THREE.BoxGeometry(0.2, 1, 0.2)
   const rightLegGeometry = new THREE.BoxGeometry(0.2, 1, 0.2)
   customTranslateGeometry(leftLegGeometry, 0, -0.5, 0)
   customTranslateGeometry(rightLegGeometry, 0, -0.5, 0)
   const leftLegMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const rightLegMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const leftLeg = new THREE.Mesh(leftLegGeometry, leftLegMaterial)
   const rightLeg = new THREE.Mesh(rightLegGeometry, rightLegMaterial)
   leftLeg.name = "leftLeg"
   rightLeg.name = "rightLeg"

   // ========================== FEET ==========================
   const leftFootGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.5)
   const rightFootGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.5)
   customTranslateGeometry(leftFootGeometry, 0, -0.1, 0.25)
   customTranslateGeometry(rightFootGeometry, 0, -0.1, 0.25)

   const leftFootMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const rightFootMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
   const leftFoot = new THREE.Mesh(leftFootGeometry, leftFootMaterial)
   const rightFoot = new THREE.Mesh(rightFootGeometry, rightFootMaterial)
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
   customTranslateMatrix(head, 0, 1, 0)

   //initial transform
   const headInit = head.matrix.clone()

   // initial transform
   const bodyInit = body.matrix.clone()

   // position arms
   customTranslateMatrix(leftArm, -0.6, 0.7, 0)
   customTranslateMatrix(rightArm, 0.6, 0.7, 0)

   //initial transform
   const leftArmInit = leftArm.matrix.clone()
   const rightArmInit = rightArm.matrix.clone()

   // position legs
   customTranslateMatrix(leftLeg, -0.4, -1.1, 0)
   customTranslateMatrix(rightLeg, 0.4, -1.1, 0)

   //initial transform
   const leftLegInit = leftLeg.matrix.clone()
   const rightLegInit = rightLeg.matrix.clone()

   // position feet
   customTranslateMatrix(leftFoot, 0, -1.1, -0.1)
   customTranslateMatrix(rightFoot, 0, -1.1, -0.1)

   //initial transform
   const leftFootInit = leftFoot.matrix.clone()
   const rightFootInit = rightFoot.matrix.clone()

   customUpdateMatrixWorld(scene, null)

   // ========================== NAVIGATING THE OBJECTS ==========================
   let g_selectedObject: any = scene
   let g_axesHelper = new THREE.AxesHelper(1)
   g_axesHelper.name = "axesHelper"
   let g_displayAxes = false

   document.addEventListener("keydown", (event) => {
      if (event.key === "s") {
         if (
            g_selectedObject &&
            g_selectedObject.children.length >
               g_selectedObject.children.includes(g_axesHelper)
               ? 1
               : 0
         ) {
            g_selectedObject = getFirstChild()
            hightLightObject()
            if (g_displayAxes) {
               displayAxes()
            }
            objectInfo()
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
            objectInfo()
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
            objectInfo()
         }
      } else if (event.key === "w") {
         if (g_selectedObject && g_selectedObject.parent) {
            g_selectedObject = g_selectedObject.parent
            hightLightObject()
            if (g_displayAxes) {
               displayAxes()
            }
            if (
               g_selectedObject.name === "scene" &&
               body.children.includes(g_axesHelper)
            ) {
               body.remove(g_axesHelper)
            }
            objectInfo()
         }
      }
      // ========================== SHOW COORDINATES ==========================
      // x axis is red, y axis is green, z axis is blue
      else if (event.key === "c") {
         g_displayAxes = !g_displayAxes
         if (!g_displayAxes) {
            scene.traverse((object) => {
               if (object.children.includes(g_axesHelper)) {
                  object.remove(g_axesHelper)
               }
            })
         } else {
            displayAxes()
         }
      }
      // ========================== ROTATING THE OBJECTS ==========================
      else if (event.key === "ArrowDown") {
         if (g_selectedObject) {
            // TODO: - convenience method ?
            const rotationMatrix = ["leftArm", "rightArm"].includes(
               g_selectedObject.name
            )
               ? customMakeRotation(new THREE.Matrix4(), -Math.PI / 16, "z")
               : customMakeRotation(new THREE.Matrix4(), -Math.PI / 16, "x")
            g_selectedObject.matrix.multiplyMatrices(
               rotationMatrix,
               g_selectedObject.matrix
            )
            customUpdateMatrixWorld(scene, null)
         }
      } else if (event.key === "ArrowLeft") {
         if (g_selectedObject) {
            const rotationMatrix = customMakeRotation(
               new THREE.Matrix4(),
               -Math.PI / 16,
               "y"
            )
            g_selectedObject.matrix.multiplyMatrices(
               rotationMatrix,
               g_selectedObject.matrix
            )
            customUpdateMatrixWorld(scene, null)
         }
      } else if (event.key === "ArrowRight") {
         if (g_selectedObject) {
            const rotationMatrix = customMakeRotation(
               new THREE.Matrix4(),
               Math.PI / 16,
               "y"
            )
            g_selectedObject.matrix.multiplyMatrices(
               rotationMatrix,
               g_selectedObject.matrix
            )
            customUpdateMatrixWorld(scene, null)
         }
      } else if (event.key === "ArrowUp") {
         if (g_selectedObject) {
            const rotationMatrix = ["leftArm", "rightArm"].includes(
               g_selectedObject.name
            )
               ? customMakeRotation(new THREE.Matrix4(), Math.PI / 16, "z")
               : customMakeRotation(new THREE.Matrix4(), Math.PI / 16, "x")
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
      scene.traverse((object) => {
         if (object instanceof THREE.Mesh) {
            object.material.color.set(0x0000ff)
         }
      })
      if (g_selectedObject instanceof THREE.Mesh) {
         g_selectedObject.material.color.set(0xff0000)
      }
   }

   function objectInfo() {
      console.log("Selected object: ", g_selectedObject.name)
      let childrenNames: any = []
      g_selectedObject.children.forEach((child: any) => {
         childrenNames.push(child.name)
      })
      console.log("Parent: ", g_selectedObject.parent.name)
      console.log("Children: ", childrenNames)
   }

   function displayAxes() {
      if (g_bodyParts.includes(g_selectedObject.name)) {
         // we get the selected object's world matrix and copy the position entries to the axes helper world matrix
         const selectedObjectMatrix = g_selectedObject.matrixWorld
         const axesHelperMatrix = new THREE.Matrix4()
         axesHelperMatrix.identity()

         axesHelperMatrix.elements[12] = selectedObjectMatrix.elements[12]
         axesHelperMatrix.elements[13] = selectedObjectMatrix.elements[13]
         axesHelperMatrix.elements[14] = selectedObjectMatrix.elements[14]

         g_axesHelper.matrixWorld.copy(axesHelperMatrix)

         // this is basically what the above code does:
         // g_axesHelper.position.copy(g_selectedObject.position)
         g_selectedObject.add(g_axesHelper)
      }
      customUpdateMatrixWorld(scene, null)
   }

   function resetPositions(scene: any) {
      scene.traverse((object: any) => {
         if (object instanceof THREE.Mesh) {
            switch (object.name) {
               case "scene":
                  object.matrix.copy(bodyInit)
                  break
               case "body":
                  object.matrix.copy(bodyInit)
                  break
               case "head":
                  object.matrix.copy(headInit)
                  break
               case "leftArm":
                  object.matrix.copy(leftArmInit)
                  break
               case "rightArm":
                  object.matrix.copy(rightArmInit)
                  break
               case "leftLeg":
                  object.matrix.copy(leftLegInit)
                  break
               case "rightLeg":
                  object.matrix.copy(rightLegInit)
                  break
               case "leftFoot":
                  object.matrix.copy(leftFootInit)
                  break
               case "rightFoot":
                  object.matrix.copy(rightFootInit)
                  break
               default:
                  break
            }
         }
      })
      customUpdateMatrixWorld(scene, null)
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

   function customTranslateMatrix(
      object: any,
      x: number,
      y: number,
      z: number
   ) {
      object.matrix.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1)
   }

   function customTranslateGeometry(
      geometry: any,
      x: number,
      y: number,
      z: number
   ) {
      let matrix = new THREE.Matrix4()

      matrix.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1)

      geometry.applyMatrix4(matrix)
      // This calls geometry.attributes.position.applyMatrix4(matrix)
      // geometry.attributes.position is an instance of THREE.BufferAttribute extended as Float32BufferAttribute
      //
      // 	applyMatrix4( m ) {
      //		   for ( let i = 0, l = this.count; i < l; i ++ ) {
      //          _vector.fromBufferAttribute( this, i );
      //          _vector.applyMatrix4( m );
      //          this.setXYZ( i, _vector.x, _vector.y, _vector.z );
      //       }
      //       return this;
      //    }

      // After this, it sets:
      // position.needsUpdate = true;
      // which causes position.version to be incremented by 1
      // this means that the position buffer has changed and needs to be updated
   }

   function customMakeRotation(matrix: any, angle: number, axis: any) {
      const c = Math.cos(angle)
      const s = Math.sin(angle)

      if (axis === "x") {
         matrix.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1)
      } else if (axis === "y") {
         matrix.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1)
      } else if (axis === "z") {
         matrix.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      return matrix
   }

   // ========================== RENDERER ==========================
   // start the animation loop (async)
   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
