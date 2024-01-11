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

    float m = 2.0 * sqrt(pow( reflectionDirection.x, 2.0 ) + pow( reflectionDirection.y, 2.0 ) + pow( reflectionDirection.z + 1.0, 2.0 ));
    vec2 vUv = reflectionDirection.xy / m + 0.5;

	fragColor = texture(textureImg, vUv);
}