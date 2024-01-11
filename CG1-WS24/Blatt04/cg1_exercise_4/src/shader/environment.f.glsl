precision highp float;

#define PI 3.14159265

in vec3 vertexNormal;
in vec3 viewVector;

out vec4 fragColor;

void main()
{
    vec3 normalDirection = normalize(vertexNormal);
	vec3 viewDirection = normalize(viewVector);
    vec3 reflectionDirection = 2 * dot(viewDirection, normalDirection) * normalDirection - viewDirection;

	fragColor = vec4(reflectionDirection, 1.0);
}