precision highp float;

uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

in vec3 position;
in vec2 uv;

out vec3 vertexPosition;
out vec3 viewVector;
out vec2 vUv;

void main(){
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    vertexPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    viewVector = cameraPosition - vertexPosition;
    vUv = uv;
}