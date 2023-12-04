uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;
uniform mat4 projectionMatrix;

// may need this for the sphere that has its normals defined in local space (model2)
// when applying the shader to the scene pass the spheres model matrix to this shader

uniform mat4 modelMatrixLocalSphere;

in vec3 position;
in vec3 normal;

out vec3 fragNormal;

void main() {
    // normalMatrix = transpose(inverse(mat3(modelViewMatrix))); 
    //              = transpose(inverse(mat3(viewMatrix * modelMatrix)));
    fragNormal = normalMatrix * normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
