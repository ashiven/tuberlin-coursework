precision highp float;

uniform vec3 toonColor;
uniform float toonShades; 

in vec3 vertexNormal;
in vec3 viewVector;

out vec4 fragColor;

void main() {
    vec3 normal = normalize(vertexNormal);
    vec3 viewDir = normalize(viewVector);

    float dotProduct = dot(normal, viewDir);

    float shadeStep = 1.0 / toonShades;

    float shadeIndex = floor(dotProduct / shadeStep);

    vec3 finalColor = toonColor * (shadeIndex * shadeStep);

    fragColor = vec4(finalColor, 1.0);
}
