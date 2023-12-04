import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import type * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

import * as helper from "./helper"

import ambientFragmentShader from "./shader/ambient.f.glsl?raw"
import ambientVertexShader from "./shader/ambient.v.glsl?raw"
import basicFragmentShader from "./shader/basic.f.glsl?raw"
import basicVertexShader from "./shader/basic.v.glsl?raw"

var scene: THREE.Scene
var settings: helper.Settings
var light: THREE.Mesh

function setShader(
   newVertexShader: any,
   newFragmentShader: any,
   uniforms?: any
) {
   var newMaterial = new THREE.RawShaderMaterial({
      vertexShader: newVertexShader,
      fragmentShader: newFragmentShader,
      uniforms: uniforms || {},
   })
   newMaterial.glslVersion = THREE.GLSL3

   scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.name != "light") {
         obj.material = newMaterial
      }
   })
}

function callback(changed: utils.KeyValuePair<helper.Settings>) {
   if (changed.key == "shader") {
      switch (changed.value) {
         case "Basic":
            setShader(basicVertexShader, basicFragmentShader)
            break
         case "Ambient":
            setShader(ambientVertexShader, ambientFragmentShader, {
               ambientReflectance: settings.ambient_reflectance,
               ambientColor: settings.ambient_color,
            })
            break
         case "Normal":
            break
         case "Toon":
            break
         case "Lambert":
            break
         case "Gouraud":
            break
         case "Phong":
            break
         case "Blinn-Phong":
            break
         case "Cook-Torrance":
            break
      }
   } else if (changed.key == "ambient_reflectance") {
      console.log("ambient_reflectance", changed.value)
      setShader(ambientVertexShader, ambientFragmentShader, {
         ambientReflectance: changed.value,
         ambientColor: settings.ambient_color,
      })
   } else if (changed.key == "ambient_color") {
      console.log("ambient_color", changed.value)
      setShader(ambientVertexShader, ambientFragmentShader, {
         ambientReflectance: settings.ambient_reflectance,
         ambientColor: changed.value,
      })
   } else if (changed.key == "diffuse_reflectance") {
      console.log("diffuse_reflectance", changed.value)
   } else if (changed.key == "diffuse_color") {
      console.log("diffuse_color", changed.value)
   } else if (changed.key == "specular_reflectance") {
      console.log("specular_reflectance", changed.value)
   } else if (changed.key == "specular_color") {
      console.log("specular_color", changed.value)
   } else if (changed.key == "magnitude") {
      console.log("magnitude", changed.value)
   } else if (changed.key == "roughness") {
      console.log("roughness", changed.value)
   } else if (changed.key == "lightX") {
      light.position.x = changed.value
   } else if (changed.key == "lightY") {
      light.position.y = changed.value
   } else if (changed.key == "lightZ") {
      light.position.z = changed.value
   } else if (changed.key == "light_color") {
      console.log("light_color", changed.value)
      var color = new THREE.Color()
      color.fromArray([
         changed.value[0] / 255,
         changed.value[1] / 255,
         changed.value[2] / 255,
      ])
      var material = new THREE.MeshBasicMaterial({ color: color })
      light.material = material
   } else if (changed.key == "light_intensity") {
      console.log("light_intensity", changed.value)
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
   var lightMaterial = new THREE.MeshBasicMaterial({ color: 0xff8010 })
   light = new THREE.Mesh(lightgeo, lightMaterial)
   light.name = "light"
   scene.add(light)

   var camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)

   var controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
