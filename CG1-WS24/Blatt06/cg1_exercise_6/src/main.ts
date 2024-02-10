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

var settings: helper.Settings = new helper.Settings()
var scene: THREE.Scene
var wid: RenderWidget
var elephant: THREE.Mesh
var showMesh: boolean = settings.mesh
var showSkeleton: boolean = settings.skeleton
var showRestpose: boolean = settings.restpose

/*******************************************************************************
 * Linear Blend Skinning.
 ******************************************************************************/

function initAnimation() {
   //console.log("Intializing animation.")
}

function stepAnimation() {
   //console.log("Step animation.")
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
         break
      case "restpose":
         showRestpose = changed.value
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

   const swimmingRest = swimming.restpose
   const dancingRest = swing_dance.restpose
   const jumpingRest = jump.restpose

   const a = indices
   const b = weights

   for (const matrixWorldArr of jumpingRest) {
      const matrixWorld = new THREE.Matrix4().fromArray(matrixWorldArr)
      const sphere = new THREE.Mesh(
         new THREE.SphereGeometry(0.01),
         new THREE.MeshBasicMaterial({ color: 0xff0000 })
      )
      sphere.applyMatrix4(matrixWorld)
      scene.add(sphere)
   }

   const camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera)

   var controls = new OrbitControls(camera, rendererDiv)
   controls.target.set(0, 50, 0)

   wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   callback({ key: "exercise", value: settings.exercise })
   wid.animate()
}

main()
