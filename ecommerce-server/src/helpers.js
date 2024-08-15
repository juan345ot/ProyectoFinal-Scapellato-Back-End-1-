const exphbs = require('express-handlebars');

const hbs = exphbs.create({
  defaultLayout: 'index', 
  extname: '.handlebars', 
  helpers: {
    multiply: (a, b) => a * b,
    add: (a, b) => a + b,
    range: (start, end) => {
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } 
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});

module.exports = hbs;
