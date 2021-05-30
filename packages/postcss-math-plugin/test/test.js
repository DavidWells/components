var postcss = require('postcss');
var expect = require('chai').expect;

var plugin = require('../');
console.log('plugin', plugin)

var test = function(input, output, opts, done) {
  postcss([plugin(opts)]).process(input).then(function(result) {
    // console.log('result.css', result.css)
    expect(result.css).to.eql(output);
    expect(result.warnings()).to.be.empty;
    done();
  }).catch(function(error) {
    done(error);
  });
};

describe('postcss-math', function() {

  it('basic resolve', function(done) {
    test(
      'p{ foo: resolve(2 * (3 + 5))px; }',
      'p{ foo: 16px; }', {},
      done
    );
  });

  it('advanced resolve with units', function(done) {
    test(
      'p{ padding: resolve(20px * 2px); } div { padding: resolve(20 * 2px); }',
      'p{ padding: 40px; } div { padding: 40px; }', {},
      done
    );
  });
  it('advanced resolve', function(done) {
    test(
      'p{ padding: resolve(16 + (2 * 3))px; }',
      'p{ padding: 22px; }', {},
      done
    );
  });

  it('advanced resolve with units', function(done) {
    test(
      'p{ padding: resolve((16px + (2px * 3))); }',
      'p{ padding: 22px; }', {},
      done
    );
  });

  it('ems resolves', function(done) {
    test(
      'p{ padding: resolve(2em + 2em); }',
      'p{ padding: 4em; }', {},
      done
    );
  });

  it('rems resolves', function(done) {
    test(
      'p{ padding: resolve(2rem + 2rem); }',
      'p{ padding: 4rem; }', {},
      done
    );
  });

  it('vh resolves', function(done) {
    test(
      'p{ padding: resolve(100vh * 0.5); }',
      'p{ padding: 50vh; }', {},
      done
    );
  });

  it('customised function name', function(done) {
    test(
      'p{ foo: calculate(2 * (3 + 5))px; }',
      'p{ foo: 16px; }', {
        functionName: 'calculate'
      },
      done
    );
  });

  it('resolve with multiline arguments', function (done) {
    test(
`p {
  foo: resolve(
    1 +
    2 +
    3
  )px;
}`,
// outout
`p {
  foo: 6px;
}`,
        {},
        done
    );
  });

  it('multiplication', function(done) {
    test(
      'p{ padding: resolve(16px * (2px * 3)); } a{ padding: resolve(16px * (2 * 3)); } br{ padding: resolve(16 * (2 * 3))px; }',
      'p{ padding: 96px; } a{ padding: 96px; } br{ padding: 96px; }', {},
      done
    );
  });

  it('recursive resolve', function(done) {
    test(
      'p{ foo: resolve(2 * resolve(3 + 5)); }',
      'p{ foo: 16; }', {},
      done
    );
  });

  it('supports pixel units', function(done) {
    test(
      'p{ font-size: resolve(2 * 8px); }',
      'p{ font-size: 16px; }', {},
      done
    );
  });

  it('supports pixel calculations', function(done) {
    test(
      'p{ font-size: resolve(10px + 6px); }',
      'p{ font-size: 16px; }', {},
      done
    );
  });

  it('supports stripping units', function(done) {
    test(
      'p{ font-size: resolve(strip(8cm) * 2px); }',
      'p{ font-size: 16px; }', {},
      done
    );
  });

  it('supports common css units', function(done) {
    test(
      'p{ font-size: resolve(1rem * strip(2em)); }',
      'p{ font-size: 2rem; }', {},
      done
    );
  });

  it('supports simple exponentials', function(done) {
    test(
      'p{ font-size: resolve((4 ^ 2)px); }',
      'p{ font-size: 16px; }', {},
      done
    );
  });

  it('supports floor with unit', function(done) {
    test(
      'p{ font-size: resolve(floor(12.6px)); }',
      'p{ font-size: 12px; }', {},
      done
    );
  });

  it('supports ceil with unit', function(done) {
    test(
      'p{ font-size: resolve(ceil(12.6px)); }',
      'p{ font-size: 13px; }', {},
      done
    );
  });

  it('supports media queries', function(done) {
    test(
      '@media (min-width: resolve(10px + 100px)),' +
      '(max-width: resolve(10px + 200px)) {}',
      '@media (min-width: 110px),(max-width: 210px) {}', {},
      done
    );
  });

  it('floors and resolves', function(done) {
    test(
      '.test { test: resolve( floor( 12 / 5 ) ); }',
      '.test { test: 2; }', {},
      done
    );
  });

  it('resolves in nth-child', function(done) {
    test(
      '.x:nth-child(resolve(2 + 2)n), ' +
      '.y:nth-child(resolve(3)n) { test: 2; }',
      '.x:nth-child(4n), .y:nth-child(3n) { test: 2; }', {},
      done
    )
  });
});
