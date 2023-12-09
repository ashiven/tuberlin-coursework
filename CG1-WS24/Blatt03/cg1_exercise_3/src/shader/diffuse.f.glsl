precision highp float;

uniform vec3 diffuseColor;
uniform float diffuseReflectance;
uniform vec3 ambientColor;
uniform float ambientReflectance;

uniform vec3 lightPosition;
uniform float lightIntensity;

in vec3 vertexNormal;
in vec3 vertexPosition; 

out vec4 fragColor;

void main() {
    vec3 normalDirection = normalize(vertexNormal);
    vec3 lightDirection = normalize(lightPosition - vertexPosition);

    float diffuseTerm = diffuseReflectance * lightIntensity * max(dot(normalDirection, lightDirection), 0.0);

    fragColor = vec4(ambientReflectance * ambientColor + diffuseTerm * diffuseColor, 1.0);
}