import serve from "rollup-plugin-serve";

// rollup 可以帮我们打包es6的模块化语法
export default {
  input: "./src/single-spa.js",
  output: {
    file: "./lib/umd/single-spa.js",
    format: "umd", // umd,默认会将这个包挂到window上
    name: "singleSpa",
    sourcemap: true,
  },
  plugins: [
    serve({
      openPage: "/index.html",
      contentBase: "", // contentBase需要配置,没有值可以为空
      port: 5000,
    }),
  ],
};
