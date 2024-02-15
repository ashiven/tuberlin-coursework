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

import {
   addMatrices,
   addSkeleton,
   boneMatrixInvs,
   removeSkeleton,
} from "./functions"

var settings: helper.Settings = new helper.Settings()
var scene: THREE.Scene
var wid: RenderWidget

/*******************************************************************************
 * Linear Blend Skinning.
 ******************************************************************************/

var elephant: THREE.Mesh
var showMesh: boolean = settings.mesh
var showSkeleton: boolean = settings.skeleton
var showRestpose: boolean = settings.restpose
var currentAnimation: helper.Animation = jump
var currentFrame: number = 0
var restBoneMatrixInversions: Array<THREE.Matrix4> =
   boneMatrixInvs(currentAnimation)
var restingElephant: THREE.Mesh = helper.getElephant()

function initAnimation() {
   scene.remove(box)
   scene.remove(sphere)
   scene.remove(line)
   currentFrame = 0
   elephant = helper.getElephant()
   showMesh ? scene.add(elephant) : null
   showSkeleton ? addSkeleton(scene, currentAnimation.restpose) : null
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
   const normals = elephant.geometry.getAttribute("normal")
   const restVertices = restingElephant.geometry.getAttribute("position")
   const restNormals = restingElephant.geometry.getAttribute("normal")

   let vertex = new THREE.Vector3()
   let normal = new THREE.Vector3()
   let newVertex = new THREE.Vector3()
   let newNormal = new THREE.Vector3()
   let matrixSum = new THREE.Matrix4()
   matrixSum.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

   for (let i = 0, l = restVertices.count; i < l; i++) {
      const boneWeights = weights[i]
      const boneIndices = indices[i]

      vertex.fromBufferAttribute(restVertices, i)
      normal.fromBufferAttribute(restNormals, i)
      matrixSum.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

      for (let j = 0; j < boneIndices.length; j++) {
         const index = boneIndices[j]
         const weight = boneWeights[j]

         const boneMatrixArr = currentAnimation.frames[currentFrame][index]
         const boneMatrix = new THREE.Matrix4().fromArray(boneMatrixArr)
         const restBoneMatrixInv = restBoneMatrixInversions[index]

         const diff = boneMatrix
            .clone()
            .multiply(restBoneMatrixInv)
            .multiplyScalar(weight)

         matrixSum = addMatrices(matrixSum, diff)
      }

      newVertex = vertex.applyMatrix4(matrixSum)
      newNormal = normal.applyMatrix3(
         new THREE.Matrix3().setFromMatrix4(
            matrixSum.clone().invert().transpose()
         )
      )

      vertices.setXYZ(i, newVertex.x, newVertex.y, newVertex.z)
      normals.setXYZ(i, newNormal.x, newNormal.y, newNormal.z)
   }
   vertices.needsUpdate = true
   normals.needsUpdate = true
}

/*******************************************************************************
 * Pendulum.
 ******************************************************************************/

var box: THREE.Mesh
var sphere: THREE.Mesh
var line: THREE.Line
var velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
var mass: number = settings.mass
var stiffness: number = settings.stiffness
var step: number = settings.step
var radius: number = settings.radius
var solverType: helper.SolverTypes = settings.solverType
var double: boolean = settings.double
settings.reset = () => {
   sphere.position.set(25, 0, 0)
   velocity = new THREE.Vector3(0, 0, 0)
   updateLine()
}

function initPendulum() {
   removeSkeleton(scene)
   scene.remove(elephant)
   currentFrame = 0
   box = helper.getBox()
   sphere = helper.getSphere()
   line = helper.getLine(radius)
   scene.add(box)
   scene.add(sphere)
   scene.add(line)
   box.position.set(0, radius, 0)
   sphere.position.set(25, 0, 0)
}

function stepPendulum() {
   const gravitationalForce = new THREE.Vector3(0, -9.81 * mass, 0)

   const displacement = sphere.position.clone().sub(box.position)
   const distance = displacement.length()
   const springDirection = displacement.clone().normalize()
   const springLengthDifference = distance - radius
   const springForceMagnitude = -stiffness * springLengthDifference
   const springForce = springDirection
      .clone()
      .multiplyScalar(springForceMagnitude)

   const totalForce = gravitationalForce.clone().add(springForce)
   const acceleration = totalForce.clone().divideScalar(mass)

   switch (solverType) {
      case helper.SolverTypes.Trapezoid:
         const predictedVelocity = velocity
            .clone()
            .add(acceleration.clone().multiplyScalar(step))
         const predictedDisplacement = sphere.position
            .clone()
            .add(predictedVelocity.clone().multiplyScalar(step))
            .sub(box.position)

         const predictedDistance = predictedDisplacement.length()
         const predictedSpringDirection = predictedDisplacement
            .clone()
            .normalize()
         const predictedSpringLengthDifference = predictedDistance - radius
         const predictedSpringForceMagnitude =
            -stiffness * predictedSpringLengthDifference
         const predictedSpringForce = predictedSpringDirection
            .clone()
            .multiplyScalar(predictedSpringForceMagnitude)
         const predictedTotalForce = gravitationalForce
            .clone()
            .add(predictedSpringForce)
         const predictedAcceleration = predictedTotalForce.divideScalar(mass)

         const averageAcceleration = acceleration
            .clone()
            .add(predictedAcceleration)
            .multiplyScalar(0.5)

         velocity.add(averageAcceleration.clone().multiplyScalar(step))
         sphere.position.add(velocity.clone().multiplyScalar(step))
      case helper.SolverTypes.Euler:
         sphere.position.add(velocity.clone().multiplyScalar(step))
         velocity.add(acceleration.clone().multiplyScalar(step))
   }
   updateLine()
}

function updateLine() {
   const points = [new THREE.Vector3(0, 50, 0), sphere.position]
   line.geometry.setFromPoints(points)
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
            showSkeleton ? addSkeleton(scene, currentAnimation.restpose) : null
            currentFrame = 0
            scene.remove(elephant)
            elephant = helper.getElephant()
            showMesh ? scene.add(elephant) : null
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
         currentFrame = 0
         scene.remove(elephant)
         elephant = helper.getElephant()
         showMesh ? scene.add(elephant) : null
         restBoneMatrixInversions = boneMatrixInvs(currentAnimation)
         break
      case "mass":
         mass = changed.value
         break
      case "stiffness":
         stiffness = changed.value
         break
      case "step":
         step = changed.value
         break
      case "radius":
         radius = changed.value
         updateLine()
         break
      case "solverType":
         solverType = changed.value
         break
      case "double":
         double = changed.value
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

   const camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera)

   var controls = new OrbitControls(camera, rendererDiv)
   controls.target.set(0, 50, 0)

   wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   callback({ key: "exercise", value: settings.exercise })
   wid.animate()
}

main()
