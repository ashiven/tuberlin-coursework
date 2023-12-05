uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 lightPosition;

in vec3 position;
in vec3 normal;

out vec3 vertexNormal;
out vec3 lightVector;

void main() {
    vertexNormal = normalize(normalMatrix * normal);

    lightVector = ( modelViewMatrix * vec4(lightPosition, 1.0) ).xyz - ( modelViewMatrix * vec4(position, 1.0) ).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}