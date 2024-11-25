precision highp float;

uniform mat4 modelViewMatrix, projectionMatrix, modelMatrix;

in vec3 position;
in vec3 normal;

out vec3 vertexNormal;
out vec3 vertexPosition;
out vec3 viewVector;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vertexNormal = normalize(transpose(inverse(mat3(modelMatrix))) * normal);
    vertexPosition = (modelMatrix * vec4(position, 1.0)).xyz;
}
