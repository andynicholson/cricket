module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['babel-plugin-styled-components', {
      displayName: true,
      ssr: false,
      pure: true
    }]
  ]
}; 