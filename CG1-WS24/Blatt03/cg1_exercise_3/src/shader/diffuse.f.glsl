precision highp float;

uniform vec3 lightPosition;
uniform vec3 diffuseColor;
uniform float diffuseReflectance;

in vec3 vNormal;
in vec3 vViewPosition;

out vec4 fragColor;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(lightPosition - vViewPosition);

    float diffuse = max(dot(normal, lightDirection), 0.0);

    fragColor = vec4(diffuse * diffuseReflectance * diffuseColor, 1.0);
}