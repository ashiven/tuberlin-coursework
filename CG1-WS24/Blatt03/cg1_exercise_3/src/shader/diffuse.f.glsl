precision highp float;

uniform vec3 diffuseColor;
uniform float diffuseReflectance;
uniform vec3 lightPosition;
uniform float lightIntensity;

in vec3 fragNormal;
in vec3 vertexPosition; 
in vec3 viewVector;

out vec4 fragColor;

void main() {
    vec3 normalDirection = normalize(fragNormal);
    vec3 lightDirection = normalize(lightPosition - vertexPosition);
    float diffuseTerm = diffuseReflectance * max(dot(lightDirection, normalDirection), 0.0);

    fragColor = vec4(diffuseTerm * diffuseColor, 1.0);
}