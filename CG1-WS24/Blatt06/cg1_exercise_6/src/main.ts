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
         showSkeleton
            ? addSkeleton(scene, currentAnimation.restpose)
            : removeSkeleton(scene)
         break
      case "restpose":
         showRestpose = changed.value
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
         showSkeleton
            ? addSkeleton(scene, currentAnimation.restpose)
            : removeSkeleton(scene)
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
