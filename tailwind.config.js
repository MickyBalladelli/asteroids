export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#060B18',
        plasma: '#F75C03',
        aqua: '#65F9FF'
      },
      boxShadow: {
        panel: '0 10px 30px rgba(0, 0, 0, 0.4)'
      }
    }
  },
  plugins: []
};
