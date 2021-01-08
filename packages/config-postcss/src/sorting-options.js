/* https://github.com/hudochenkov/postcss-sorting - Keeps rules and at-rules content in a sorted order */

module.exports = {
  order: [
    'custom-properties',
    'dollar-variables',
    'at-variables'
    // 'declarations',
    // 'rules',
    // 'at-rules'
  ], // Specify order of content in declaration blocks.
  'properties-order': [
    {
      emptyLineBefore: false,
      properties: [
        'display',
        'align-items',
        'align-content',
        'justify-content',
        'flex-direction',
        'flex-order',
        'flex-pack',
        'flex-align',
        'float',
        'clear',
        'clip',
        'zoom',
        'visibility',
        'overflow',
        'overflow-x',
        'overflow-y'
      ]
    },
    {
      emptyLineBefore: true,
      properties: ['position', 'top', 'right', 'bottom', 'left', 'z-index']
    },
    {
      emptyLineBefore: true,
      properties: [
        'box-sizing',
        'width',
        'min-width',
        'max-width',
        'height',
        'min-height',
        'max-height',
        'margin',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left'
      ]
    },
    {
      emptyLineBefore: true,
      properties: [
        'outline',
        'outline-width',
        'outline-style',
        'outline-color',
        'outline-offset',
        'box-shadow',
        'border',
        'border-top',
        'border-right',
        'border-bottom',
        'border-left',
        'border-width',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
        'border-style',
        'border-top-style',
        'border-right-style',
        'border-bottom-style',
        'border-left-style',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'border-radius',
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-right-radius',
        'border-bottom-left-radius',
        'border-image',
        'border-image-source',
        'border-image-slice',
        'border-image-width',
        'border-image-outset',
        'border-image-repeat'
      ]
    },
    {
      emptyLineBefore: true,
      properties: [
        'background',
        'background-color',
        'background-image',
        'background-repeat',
        'background-attachment',
        'background-position',
        'background-position-x',
        'background-position-y',
        'background-clip',
        'background-origin',
        'background-size',
        'box-decoration-break',
        'opacity',
        'filter',
        'interpolation-mode'
      ]
    },
    {
      emptyLineBefore: true,
      properties: [
        'font',
        'font-family',
        'font-size',
        'font-weight',
        'font-style',
        'font-variant',
        'font-size-adjust',
        'font-stretch',
        'font-effect',
        'font-emphasize',
        'font-emphasize-position',
        'font-emphasize-style',
        'font-smooth',
        'line-height',
        'letter-spacing',
        'word-spacing',
        'color'
      ]
    },
    {
      emptyLineBefore: true,
      properties: [
        'content',
        'quotes',
        'counter-reset',
        'counter-increment',
        'resize',
        'cursor',
        'user-select',
        'nav-index',
        'nav-up',
        'nav-right',
        'nav-down',
        'nav-left',
        'text-align',
        'text-align-last',
        'vertical-align',
        'white-space',
        'text-decoration',
        'text-emphasis',
        'text-emphasis-color',
        'text-emphasis-style',
        'text-emphasis-position',
        'text-indent',
        'text-justify',
        'text-shadow',
        'writing-mode',
        'text-outline',
        'text-transform',
        'text-wrap',
        'text-overflow',
        'text-overflow-ellipsis',
        'text-overflow-mode',
        'word-wrap',
        'word-break',
        'tab-size',
        'hyphens',
        'pointer-events'
      ]
    },
    {
      emptyLineBefore: true,
      properties: [
        'list-style',
        'list-style-position',
        'list-style-type',
        'list-style-image',
        'table-layout',
        'border-collapse',
        'border-spacing',
        'empty-cells',
        'caption-side'
      ]
    },
    {
      emptyLineBefore: true,
      properties: [
        'transition',
        'transition-delay',
        'transition-timing-function',
        'transition-duration',
        'transition-property',
        'transform',
        'transform-origin',
        'animation',
        'animation-name',
        'animation-duration',
        'animation-play-state',
        'animation-timing-function',
        'animation-delay',
        'animation-iteration-count',
        'animation-direction'
      ]
    }
  ],
  // 'properties-order': 'alphabetical',
  // Specify position for properties not specified in `properties-order` config (if you provided an Array of properties).
  'unspecified-properties-position': 'bottomAlphabetical',
  'throw-validate-errors': false
}
