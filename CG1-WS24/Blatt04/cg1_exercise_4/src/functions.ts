import * as THREE from "three"

export function createQuad() {
   let geometry = new THREE.BufferGeometry()
   let vertices = new Float32Array([
      -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0,

      1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0,
   ])
   geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))

   let uvs = new Float32Array([
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0,

      1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
   ])
   geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))

   return geometry
}

export function combineTextures(
   originalTexture: THREE.Texture,
   canvasTexture: THREE.CanvasTexture
) {
   let context = document.createElement("canvas").getContext("2d")

   if (context) {
      context.canvas.width = originalTexture.image.width
      context.canvas.height = originalTexture.image.height

      context.drawImage(originalTexture.image, 0, 0)
      context.drawImage(
         canvasTexture.image,
         0,
         0,
         originalTexture.image.width,
         originalTexture.image.height
      )

      let combinedTexture = new THREE.CanvasTexture(context.canvas)
      return combinedTexture
   } else {
      return originalTexture
   }
}
