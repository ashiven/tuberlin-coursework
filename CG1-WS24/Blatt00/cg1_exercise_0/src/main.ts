import * as dat from "dat.gui"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

import * as helper from "./helper"

/*******************************************************************************
 * Defines Settings and GUI.
 ******************************************************************************/

enum Models {
   quad = "Quad",
   box = "Box",
   sphere = "Sphere",
   torus = "Torus",
}

// Settings class with default values. An instance of Settings stores the current state.
// Different setting types are possible (e.g. string, enum, number, boolean, function).
class Settings extends utils.Callbackable {
   name: string = "Basic"
   model: Models = Models.box
   scale: number = 1
   disco: boolean = false
   fun: () => void = function () {
      alert("You clicked me!")
   }
}

// Create GUI given a Settings object.
// we are using dat.GUI (https://github.com/dataarts/dat.gui)
function createGUI(settings: Settings): dat.GUI {
   var gui: dat.GUI = new dat.GUI()

   gui.add(settings, "name").name("App name")
   gui.add(settings, "model", utils.enumOptions(Models)).name("3D Model")
   gui.add(settings, "scale", 0, 1, 0.1).name("Scale")
   gui.add(settings, "disco").name("Disco")
   gui.add(settings, "fun").name("Click Me")

   return gui
}

/*******************************************************************************
 * The main application. Your logic should later be separated into multiple files.
 ******************************************************************************/

var mesh: THREE.Mesh

// Defines the callback that should get called
// whenever the settings change (i.e. via GUI).
function callback(changed: utils.KeyValuePair<Settings>) {
   if (changed.key == "name") {
      document.title = changed.value
   } else if (changed.key == "model") {
      switch (changed.value) {
         case Models.box:
            mesh.geometry = new THREE.BoxGeometry(1, 1, 1)
            break
         case Models.sphere:
            mesh.geometry = new THREE.SphereGeometry(0.66, 30, 30)
            break
         case Models.torus:
            mesh.geometry = new THREE.TorusGeometry(1, 0.2, 8, 10)
            break
         case Models.quad:
            mesh.geometry = new THREE.PlaneGeometry(1, 1)
            break
      }
   } else if (changed.key == "scale") {
      helper.scale(mesh, 1, 1, 1)
   }
}

/*******************************************************************************
 * Main entrypoint. Previouly declared functions get managed/called here.
 * Start here with programming.
 ******************************************************************************/

function main() {
   // Settings up an html document with a grid layout.
   var root = Application("Basic")
   root.setLayout([
      ["renderer", "renderer", "renderer"],
      ["renderer", "renderer", "renderer"],
      ["renderer", "renderer", "renderer"],
   ])
   root.setLayoutColumns(["1fr", "1fr", "1fr"])
   root.setLayoutRows(["20%", "10%", "70%"])

   var rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)

   root.addEventListener("keydown", (e) => {
      if (e.key == " ") {
         alert("You pressed space!")
      }
   })

   // Settings is an extension of utils.Callbackable
   var settings = new Settings()
   settings.addCallback(callback)
   var gui = createGUI(settings)
   gui.open()

   // Setup renderer, scene and camera.
   var renderer = new THREE.WebGLRenderer({
      antialias: true,
   })

   var scene = new THREE.Scene()
   helper.setupScene(scene)

   mesh = helper.setupGeometry(scene)
   helper.setupLight(scene)

   var camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)

   var controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()

let variable = "expose me"
;(<any>window).variable = variable
