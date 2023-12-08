precision highp float;

uniform mat4 projectionMatrix, modelViewMatrix, modelMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

uniform vec3 ambientColor;
uniform float ambientReflectance;
uniform vec3 diffuseColor;
uniform float diffuseReflectance;
uniform vec3 specularColor;
uniform float specularReflectance;

uniform vec3 lightPosition;
uniform float lightIntensity;
uniform float roughness;
uniform float magnitude;

in vec3 normal;
in vec3 position;

out vec4 color;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vec3 vertexPosition = mat3(modelMatrix) * position.xyz;

    vec3 normalDirection = normalize(normalMatrix * normal);
    vec3 lightDirection = normalize(lightPosition - vertexPosition);
    vec3 viewDirection = normalize(cameraPosition - vertexPosition);
    vec3 reflectionDirection = normalize(-lightDirection + 2.0 * dot(normalDirection, lightDirection) * normalDirection);

    float diffuseTerm = diffuseReflectance * lightIntensity * max(dot(normalDirection, lightDirection), 0.0);
    float specularTerm = specularReflectance * lightIntensity * pow(max(dot(reflectionDirection, viewDirection), 0.0), magnitude);

    color = vec4(ambientReflectance * ambientColor + diffuseTerm * diffuseColor + specularTerm * specularColor, 1.0);
}