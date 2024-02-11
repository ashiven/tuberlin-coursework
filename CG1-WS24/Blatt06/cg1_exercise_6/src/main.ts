import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import indices from "./data/indices.json"
import weights from "./data/weights.json"

import jump from "./data/jump.json"
import swimming from "./data/swimming.json"
import swing_dance from "./data/swing_dance.json"

import RenderWidget from "./lib/rendererWidget"
import type * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

import * as helper from "./helper"

import { addSkeleton, removeSkeleton } from "./functions"

var settings: helper.Settings = new helper.Settings()
var scene: THREE.Scene
var wid: RenderWidget
var elephant: THREE.Mesh
var showMesh: boolean = settings.mesh
var showSkeleton: boolean = settings.skeleton
var showRestpose: boolean = settings.restpose
var currentAnimation: helper.Animation = jump
var currentFrame: number = 0

/*******************************************************************************
 * Linear Blend Skinning.
 ******************************************************************************/

function initAnimation() {
   //console.log("Intializing animation.")
}

function stepAnimation() {
   if (!showRestpose) {
      const frame = currentAnimation.frames[currentFrame]
      var boneIndex = 0
      scene.traverse((child) => {
         if (
            child instanceof THREE.Mesh &&
            child.geometry instanceof THREE.SphereGeometry
         ) {
            const position = new THREE.Vector3()
            const quaternion = new THREE.Quaternion()
            const scale = new THREE.Vector3()
            const matrixWorld = new THREE.Matrix4().fromArray(frame[boneIndex])
            matrixWorld.decompose(position, quaternion, scale)
            child.position.copy(position)
            child.quaternion.copy(quaternion)
            child.scale.copy(scale)
            boneIndex++
         }
      })
      calculateLBS()
      currentFrame = (currentFrame + 1) % currentAnimation.frames.length
   }
}

function calculateLBS() {
   const vertices = elephant.geometry.getAttribute("position")
   for (let i = 0, l = vertices.count; i < l; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(vertices, i)
      const vertexWeights = weights[i]
      const vertexIndices = indices[i]

      let newVertex = new THREE.Vector3(0, 0, 0)
      for (let j = 0; j < vertexIndices.length; j++) {
         const index = vertexIndices[j]
         const weight = vertexWeights[j]

         const boneMatrixArr = currentAnimation.frames[currentFrame][index]
         const boneMatrix = new THREE.Matrix4().fromArray(boneMatrixArr)
         const restBoneMatrixArr = currentAnimation.restpose[index]
         const restBoneMatrix = new THREE.Matrix4().fromArray(restBoneMatrixArr)
         const restBoneMatrixInv = restBoneMatrix.clone().invert()

         const diff = boneMatrix.clone().multiply(restBoneMatrixInv)
         const result = vertex.clone().applyMatrix4(diff)
         result.multiplyScalar(weight)

         newVertex.add(result)
      }
      vertices.setXYZ(i, newVertex.x, newVertex.y, newVertex.z)
   }
   vertices.needsUpdate = true
}

/*******************************************************************************
 * Pendulum.
 ******************************************************************************/

function initPendulum() {
   //console.log("Intializing pendulum.")
}

function stepPendulum() {
   //console.log("Step pendulum.")
}

function callback(changed: utils.KeyValuePair<helper.Settings>) {
   if (changed.key == "exercise") {
      switch (changed.value) {
         case helper.Exercise.LBS:
            wid.preRenderHook = stepAnimation
            initAnimation()
            break
         case helper.Exercise.pendulum:
            wid.preRenderHook = stepPendulum
            initPendulum()
            break
      }
   }
   switch (changed.key) {
      case "mesh":
         showMesh = changed.value
         showMesh ? scene.add(elephant) : scene.remove(elephant)
         break
      case "skeleton":
         showSkeleton = changed.value
         showSkeleton
            ? addSkeleton(scene, currentAnimation.restpose)
            : removeSkeleton(scene)
         break
      case "restpose":
         showRestpose = changed.value
         if (showRestpose) {
            removeSkeleton(scene)
            addSkeleton(scene, currentAnimation.restpose)
            currentFrame = 0
         }
         break
      case "animation":
         switch (changed.value) {
            case helper.Animations.jump:
               currentAnimation = jump
               break
            case helper.Animations.swimming:
               currentAnimation = swimming
               break
            case helper.Animations.swing_dance:
               currentAnimation = swing_dance
               break
         }
         removeSkeleton(scene)
         showSkeleton ? addSkeleton(scene, currentAnimation.restpose) : null
         break
   }
}

function main() {
   var root = Application("Animation & Simulation")
   root.setLayout([["renderer"]])
   root.setLayoutColumns(["100%"])
   root.setLayoutRows(["100%"])

   helper.createGUI(settings)
   settings.addCallback(callback)

   var rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)

   var renderer = new THREE.WebGLRenderer({ antialias: true })

   scene = new THREE.Scene()
   scene.background = new THREE.Color(0xffffff)

   elephant = helper.getElephant()
   showMesh ? scene.add(elephant) : null

   const a = indices
   const b = weights

   showSkeleton ? addSkeleton(scene, currentAnimation.restpose) : null

   const camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera)

   var controls = new OrbitControls(camera, rendererDiv)
   controls.target.set(0, 50, 0)

   wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   callback({ key: "exercise", value: settings.exercise })
   wid.animate()
}

main()
