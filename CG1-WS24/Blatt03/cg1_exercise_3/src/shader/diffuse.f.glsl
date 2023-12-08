precision highp float;

uniform vec3 diffuseColor;
uniform float diffuseReflectance;
uniform float lightIntensity;

in vec3 vertexNormal;
in vec3 lightVector;

out vec4 fragColor;

void main() {
    float diffuseTerm = max(dot(normalize(lightVector), normalize(vertexNormal)), 0.0);

    fragColor = lightIntensity * diffuseTerm * vec4(diffuseColor * diffuseReflectance, 1.0);
}