import React, { propTypes } from 'react'
import Div from 'primatives/Div'
import makeComponent from 'utils/generate-element'
import classNames from 'utils/classNames'
import styles from '{{name}}.css'
import config from '{{name}}.config'

const name = '{{name}}'
const {{name}} = ({children, className, ...other}) => {
  const localizedCSS = styles[`${name}`] || styles[`${name.toLowerCase()}`]
  const classes = classNames(
    name, /* Component name */
    localizedCSS, /* Localized className */
    className /* User specified classNames */
  )
  /* build props */
  const props = {
    ...other,
    children,
    className: classes,
    'data-react-component': name
  }
  return makeComponent(Div, props, config)
}

{{name}}.propTypes = propTypes

export default {{name}}
