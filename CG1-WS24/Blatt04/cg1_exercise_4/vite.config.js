import checker from "vite-plugin-checker"
import Terminal from "vite-plugin-terminal"
export default {
   plugins: [checker({ typescript: true }), Terminal({ console: "terminal" })], // e.g. use TypeScript check
   resolve: { preserveSymlinks: true },
   assetsInclude: ["**/*.jpg", "**/*.glsl", "**/*.obj", "**/*.ply", "**/*.off"],
   build: {
      sourcemap: true,
   },
}
