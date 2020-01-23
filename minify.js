/*
https://github.com/styled-components/babel-plugin-styled-components/blob/56d8d439b885ef20cb73dab77b9d85fff53fc4fe/LICENSE.md 
MIT License

Copyright (c) 2016-present Vladimir Danchenkov and Maximilian Stoiber

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const {
  minifyCookedValues,
  minifyRawValues
} = require("babel-plugin-styled-components/lib/minify");

module.exports = function(templateLiteral) {
  const quasisLength = templateLiteral.quasis.length;

  const [rawValuesMinified] = minifyRawValues(
    templateLiteral.quasis.map(x => x.value.raw)
  );

  const [
    cookedValuesMinfified,
    eliminatedExpressionIndices
  ] = minifyCookedValues(templateLiteral.quasis.map(x => x.value.cooked));

  eliminatedExpressionIndices.forEach((expressionIndex, iteration) => {
    templateLiteral.expressions.splice(expressionIndex - iteration, 1);
  });

  for (let i = 0; i < quasisLength; i++) {
    const element = templateLiteral.quasis[i];

    element.value.raw = rawValuesMinified[i];
    element.value.cooked = cookedValuesMinfified[i];
  }
};
