const isProd = String(process.env.NODE_ENV) === 'production'
const isTest = String(process.env.NODE_ENV) === 'test'

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        modules: isTest ? 'commonjs' : 'auto',
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    'transform-remove-debugger',
    'babel-plugin-remove-debug',
  ],
}
