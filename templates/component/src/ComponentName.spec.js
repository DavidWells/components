import {{ComponentName}} from './{{ComponentName}}'
import test from 'ava'
import sinon from 'sinon'
import React from 'react'
import ReactDOM from 'react-dom'
import {renderToStaticMarkup} from 'react-dom/server'
import TestUtils, { Simulate } from 'react-addons-test-utils'
import { describeWithDOM, mount, shallow, spyLifecycle, render } from 'enzyme'
import { sharedComponentTests } from '../../utils/testing'

/* shared tests across components */
sharedComponentTests({{ComponentName}})

test('renders as div', (t) => {
  const {{ComponentNameLowerCase}} = shallow(<{{ComponentName}} />)
  t.is({{ComponentNameLowerCase}}.type(), 'div')
})

test('should render a children when passed to it', (t) => {
  const card = render(
    <{{ComponentName}}>
      Children text
    </{{ComponentName}}>
  )
  t.true(card.find('.icon-star').length === 1)
})

test('should render a text children when passed to it', (t) => {
  const wrapper = render(
    <{{ComponentName}}>text</{{ComponentName}}>
  )
  t.true(wrapper.text().includes('text'))
})
