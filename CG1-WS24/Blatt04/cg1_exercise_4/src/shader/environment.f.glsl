precision highp float;

#define PI 3.14159265

uniform sampler2D textureImg;

in vec3 vertexNormal;
in vec3 viewVector;

out vec4 fragColor;

void main()
{
    vec3 normalDirection = normalize(vertexNormal);
	vec3 viewDirection = normalize(viewVector);
    vec3 reflectionDirection = 2.0 * dot(viewDirection, normalDirection) * normalDirection - viewDirection;

    float u = (PI + atan(reflectionDirection.z, reflectionDirection.x)) / 2.0 * PI;
    float v = atan(sqrt(reflectionDirection.x * reflectionDirection.x + reflectionDirection.z * reflectionDirection.z), -reflectionDirection.y) / PI;

    u = u / 10.0;

    vec2 vUv = vec2(u, v);

	fragColor = texture(textureImg, vUv);
}