/* eslint quote-props: 0 */

import React from 'react'
import classNames from 'clsx'
import PropTypes from 'prop-types'
import css from './Flex.module.css'

const Flex = ({
  style = {},
  width,
  height,
  align,
  grow,
  auto,
  isColumn,
  isFullScreen,
  isFullWidth,
  debug,
  ...props
}) => {
  const [x, y] = getAlignment(align)
  const X = x || defaultAlignment[0]
  const Y = y || defaultAlignment[1]
  let WIDTH = width || style.width
  const HEIGHT = height || style.height
  const isRow = !isColumn

  const verticalClasses = (isColumn) ? columnVertical[Y] : rowVertical[Y]
  const horizontalClasses = (isColumn) ? columnHorizontal[X] : rowHorizontal[X]
  if (!verticalClasses) {
    throw new Error(`unknown align value "${Y}" passed into Flex. Must be one of ${Object.keys(columnVertical)}`)
  }
  if (!horizontalClasses) {
    throw new Error(`unknown align value "${X}" passed into Flex. Must be one of ${Object.keys(columnHorizontal)}`)
  }

  let inlineStyles = {} // eslint-disable-line prefer-const

  if (WIDTH) {
    // Handle Fraction
    if (typeof WIDTH === 'string' && WIDTH.indexOf('/') > -1) {
      WIDTH = fractionStringToNumber(WIDTH)
      console.log('fixed with', WIDTH)
    }
    // Set width
    inlineStyles.width = WIDTH
    if (isColumn) {
      // set flexBasis to auto to stop automatic grow of flex
      inlineStyles.maxWidth = WIDTH
    } else {
      if (typeof props.width === 'number') {
        inlineStyles.flexGrow = props.width
      }
    }
  }

  let heightClass
  if (HEIGHT) {
    // Set height
    inlineStyles.height = HEIGHT
    // set flexBasis to auto to stop automatic grow of flex
    if (isColumn) {
      inlineStyles.minWidth = 0
      heightClass = css.columnHeight
    } else {
      // row do this
      heightClass = css.rowHeight
    }
  }

  /* add outlines for flexbox debugging */
  if (debug) {
    inlineStyles.background = '#' + Math.floor(Math.random() * 16777215).toString(16)
    inlineStyles.outline = '3px solid #F2BE24'
  }

  // Use flex grow
  if (grow) {
    inlineStyles.flexGrow = grow
  }

  const combinedStyles = {
    ...inlineStyles,
    ...style,
  }

  const stretchProps = ['full', 'fill', 'stretch']
  const shouldGrow = !style.height && stretchProps.includes(y)

  const allClasses = classNames(
    props.className,
    css.flexDefault,
    {
      [`${css.column}`]: isColumn,
      [`${css.flexAuto}`]: auto,
      // Set 'initial basis'
      [`${css.initialBasis}`]: isColumn && !style.flexBasis,
      [`${css.flexGrow}`]: shouldGrow,
      [`${css.noGrow}`]: !isColumn && !shouldGrow,
      [`${css.fullScreen}`]: isFullScreen,
      // Make rows fullWidth by default if no width or auto supplied
      [`${css.fullWidth}`]: ((isRow && !WIDTH && !auto) || isFullWidth)
    },
    heightClass,
    verticalClasses,
    horizontalClasses,
  )

  return (
    <div {...props} className={allClasses} style={combinedStyles}>
      {props.children}
    </div>
  )
}

Flex.displayName = 'Flex'

Flex.defaultProps = {
  isColumn: false,
  debug: false,
}

Flex.propTypes = {
  /** propName description */
  children: PropTypes.any,
  /** classes applied to Flex */
  className: PropTypes.string,
  /** style applied to Flex */
  style: PropTypes.object,
  /**
   *  Alignment configuration:
   *  Can be a string like 'left top'
   *  an array like ['left', 'top']
   *  or object like { horizontal: 'left', vertical: 'top'}
   */
  align: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object
  ]),
  /** Make flex item 100vh viewport height */
  isFullScreen: PropTypes.bool,
  /** Make flex direction column */
  isColumn: PropTypes.bool,
  /** Automatically collapse contents so they only take up their childrens size */
  auto: PropTypes.bool,

  grow: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  /** If true, flexbox debug mode will activate */
  debug: PropTypes.bool,
}

function fractionStringToNumber(s) {
  const num = s.split('/').map(s => Number(s)).reduce((a, b) => a / b)
  return `${Math.round((num * 100)).toString()}%`
}

const defaultAlignment = ['default', 'default']

const rowVertical = {
  // TOP
  'top': css.rowTop,
  'flex-start': css.rowTop,
  // Bottom
  'bottom': css.rowBottom,
  'flex-end': css.rowBottom,
  // Middle
  'middle': css.rowMiddle,
  'center': css.rowMiddle,
  // Stretch
  'full': css.rowFill,
  'fill': css.rowFill,
  'stretch': css.rowFill,
  // Around
  'space-around': css.rowAround,
  // Between
  'space-between': css.rowBetween,
  // Default
  'default': css.rowDefault
}

const columnVertical = {
  // TOP
  'top': css.colTop,
  'flex-start': css.colTop,
  // Bottom
  'bottom': css.colBottom,
  'flex-end': css.colBottom,
  // Middle
  'middle': css.colMiddle,
  'center': css.colMiddle,
  // Stretch
  'full': css.colFill,
  'fill': css.colFill,
  'stretch': css.colFill,
  // Around
  'space-around': css.colAround,
  // Between
  'space-between': css.colBetween,
  // Default
  'default': css.colDefault
}

const rowHorizontal = {
  // Left
  'left': css.rowLeft,
  'flex-start': css.rowLeft,
  // Right
  'right': css.rowRight,
  'flex-end': css.rowRight,
  // Middle
  'middle': css.rowHorizontalMiddle,
  'center': css.rowHorizontalMiddle,
  // Space Around
  'space-around': css.rowHorizontalSpaceAround,
  // Space Between
  'space-between': css.rowHorizontalSpaceBetween,
  // Default
  'default': css.rowHorizontalDefault
}

const columnHorizontal = {
  // Left
  'left': css.colLeft,
  'flex-start': css.colLeft,
  // Right
  'right': css.colRight,
  'flex-end': css.colRight,
  // Middle
  'middle': css.colHorizontalMiddle,
  'center': css.colHorizontalMiddle,
  // Space Around
  'space-around': css.colHorizontalSpaceAround,
  // Space Between
  'space-between': css.colHorizontalSpaceBetween,
  // Default
  'default': css.colHorizontalDefault
}

function getAlignment(align) {
  if (!align) {
    return defaultAlignment
  }
  if (Array.isArray(align) && align[0] && align[1]) {
    return align
  } else if (typeof align === 'object' && align.horizontal && align.vertical) {
    return [align.horizontal, align.vertical]
  } else if (typeof align === 'string') {
    const alignment = align.split(' ')
    return [alignment[0], alignment[1]]
  }
  return defaultAlignment
}

export default Flex
