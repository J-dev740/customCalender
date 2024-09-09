module.exports = {
    presets: [
      '@babel/preset-env',    // For transforming ES6+ syntax to ES5
      '@babel/preset-react',  // For transforming JSX and React-specific syntax
      '@babel/preset-typescript' // For handling TypeScript syntax
    ],
    plugins: [
      // Optional plugins can be added here
      // '@babel/plugin-transform-runtime', // Example plugin to optimize code reuse
    ],
  };