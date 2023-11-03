import * as THREE from "three"

// ========================== BODY ==========================
const bodyGeometry = new THREE.BoxGeometry(1, 2, 0.5)
const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
body.name = "body"

// ========================== HEAD ==========================
const headGeometry = new THREE.SphereGeometry(0.5, 32, 32)
const headMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
const head = new THREE.Mesh(headGeometry, headMaterial)
head.name = "head"

// position head
head.matrix.makeTranslation(0, 2, 0)

// update matrix world
head.updateMatrixWorld(true)

//initial transform
const headInit = head.matrix.clone()

// ========================== ARMS ==========================
const armGeometry = new THREE.BoxGeometry(1, 0.2, 0.2) // Smaller rectangle for arms
const leftArmMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
const rightArmMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
const leftArm = new THREE.Mesh(armGeometry, leftArmMaterial)
const rightArm = new THREE.Mesh(armGeometry, rightArmMaterial)
leftArm.name = "leftArm"
rightArm.name = "rightArm"

// position arms
leftArm.matrix.makeTranslation(-1.5, 0.5, 0)
rightArm.matrix.makeTranslation(1.5, 0.5, 0)

// rotate arms
//const rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2) // 90 degrees in radians
//const rotationMatrix2 = new THREE.Matrix4().makeRotationY(Math.PI / 2) // 90 degrees in radians
//leftArm.matrix.multiplyMatrices(rotationMatrix, leftArm.matrix)
//leftArm.matrix.multiplyMatrices(rotationMatrix2, leftArm.matrix)

// update matrix world
leftArm.updateMatrixWorld(true)
rightArm.updateMatrixWorld(true)

//initial transform
const leftArmInit = leftArm.matrix.clone()
const rightArmInit = rightArm.matrix.clone()

// ========================== LEGS ==========================
const legGeometry = new THREE.BoxGeometry(0.2, 1, 0.2) // Smaller rectangle for legs
const leftLegMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
const rightLegMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
const leftLeg = new THREE.Mesh(legGeometry, leftLegMaterial)
const rightLeg = new THREE.Mesh(legGeometry, rightLegMaterial)
leftLeg.name = "leftLeg"
rightLeg.name = "rightLeg"

// position legs
leftLeg.matrix.makeTranslation(-0.5, -2, 0)
rightLeg.matrix.makeTranslation(0.5, -2, 0)

// update matrix world
leftLeg.updateMatrixWorld(true)
rightLeg.updateMatrixWorld(true)

//initial transform
const leftLegInit = leftLeg.matrix.clone()
const rightLegInit = rightLeg.matrix.clone()

// ========================== FEET ==========================
const footGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.5) // Smaller rectangle for feet
const leftFootMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
const rightFootMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue color
const leftFoot = new THREE.Mesh(footGeometry, leftFootMaterial)
const rightFoot = new THREE.Mesh(footGeometry, rightFootMaterial)
leftFoot.name = "leftFoot"
rightFoot.name = "rightFoot"

// position feet
leftFoot.matrix.makeTranslation(-0.5, -3, 0)
rightFoot.matrix.makeTranslation(0.5, -3, 0)

// update matrix world
leftFoot.updateMatrixWorld(true)
rightFoot.updateMatrixWorld(true)

//initial transform
const leftFootInit = leftFoot.matrix.clone()
const rightFootInit = rightFoot.matrix.clone()

function resetPositions(scene: any) {
   scene.traverse((object: any) => {
      if (object instanceof THREE.Mesh) {
         switch (object.name) {
            case "head":
               object.matrix.copy(headInit)
               object.updateMatrixWorld(true)
               break
            case "leftArm":
               object.matrix.copy(leftArmInit)
               object.updateMatrixWorld(true)
               break
            case "rightArm":
               object.matrix.copy(rightArmInit)
               object.updateMatrixWorld(true)
               break
            case "leftLeg":
               object.matrix.copy(leftLegInit)
               object.updateMatrixWorld(true)
               break
            case "rightLeg":
               object.matrix.copy(rightLegInit)
               object.updateMatrixWorld(true)
               break
            case "leftFoot":
               object.matrix.copy(leftFootInit)
               object.updateMatrixWorld(true)
               break
            case "rightFoot":
               object.matrix.copy(rightFootInit)
               object.updateMatrixWorld(true)
               break
            default:
               break
         }
      }
   })
}

export {
   body,
   head,
   leftArm,
   leftFoot,
   leftLeg,
   resetPositions,
   rightArm,
   rightFoot,
   rightLeg,
}
