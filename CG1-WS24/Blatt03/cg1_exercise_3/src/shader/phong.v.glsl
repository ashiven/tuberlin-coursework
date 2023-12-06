precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

in vec3 position;
in vec3 normal;

out vec3 wfn;
out vec3 vertPos;

void main(){
  wfn = vec3(inverse(transpose(modelMatrix)) * vec4(normal, 0.0));

  vec4 vertPos4 = modelMatrix * vec4(position, 1.0);
  vertPos = vec3(vertPos4) / vertPos4.w;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}