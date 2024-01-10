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

   context
      ? (context.canvas.width = Math.min(
           originalTexture.image.width,
           canvasTexture.image.width
        ))
      : null

   context
      ? (context.canvas.height = Math.min(
           originalTexture.image.height,
           canvasTexture.image.height
        ))
      : null

   context?.drawImage(originalTexture.image, 0, 0)
   context?.drawImage(canvasTexture.image, 0, 0)

   let combinedTexture = new THREE.CanvasTexture(
      context ? context.canvas : originalTexture.image
   )

   return combinedTexture
}
