precision highp float;

uniform mat4 modelViewMatrix, projectionMatrix, modelMatrix;
uniform mat3 normalMatrix;
uniform vec3 lightPosition;
uniform vec3 cameraPosition;

in vec3 position;
in vec3 normal;

out vec3 vertexNormal;
out vec3 viewVector;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vertexNormal = normalize(transpose(inverse(mat3(modelMatrix))) * normal);
    viewVector = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
}
