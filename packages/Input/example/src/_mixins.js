const Color = require('color')
const validateColor = require("validate-color").default

let GLOBAL_TOKENS
module.exports = (tokens) => {
  GLOBAL_TOKENS = tokens

  return {
    /* clear floats */
    clearfix: {
      '&::after': {
        content: '""',
        display: 'table',
        clear: 'both'
      }
    },
    /* Disable selectable text */
    noSelect: {
      '-webkit-touch-callout': 'none',
      '-webkit-user-select': 'none',
      '-khtml-user-select': 'none',
      '-moz-user-select': 'none',
      '-ms-user-select': 'none',
      'user-select': 'none'
    },
    /* stripe background */
    stripedBackground: {
      'background': 'repeating-linear-gradient(25deg, #2e303d, #2e303d 120px, #2a2c39 20px, #2a2c39 330px);',
      /*'background-image': `linear-gradient(32deg, rgb(46, 48, 61) 14.29%,
        rgb(42, 44, 57) 14.29%,
        rgb(42, 44, 57) 50%,
        rgb(46, 48, 61) 50%,
        rgb(46, 48, 61) 64.29%, rgb(42, 44, 57) 64.29%,
        rgb(42, 44, 57) 100%)
      `,
      'background-size': '158.51px 99.05px'*/
    },
    placeholderColor: (_args, color) => {
      return {
        /* Chrome/Opera/Safari */
        '&::-webkit-input-placeholder': {
          'color': color
        },
        /* Firefox 19+ */
        '&::-moz-placeholder': {
          'color': color
        },
        /* IE 10+ */
        '&:-ms-input-placeholder': {
          'color': color
        },
        /* Firefox 18- */
        '&:-moz-placeholder': {
          'color': color
        },
      }
    },
    /* Box shadows */
    shadows: (size) => {
      const shadows = {
        smallest: '0px 4px 8px rgba(0,0,0,0.12)',
        small: '0 5px 10px rgba(0,0,0,0.12)',
        medium: '0 8px 30px rgba(0,0,0,0.12)',
        large: '0 30px 60px rgba(0,0,0,0.12)',
      }
      return {
        'box-shadow': shadows[size] || shadows.smallest
      }
    },
    /* Highlight and wobble */
    debug: () => {
      return {
        '&': {
          'animation': `debugWobble 0.5s ease-in-out alternate infinite`
        },
        '@keyframes debugWobble': {
          '0%': {
            'box-shadow': 'inset 4px 4px rgb(236, 15, 170), inset -4px -4px rgb(236, 15, 170)'
          },
          '100%': {
            'box-shadow': 'inset 8px 8px rgb(236, 15, 170), inset -8px -8px rgb(236, 15, 170)'
          },
        }
      }
    },
    /* visually hidden */
    visuallyHidden: {
      position: 'absolute',
      top: 'auto',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    },
    overlay(_, opacity = 0, color = tokens.primary) {
      return {
        position: 'fixed',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: 99,
        'background-color': ensureColor(color),
        visibility: (opacity === 0) ? 'hidden' : 'visible',
        opacity: formatOpacity(opacity),
        transition: '.5s'
      }
    },
    // https://github.com/Datawheel/authority-health/blob/ef35fb353220b058d280eed67a0638a7ac472459/app/css/mixins.css#L142
    fullwidthSection: () =>{
      return {
        'margin-left': 'auto',
        'margin-right': 'auto',
        'margin-left': 'calc(-50vw + 50%)',
        'margin-right': 'calc(-50vw + 50%)',
      }
    },
    fullwidthPseudo: () => {
      return {
        /* pseudo stuff */
        content: "",
        display: 'block',
        /* positioning & sizing */
        position: 'absolute',
        /* fill container height */
        top: 0,
        bottom: 0,
        height: '100%',
        /* fill page width */
        left: 'calc(-50vw + 50%)',
        right: 'calc(-50vw + 50%)',
        'min-width': '100%',
        'z-index': -1, /* behind content */
      }
    },
    /* using @mixin-content example */
    isIe: function () {
      return {
        'background': 'blue',
        '@mixin-content': {},
      }
    },
    fullScreenGrid: (mixin, type = 'golden') => {
      const styleSet = {
        display: 'grid',
        position: 'relative',
        height: '100vh',
        width: '100%',
        '@mixin-content': {}
      }

      if (type === 'golden') {
        Object.assign(styleSet, {
          'grid-template-rows':
            // eslint-disable-next-line max-len
            '1fr 1fr 2fr 4fr 2.66fr 5.33fr 5.33fr 4.33fr 2.83fr 3.5fr 3.5fr 2.83fr 4.33fr 5.33fr 5.33fr 2.66fr 4fr 2fr 1fr 1fr',
          'grid-template-columns':
            // eslint-disable-next-line max-len
            '1fr 1fr 2fr 4fr 2.66fr 5.33fr 5.33fr 4.33fr 2.83fr 3.5fr 3.5fr 2.83fr 4.33fr 5.33fr 5.33fr 2.66fr 4fr 2fr 1fr 1fr'
        });
      }
      return styleSet;
    },
    /**
     * Create a scrollbar
     * @param  {object} _  - all information from postCSS
     * @param  {string} width - param from mixin
     * @return {object} - adds scrollbar CSS to element
     * Usage:
     *  .detail-inner {
     *    @mixin scrollBar 10px; // width = 10px
     *    padding: 30px;
     *  }
     */
    scrollBar: function scrollbar(_, width) {
      return {
        '&::-webkit-scrollbar': {
          height: width,
          overflow: 'visible',
          width: width,
        },
        '&::-webkit-scrollbar-track': {
          'background-clip': 'padding-box',
          width: width,
          'border-width': '0 0 0 0px',
          'background-color': 'rgba(255, 255, 255, 1)',
          'box-shadow': 'inset 1px 0 0 rgba(0, 0, 0, 0.1)',
        },
        '&::-webkit-scrollbar-track:horizontal': {
          'border-width': '0px 0 0',
        },
        '&:hover::-webkit-scrollbar-track': {
          'box-shadow': 'inset 1px 0 0 rgba(0, 0, 0, 0.1)',
        },
        '&::-webkit-scrollbar-track:active': {
          'background-color': 'rgba(0, 0, 0, 0.035)',
          'box-shadow': 'inset 1px 0 0 rgba(0, 0, 0, 0.1)',
        },
        '&::-webkit-scrollbar-button:start:decrement': {
          display: 'block',
        },
        '&::-webkit-scrollbar-button:end:increment': {
          display: 'block',
        },
        '&::-webkit-scrollbar-button:vertical:start:increment': {
          display: 'none',
        },
        '&::-webkit-scrollbar-button:vertical:end:decrement': {
          display: 'none',
        },
        '&::-webkit-scrollbar-thumb': {
          'min-height': '28px',
          'padding-top': '100px',
          'background-clip': 'padding-box',
          'background-color': 'rgba(0, 0, 0, 0.2)',
          'box-shadow': 'inset 1px 1px 0 rgba(0, 0, 0, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.07)'
        },
        '&::-webkit-scrollbar-thumb:hover': {
          'background-color': 'rgba(0, 0, 0, .4)',
          'box-shadow': 'inset 1px 1px 1px rgba(0, 0, 0, 0.25)',
        },
        '&::-webkit-scrollbar-thumb:active': {
          'box-shadow': 'inset 1px 1px 3px rgba(0, 0, 0, 0.35)',
          'background-color': 'rgba(0, 0, 0, .5)',
        },
        '&::-webkit-scrollbar-thumb:vertical': {
          border: '0 solid transparent',
          'border-left': '0px solid transparent',
        },
        '&::-webkit-scrollbar-thumb:horizontal': {
          border: '0 solid transparent',
          'border-top': '0px solid transparent',
        },
        '&::-webkit-scrollbar-button': {
          height: 0,
          width: 0,
        }
      }
    },
    // https://github.com/moca-salter/monicasalter.com/blob/e20edbc082914e551c93d966c95d221f7e4599d4/themes/mcsalter/src/precss/mixins/_positioning.css#L41
    marginClearing() {
      /* margin clearing
      @define-mixin child-margin-clear {
        > *:first-child {
          margin-top: 0;
        }
        > *:last-child {
          margin-bottom: 0;
        }
      }

      @define-mixin child-margin-clear-first {
        > *:first-child {
          margin-top: 0;
        }
      }

      @define-mixin child-margin-clear-last {
        > *:last-child {
          margin-bottom: 0;
        }
      }
      */
    },
    animation(_, speed = '250ms', kind = 'all', easing = 'ease') {
      return {
        transition: `${kind} ${speed} ${easing}`
      }
    },
    noAnimation: {
      transition: 'none'
    },
    /* src https://www.joshwcomeau.com/snippets/html/scale-with-pseudoelements/ */
    scaleOnHover(_, scale = '1.1', background) {
      return {
        position: 'relative',
        '&:after': {
           background: background || 'inherit',
           content: '""',
           position: "absolute",
           top: "0",
           left: "0",
           right: "0",
           bottom: "0",
           zIndex: -1,
           transition: "transform 250ms"
        },
        '&:hover::after': {
          transform: `scale(${scale})`
        }
      }
    },
    /**
     * Colorscheme mixin
     * @param {*} _
     * @param {*} $bgColor
     * @param {*} $color
     * @usage:
     * @mixin colorScheme black, white;
     */
    colorScheme(_, $bgColor, $color) {
      const pseudo = {
        'background-color': $bgColor,
        color: $color
      }
      return {
        'background-color': $bgColor,
        'color': $color,
        '&::before': pseudo,
        '&::after': pseudo
      }
    },
    coverBackground: {
      'background-repeat': 'no-repeat',
      'background-size': 'cover',
      'background-position': 'center',
    },
    /* Inline border mixins */
    borderInsetCustom: borderInset,
    borderInsetTop(_, top, color) {
      return borderInset(_, top, 0, 0, 0, color)
    },
    borderInsetBottom(_, bottom, color) {
      return borderInset(_, 0, 0, bottom, 0, color)
    },
    borderInsetRight(_, right, color) {
      return borderInset(_, 0, right, 0, 0, color)
    },
    borderInsetLeft(_, left, color) {
      return borderInset(_, 0, 0, 0, left, color)
    },
    borderInsetX(_, width, color) {
      return borderInset(_, 0, width, 0, width, color)
    },
    borderInsetY(_, height, color) {
      return borderInset(_, height, 0, height, 0, color)
    },
    borderInset(_, width = 1, color) {
      return borderInset(_, width, width, width, width, color)
    }
  }
}

function borderInset(_, top, right, bottom, left, _color) {

  const color = ensureColor(_color)
  const gradient = `${color} 0%, ${color} 50%, ${color} 100%`
  return {
    'background-image': `
      linear-gradient(180deg, ${gradient}),
      linear-gradient(90deg,  ${gradient}),
      linear-gradient(0deg,   ${gradient}),
      linear-gradient(90deg,  ${gradient})`,
    'background-size': `
      100% ${ensurePx(top)},
      ${ensurePx(right)} 100%,
      100% ${ensurePx(bottom)},
      ${ensurePx(left)} 100%`,
    'background-repeat': 'no-repeat',
    'background-position': 'top, right top, bottom, left top'
  }
}


/* UTils */

function atLeastOne(unit) {
  const value = Number(unit)
  if (!isNaN(value) && value < 1) {
    return 1
  }
  return unit
}

function formatOpacity(opacity) {
  return (opacity > 1) ? opacity / 100 : opacity
}

function ensurePx(unit) {
  const value = Number(unit)
  if (!isNaN(value)) {
    return String(unit) + 'px'
  }
  if (unit.indexOf('px') === -1) {
    return unit + 'px'
  }
  return unit
}

// Ensure colors are valid
function ensureColor(color, defaultColor) {
  if (validateColor(color)) {
    return color
  }
  const hexifyColor = `#${color}`
  if (validateColor(hexifyColor)) {
    return hexifyColor
  }
  if (defaultColor) {
    return defaultColor
  }
  if (GLOBAL_TOKENS && GLOBAL_TOKENS[color]) {
    return GLOBAL_TOKENS[color]
  }
  // Else throw error
  throw new Error(`Invalid color "${color}" passed`)
}
/*
// Visibility
@define-mixin hide {
  opacity: 0;
  visibility: hidden;
}

@define-mixin show {
  opacity: 1;
  visibility: visible;
}

// Layout
@define-mixin fullscreen {
  min-height: 100vh;
  margin-left: 0;
  margin-right: 0;
}

// Layout
@define-mixin center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
@define-mixin centerVertical {
  top: 50%;
  transform: translateY(-50%);
}
@define-mixin centerHorizontal {
  left: 50%;
  transform: translateX(-50%);
}
@define-mixin centerText {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

@define-mixin box $width, $height: $width {
  width: $(width);
  height: $(height);
}

//  Colors Toolkit
@define-mixin colorScheme $bgColor, $color {
  background-color: $bgColor;
  color: $color;

  &::before,
  &::after {
    background-color: $bgColor;
    color: $color;
  }
}

// Supports Toolkit
// usage https://github.com/wwwsolutions/mendas-dev-portfolio-refactor/blob/28a687e7becde775b187b9f0d0d5be1a328e8fbc/src/styles/base/_layout.css#L2
@define-mixin supportsGrid {
  @supports (grid-area: auto) {
    @mixin-content;
  }
}
@define-mixin supportsBgClip {
  @supports (-webkit-background-clip: text) {
    @mixin-content;
  }
}

// List spacing
@define-mixin listSpacing {
  padding-left: var(--space-700);
  margin-bottom: var(--space-600);

  & ol, & ul {
    margin-bottom: 0;
  }

  & > *:first-child {
    margin-top: 0;
  }
  & > *:last-child {
    margin-bottom: 0;
  }
}

@define-mixin element-ul {
  @mixin listSpacing;
  list-style: disc;

}

@define-mixin element-ol {
  @mixin listSpacing;
  list-style: number;
}

// animation

@define-mixin fadeIn $duration, $timing {
  transition: opacity $duration $timing, visibility 0s $timing;
}
@define-mixin fadeOut $duration, $timing {
  transition: opacity $duration $timing, visibility 0s $timing $duration;
}

@define-mixin offset-border {
  &:before, &:after {
    content: "";
    display: block;
    width: 80px;
    border-top: 1px solid #ddd;
    margin: 20px auto 20px auto;
  }
}
// https://github.com/c-is/suade/blob/ec09b48841ef877cabdb7290f0911c1d73d7642d/src/css/mixins/_position.css
*/

// Content sizes
// https://github.com/feelfoundation/gcc-desktop/blob/ccdb93abca4f65fe5f8d5d25285cffee2ff17035/src/app/mixins.css#L1


/*
https://github.com/Datawheel/authority-health/blob/ef35fb353220b058d280eed67a0638a7ac472459/app/css/mixins.css#L143
*/

/*
@define-mixin contentNormal
https://github.com/feelfoundation/feel-desktop/blob/08db05ff0e96ee94ba126c1d09ea8ccc22dad8ca/src/app/mixins.css#L17
*/

/*
contrain images? https://github.com/FlynnLeeGit/sfddmobile/blob/b0b8535446bc9778380c793c4739ee1b34906973/src/style/mixins.css#L14
@define-mixin px2w $px {
  width: calc( $(px)/ 750 * 100vw);
}

@define-mixin px2h $px {
  height: calc( $(px)/ 1334 * 100vh);
}
*/

/*
@define-mixin add-custom-font $fontName, $pathToFont, $fileName {
    @font-face {
        font-family: $fontName;
        src: url("$(pathToFont)/$(fileName).eot");
        src: url("$(pathToFont)$(fileName).eot?#iefix") format('embedded-opentype'),
        url("$(pathToFont)/$(fileName).ttf") format('truetype'),
        url("$(pathToFont)/$(fileName).woff") format('woff'),
        url("$(pathToFont)/$(fileName).svg") format('svg');

        @mixin-content;
  	}
}

*/


/*

https://github.com/abyMosa/elmboiler/blob/a1da27214d7b72ad9846cb653d1b8fc29c1326b2/src/assets/css/mixins/grid.css#L13

@define-mixin make-container {
    margin-right: auto;
    margin-left: auto;
    // padding-right: 15px;
    padding-left:  15px;
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    width: 100%;
}

@define-mixin make-layout {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
}

@define-mixin make-col-ready {
    position: relative;
    width: 100%;
    min-height: 1px;
    // flex-direction: column;
}

@define-mixin make-col $size{
    flex-basis: calc( ($size / 12) * 100% );
    max-width: calc( ($size / 12) * 100% );
}

@define-mixin make-col-with-gutter $size, $gutter{
    flex-basis: calc( ( ($size / 12) * 100% ) - $(gutter)*5px );
    max-width: calc( ( ($size / 12) * 100% ) - $(gutter)*5px );
}
@define-mixin make-col-with-gutter-flex-start $size, $gutter{
    max-width: calc( ( ($size / 12) * 100% ) );
    flex-basis: calc( ( ($size / 12) * 100% ) );
    padding-right: calc( $(gutter)*5px /2 );
    padding-left: calc( $(gutter)*5px /2 );
}

@define-mixin make-col-offset $size{
    margin-left: calc( ($size / 12) * 100% );
}
*/
