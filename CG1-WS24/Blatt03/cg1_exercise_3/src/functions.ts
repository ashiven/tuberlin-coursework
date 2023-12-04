import * as THREE from "three"

function normal(color: [number, number, number]) {
   return [color[0] / 255, color[1] / 255, color[2] / 255]
}

function setShader(
   scene: THREE.Scene,
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

export { normal, setShader }
