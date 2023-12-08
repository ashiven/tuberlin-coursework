precision highp float;

in vec3 position; 
in vec3 normal;
in vec2 texcoords;

out vec2 vTexcoords; 
out vec3 vNormal;
out vec3 vViewDir;
out vec3 vLightDir;
out float vLightDistance2;

uniform mat4 modelMatrix; 
uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix; 
uniform vec3 cameraPosition;
uniform vec3 lightPosition;

void main()
{
    vTexcoords = texcoords;
	vNormal = (modelMatrix * vec4(normal, 0)).xyz;
	vec4 worldPosition = modelMatrix * vec4(position, 1.0f);
	vViewDir = normalize(cameraPosition - worldPosition.xyz);
	vLightDir = lightPosition - worldPosition.xyz;
	vLightDistance2 = length(vLightDir);
	vLightDir /= vLightDistance2;
	vLightDistance2 *= vLightDistance2;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}