precision highp float;

uniform vec3 diffuseColor;
uniform float diffuseReflectance;

in vec3 vertexNormal;
in vec3 lightVector;

out vec4 fragColor;

void main() {
    float diffuse = max(dot(normalize(lightVector), normalize(vertexNormal)), 0.0);

    fragColor = diffuse * vec4(diffuseColor * diffuseReflectance, 1.0);
}