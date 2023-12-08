precision highp float;

uniform mat4 modelViewMatrix, projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 lightPosition;
uniform vec3 cameraPosition;

in vec3 position;
in vec3 normal;

out vec3 vertexNormal;
out vec3 lightVector;
out vec3 viewVector;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vertexNormal = normalize(normalMatrix * normal);
    lightVector = (modelViewMatrix * vec4(lightPosition, 1.0)).xyz - (modelViewMatrix * vec4(position, 1.0)).xyz;
    viewVector = normalize(cameraPosition - (modelViewMatrix * vec4(position, 1.0)).xyz);
}
