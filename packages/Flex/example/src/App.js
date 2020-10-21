import React from 'react'
import '@davidwells/components-flex/dist/index.css'
import { Flex, Column, Row } from '@davidwells/components-flex'

export default function App() {
  return (
    <Column isFullScreen>
      <Row auto>
        <div>one</div>
        <div>two</div>
        <div>three</div>
      </Row>
      <Column auto>
        <span>hi</span>
        <span>hi</span>
        <span>hi</span>
        <Row>
          <span>hi</span>
          <span>hi</span>
          <span>hi</span>
        </Row>
      </Column>
      <YourApp />
      <LayoutTwo />
    </Column>
  )
}

const rowStyle = { border: '1px solid #33CC7A', height: 150, textAlign: 'left' }
const columnStyle = { border: '3px solid #48C1ED' }
class YourApp extends React.Component {
  render () {
    return (
      <Row style={rowStyle} align='center center' debug>
        <Column style={columnStyle}>
          <span>Column Component</span>
          <span>Columns gets stacked</span>
          <span>Rows are used for Horizontal</span>
        </Column>

        <Column style={columnStyle}>
          <span>Column Component</span>
          <span>This is stacked</span>
          <span>and next to other column</span>
        </Column>
      </Row>
    )
  }
}

const rowStyleTwo = {border: '3px solid #33CC7A', height: 450, textAlign: 'left'}
const navStyle = {background: '#E8E9EA'}
const navLinkStyle = {padding: 10}
const columnStyleTwo = {border: '3px solid #48C1ED', padding: 10}
class LayoutTwo extends React.Component {
  render () {
    return (
      <Column isFullWidth>
        <Row align='left' style={navStyle}>
          <span style={navLinkStyle}>Nav item 1</span>
          <span style={navLinkStyle}>Nav item 2</span>
          <span style={navLinkStyle}>Nav item 3</span>
          <Column style={navLinkStyle} align='right'>
            Right Nav
          </Column>
        </Row>

        <Row style={rowStyleTwo} align='left stretch' className='testing'>
          <Column width='1/4' style={columnStyle} className='column'>
            <h6>Left Column</h6>
          </Column>

          <Column width='55%' align='center top' style={columnStyleTwo} className='column'>
            <h6>Middle Column</h6>
          </Column>

          <Column align='left top' width='25%' style={columnStyleTwo} className='column'>
            <h6>Left Column</h6>
          </Column>
        </Row>
      </Column>
   )
  }
}
