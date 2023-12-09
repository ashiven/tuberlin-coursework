precision highp float;

in vec3 vertexNormal;
in vec3 viewVector;

out vec4 fragColor;

void main() {
    vec3 normalDirection = normalize(vertexNormal);
    vec3 viewDirection = normalize(viewVector);

    vec3 toonColor = vec3(1.0, 0.0, 0.0);
    float toonShades = 4.0; 

    float shadeStep = 1.0 / toonShades;
    float shadeIndex = floor(dot(normalDirection, viewDirection) / shadeStep);

    fragColor = vec4(toonColor * (shadeIndex * shadeStep), 1.0);
}
