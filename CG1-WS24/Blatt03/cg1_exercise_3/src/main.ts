import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import type * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

import { normal, setShader } from "./functions"
import * as helper from "./helper"

import ambientFragmentShader from "./shader/ambient.f.glsl?raw"
import ambientVertexShader from "./shader/ambient.v.glsl?raw"
import basicFragmentShader from "./shader/basic.f.glsl?raw"
import basicVertexShader from "./shader/basic.v.glsl?raw"
import diffuseFragmentShader from "./shader/diffuse.f.glsl?raw"
import diffuseVertexShader from "./shader/diffuse.v.glsl?raw"
import gouraudFragmentShader from "./shader/gouraud.f.glsl?raw"
import gouraudVertexShader from "./shader/gouraud.v.glsl?raw"
import normalFragmentShader from "./shader/normal.f.glsl?raw"
import normalVertexShader from "./shader/normal.v.glsl?raw"
import phongFragmentShader from "./shader/phong.f.glsl?raw"
import phongVertexShader from "./shader/phong.v.glsl?raw"
import toonFragmentShader from "./shader/toon.f.glsl?raw"
import toonVertexShader from "./shader/toon.v.glsl?raw"

var scene: THREE.Scene
var camera: THREE.PerspectiveCamera
var settings: helper.Settings
var light: THREE.Mesh

// shader uniforms
var uniforms = {
   ambientReflectance: { value: 0.5 },
   ambientColor: { value: normal([104, 13, 13]) },
   diffuseReflectance: { value: 1 },
   diffuseColor: { value: normal([204, 25, 25]) },
   specularReflectance: { value: 1 },
   specularColor: { value: normal([255, 255, 255]) },
   lightPosition: { value: new THREE.Vector3(2, 2, 2) },
   lightColor: { value: normal([255, 255, 255]) },
   lightIntensity: { value: 1.0 },
   cameraPosition: { value: new THREE.Vector3(0, 0, 8) },
   magnitude: { value: 128 },
   roughness: { value: 0.2 },
}

function callback(changed: utils.KeyValuePair<helper.Settings>) {
   if (changed.key == "shader") {
      switch (changed.value) {
         case "Basic":
            setShader(scene, basicVertexShader, basicFragmentShader)
            break
         case "Ambient":
            setShader(
               scene,
               ambientVertexShader,
               ambientFragmentShader,
               uniforms
            )
            break
         case "Normal":
            setShader(scene, normalVertexShader, normalFragmentShader)
            break
         case "Toon":
            setShader(scene, toonVertexShader, toonFragmentShader)
            break
         case "Lambert":
            setShader(
               scene,
               diffuseVertexShader,
               diffuseFragmentShader,
               uniforms
            )
            break
         case "Gouraud":
            setShader(
               scene,
               gouraudVertexShader,
               gouraudFragmentShader,
               uniforms
            )
            break
         case "Phong":
            setShader(scene, phongVertexShader, phongFragmentShader, uniforms)
            break
         case "Blinn-Phong":
            break
         case "Cook-Torrance":
            break
      }
   } else if (changed.key == "ambient_reflectance") {
      uniforms.ambientReflectance = { value: changed.value }
   } else if (changed.key == "ambient_color") {
      uniforms.ambientColor = { value: normal(changed.value) }
   } else if (changed.key == "diffuse_reflectance") {
      uniforms.diffuseReflectance = { value: changed.value }
   } else if (changed.key == "diffuse_color") {
      uniforms.diffuseColor = { value: normal(changed.value) }
   } else if (changed.key == "specular_reflectance") {
      uniforms.specularReflectance = { value: changed.value }
   } else if (changed.key == "specular_color") {
      uniforms.specularColor = { value: normal(changed.value) }
   } else if (changed.key == "magnitude") {
      uniforms.magnitude = { value: changed.value }
   } else if (changed.key == "roughness") {
      uniforms.roughness = { value: changed.value }
   } else if (changed.key == "lightX") {
      light.position.x = changed.value
      uniforms.lightPosition.value.x = changed.value
   } else if (changed.key == "lightY") {
      light.position.y = changed.value
      uniforms.lightPosition.value.y = changed.value
   } else if (changed.key == "lightZ") {
      light.position.z = changed.value
      uniforms.lightPosition.value.z = changed.value
   } else if (changed.key == "light_color") {
      var color = new THREE.Color().fromArray(normal(changed.value))
      var material = new THREE.MeshBasicMaterial({ color: color })
      light.material = material
      uniforms.lightColor = { value: changed.value }
   } else if (changed.key == "light_intensity") {
      uniforms.lightIntensity = { value: changed.value }
   }
}

function main() {
   var root = Application("Shader")
   root.setLayout([["renderer"]])
   root.setLayoutColumns(["100%"])
   root.setLayoutRows(["100%"])

   settings = new helper.Settings()
   helper.createGUI(settings)
   settings.addCallback(callback)

   var rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)

   var renderer = new THREE.WebGLRenderer({
      antialias: true,
   })

   scene = new THREE.Scene()
   var { material } = helper.setupGeometry(scene)

   var lightgeo = new THREE.SphereGeometry(0.1, 32, 32)
   var lightColor = new THREE.Color().fromArray(normal(settings.light_color))
   lightColor.multiplyScalar(settings.light_intensity)
   var lightMaterial = new THREE.MeshBasicMaterial({ color: lightColor })
   light = new THREE.Mesh(lightgeo, lightMaterial)
   light.name = "light"
   light.position.set(settings.lightX, settings.lightY, settings.lightZ)
   scene.add(light)

   camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)

   var controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
