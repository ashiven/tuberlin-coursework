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
   updateLine,
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
   scene.remove(sphere2)
   scene.remove(line)
   scene.remove(line2)
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
   var frameBoneMatrices = []
   const boneMatrixArrs = currentAnimation.frames[currentFrame]
   for (let i = 0; i < boneMatrixArrs.length; i++) {
      const frameBoneMatrix = new THREE.Matrix4().fromArray(boneMatrixArrs[i])
      frameBoneMatrices.push(frameBoneMatrix)
   }

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

         const boneMatrix = frameBoneMatrices[index]
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
var sphere2: THREE.Mesh
var line: THREE.Line
var line2: THREE.Line
var velocity: THREE.Vector3
var velocity2: THREE.Vector3
var mass: number = settings.mass
var stiffness: number = settings.stiffness
var step: number = settings.step
var radius: number = settings.radius
var solverType: helper.SolverTypes = settings.solverType
var double: boolean = settings.double
settings.reset = () => {
   sphere.position.set(25, 0, 0)
   velocity = new THREE.Vector3(0, 0, 0)
   updateLine(line, box, sphere)
   if (double) {
      sphere2.position.set(0, -radius, 0)
      velocity2 = new THREE.Vector3(0, 0, 0)
      updateLine(line2, sphere, sphere2)
   }
}

function initPendulum() {
   removeSkeleton(scene)
   scene.remove(elephant)
   scene.remove(line)
   scene.remove(line2)
   scene.remove(sphere)
   scene.remove(sphere2)
   scene.remove(box)
   velocity = new THREE.Vector3(0, 0, 0)
   velocity2 = new THREE.Vector3(0, 0, 0)
   box = helper.getBox()
   sphere = helper.getSphere()
   line = helper.getLine(radius)
   scene.add(box)
   scene.add(sphere)
   scene.add(line)
   box.position.set(0, radius, 0)
   sphere.position.set(25, 0, 0)
   if (double) {
      sphere2 = helper.getSphere()
      line2 = helper.getLine(radius)
      scene.add(line2)
      scene.add(sphere2)
      sphere2.position.set(0, -radius, 0)
   }
}

function stepPendulum() {
   let acceleration = getAcceleration(box, sphere)
   if (double) {
      acceleration = getAcceleration(box, sphere, sphere2)
      const acceleration2 = getAcceleration(sphere, sphere2)
      updatePositionAndVelocity(
         velocity2,
         acceleration2,
         sphere,
         sphere2,
         velocity,
         true
      )
      updateLine(line2, sphere, sphere2)
   }
   updatePositionAndVelocity(velocity, acceleration, box, sphere)
   updateLine(line, box, sphere)
}

function getAcceleration(
   objectFix: THREE.Mesh,
   objectAttached: THREE.Mesh,
   objectBelow?: THREE.Mesh
) {
   const gravitationalForce = new THREE.Vector3(0, -9.81 * mass, 0)
   const springForce = getSpringForce(objectAttached, objectFix)
   let totalForce = gravitationalForce.clone().add(springForce)
   if (objectBelow) {
      const springForce2 = getSpringForce(objectAttached, objectBelow)
      totalForce.add(springForce2)
   }
   const acceleration = totalForce.clone().divideScalar(mass)
   return acceleration
}

function updatePositionAndVelocity(
   velocity: THREE.Vector3,
   acceleration: THREE.Vector3,
   objectFix: THREE.Mesh,
   objectAttached: THREE.Mesh,
   firstSphereVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
   twoSpheres: boolean = false
) {
   objectAttached.position.add(velocity.clone().multiplyScalar(step))
   switch (solverType) {
      case helper.SolverTypes.Trapezoid:
         const updatedObjectAttached = objectAttached.clone()
         updatedObjectAttached.position.add(
            velocity.clone().multiplyScalar(step)
         )
         let predictedAcceleration = getAcceleration(
            objectFix,
            updatedObjectAttached
         )
         if (twoSpheres) {
            const updatedObjectFix = objectFix.clone()
            updatedObjectFix.position.add(
               firstSphereVelocity.clone().multiplyScalar(step)
            )
            predictedAcceleration = getAcceleration(
               updatedObjectFix,
               updatedObjectAttached
            )
         }

         const averageAcceleration = acceleration
            .clone()
            .add(predictedAcceleration)
            .multiplyScalar(0.5)

         velocity.add(averageAcceleration.clone().multiplyScalar(step))
      case helper.SolverTypes.Euler:
         velocity.add(acceleration.clone().multiplyScalar(step))
   }
}

function getSpringForce(objectA: THREE.Mesh, objectB: THREE.Mesh) {
   const displacement = objectA.position.clone().sub(objectB.position)
   const distance = displacement.length()
   const springDirection = displacement.clone().normalize()
   const springLengthDifference = distance - radius
   const springForceMagnitude = -stiffness * springLengthDifference
   const springForce = springDirection
      .clone()
      .multiplyScalar(springForceMagnitude)
   return springForce
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
         updateLine(line, box, sphere)
         updateLine(line2, sphere, sphere2)
         break
      case "solverType":
         solverType = changed.value
         break
      case "double":
         double = changed.value
         initPendulum()
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
