import React, { PropTypes } from 'react'
import classNames from 'clsx'
import styles from './{{ComponentName}}.module.css'

const propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
}

const {{ComponentName}} = ({children, className, ...other}) => {
  const classes = classNames(
    {{ComponentName}}, /* component name */
    styles.{{ComponentName}}, /* localized styles */
    className /* user specified classNames */
    // propBasedClasses /* prop based classnames */
  )

  return (
    <span {...other} className={classes}>
      {children}
    </span>
  )
}

{{ComponentName}}.propTypes = propTypes

export default {{ComponentName}}
