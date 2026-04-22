/** @type {import('@babel/core').BabelPluginOptions} */
const config = {
	babelConfig: {
		babelrc: false,
		configFile: false,
		presets: [["@babel/preset-react", { runtime: "automatic" }], ["@babel/preset-typescript"]],
		plugins: ["@lingui/babel-plugin-lingui-macro"],
	},
	filter: /\.[jt]sx?$/,
};

export default config;
