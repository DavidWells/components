import React from 'react'
import AutoForm from './AutoForm'

function fixScroll() {
  // http://bit.ly/2gQ6jFJ
  this.scrollIntoView(false)
}

function grabNodes(node) {
  return node.querySelectorAll('input,select,textarea')
}

export default class Form extends React.Component {
  componentDidMount() {
    const inputNodes = grabNodes(node)
    for (var i = 0; i < inputNodes.length; i++) {
      inputNodes[i].addEventListener('invalid', fixScroll)
    }
  }

  componentWillUnmount() {
    const inputNodes = grabNodes(node)
    for (var i = 0; i < inputNodes.length; i++) {
      inputNodes[i].removeEventListener('invalid', fixScroll)
    }
  }

  handleSubmit = (event, data) => {
    const { onSubmit } = this.props
    event.preventDefault()
    if (onSubmit) {
      onSubmit(event, data)
    }
  }

  render() {
    const { id, onChange, trimOnSubmit, children, name, ...rest } = this.props
    return (
      <div ref={(node) => { this.node = node }}>
        <AutoForm
          name={name}
          id={id}
          trimOnSubmit={trimOnSubmit}
          onChange={onChange}
          onSubmit={this.handleSubmit}
          {...rest}
        >
          {children}
        </AutoForm>
      </div>
    )
  }
}
