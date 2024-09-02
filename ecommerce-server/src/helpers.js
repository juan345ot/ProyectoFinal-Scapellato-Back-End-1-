const exphbs = require('express-handlebars');

const hbs = exphbs.create({
  defaultLayout: 'index', 
  extname: '.handlebars', 
  helpers: {
    multiply: (a, b) => a * b,
    add: (a, b) => a + b,
    range: (start, end, currentPage) => { 
      end = Math.max(end, start);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
        .map(page => ({
          page,
          isCurrentPage: page === currentPage
        }));
    },
    unless: function(conditional, options) {
      return (conditional === true) ? options.inverse(this) : options.fn(this);
    },
    gt: function (a, b) {
      return a > b;
    }
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});

module.exports = hbs;
