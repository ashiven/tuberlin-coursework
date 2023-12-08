precision highp float;

#define PI 3.14159265

in vec2 vTexcoords;
in vec3 vNormal;
in vec3 vViewDir;
in vec3 vLightDir;
in float vLightDistance2;

uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float roughness;
uniform vec3 lightColor;

out vec3 outColor;

vec3 CookTorrance(vec3 materialDiffuseColor,
	vec3 materialSpecularColor,
	vec3 normal,
	vec3 lightDir,
	vec3 viewDir,
	vec3 lightColor)
{
    float F0 = 0.8;
    float k = 0.2;
	float NdotL = max(0.0, dot(normal, lightDir));
	float Rs = 0.0;
	if (NdotL > 0.0) 
	{
		vec3 H = normalize(lightDir + viewDir);
		float NdotH = max(0.0, dot(normal, H));
		float NdotV = max(0.0, dot(normal, viewDir));
		float VdotH = max(0.0, dot(lightDir, H));

		// Fresnel reflectance
		float F = pow(1.0 - VdotH, 5.0);
		F *= (1.0 - F0);
		F += F0;

		// Microfacet distribution by Beckmann
		float m_squared = roughness * roughness;
		float r1 = 1.0 / (4.0 * m_squared * pow(NdotH, 4.0));
		float r2 = (NdotH * NdotH - 1.0) / (m_squared * NdotH * NdotH);
		float D = r1 * exp(r2);

		// Geometric shadowing
		float two_NdotH = 2.0 * NdotH;
		float g1 = (two_NdotH * NdotV) / VdotH;
		float g2 = (two_NdotH * NdotL) / VdotH;
		float G = min(1.0, min(g1, g2));

		Rs = (F * D * G) / (PI * NdotL * NdotV);
	}
	return materialDiffuseColor * lightColor * NdotL + lightColor * materialSpecularColor * NdotL * (k + Rs * (1.0 - k));
}

void main()
{
	outColor = CookTorrance(diffuseColor,
		specularColor,
		vNormal,
		vLightDir,
		vViewDir,
		lightColor);
}