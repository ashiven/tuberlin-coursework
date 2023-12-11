precision highp float;

#define PI 3.14159265

uniform vec3 cameraPosition;

in vec3 vertexNormal;
in vec3 vertexPosition;

out vec4 fragColor;

void main() {
    vec3 normalDirection = normalize(vertexNormal);
    vec3 viewDirection = normalize(cameraPosition - vertexPosition);
    float angle = acos(dot(normalDirection, viewDirection));

    vec3 shadeColor = vec3(1.0, 0.0, 0.0);
    float shadeStep = 0.2;
    float shadeIntensity = 0.0;

    if (0.0 < angle && angle <= PI / 8.0) {
        shadeIntensity = 4.0;
    } else if (PI / 8.0 < angle && angle <= 2.0 * PI / 8.0) {
        shadeIntensity = 3.0;
    } else if (2.0 * PI / 8.0 < angle && angle <= 3.0 * PI / 8.0) {
        shadeIntensity = 2.0;
    } else if (3.0 * PI / 8.0 < angle && angle <= 4.0 * PI / 8.0) {
        shadeIntensity = 1.0;
    } else {
        shadeIntensity = 0.0;
    }

    fragColor = vec4(shadeIntensity * shadeStep * shadeColor, 1.0);
}
