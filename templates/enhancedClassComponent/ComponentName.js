import React, { Component, PropTypes } from 'react'
import Div from '../../primatives/Div'
import makeComponent from 'utils/generate-element'
import classNames from 'utils/classNames'
import styles from '{{name}}.css'
import config from '{{name}}.config'

const name = '{{name}}'
class {{name}} extends Component {

  static propTypes = {
    className: PropTypes.string,
  };

  constructor (props, context) {
    super(props, context)
  }

  render () {
    const { className, ...others} = this.props
    const localizedCSS = styles[`${name}`] || styles[`${name.toLowerCase()}`]

    const classes = classNames(
      name, /* Component name */
      localizedCSS, /* Localized className */
      className /* User specified classNames */
    )

    const props = {
      ...others,
      className: classes,
      'data-react-component': name
    }

    return makeComponent(Div, props, config)
  }
}


export default {{name}}
