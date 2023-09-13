import React from 'react'
import { useButton } from '@react-aria/button'
import { FocusScope } from '@react-aria/focus'
import { useFocus } from '@react-aria/interactions'
import { useListBox, useOption } from '@react-aria/listbox'
import { DismissButton, useOverlay } from '@react-aria/overlays'
import { HiddenSelect, useSelect } from '@react-aria/select'
import { mergeProps } from '@react-aria/utils'
import { Item } from '@react-stately/collections'
import { useSelectState } from '@react-stately/select'
import classnames from 'classnames/bind'
import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import { Labeled } from './Labeled'
import styles from './New.module.css'

const cx = classnames.bind(styles)
// https://raw.githubusercontent.com/envoy/polarwind/27ee10e87c6ea0dea12f5fb673d213bdef99bc92/src/components/Select/Select.stories.mdx
// https://5fc91dfd5650050021374090-sgmzyaslay.chromatic.com/?path=/story/components-forms-select--example
/* eslint-disable react/prop-types */
function CustomSelect({
  children,
  disabled,
  error,
  helpText,
  label,
  labelHidden,
  required,
  success,
  value,
  ...otherProps
}) {
  const props = {
    ...otherProps,
    children,
    defaultSelectedKey: value,
    isDisabled: disabled,
    isRequired: required,
    label,
  }
  const state = useSelectState(props)
  const ref = useRef()
  const { menuProps, triggerProps, valueProps } = useSelect(props, state, ref)

  const { buttonProps } = useButton(triggerProps, ref)
  // workaround for bug https://twitter.com/devongovett/status/1298033200644513793?s=20
  buttonProps.onKeyDownCapture = triggerProps.onKeyDownCapture

  return (
    <Labeled
      className={styles.Label}
      error={error}
      helpText={helpText}
      hidden={labelHidden}
      label={label}
      required={required}
      success={success}
    >
      <HiddenSelect
        isDisabled={disabled}
        label={label}
        state={state}
        triggerRef={ref}
      />
      <button {...buttonProps} className="form-select" ref={ref}>
        <span {...valueProps}>{state.selectedItem?.rendered}</span>
      </button>
      {state.isOpen && <ListBoxPopup {...menuProps} state={state} />}
    </Labeled>
  )
}

function ListBoxPopup({ state, ...otherProps }) {
  const ref = useRef()
  const { listBoxProps } = useListBox(
    {
      autoFocus: state.focusStrategy,
    },
    state,
    ref
  )

  // overlay
  const overlayRef = useRef()
  const { overlayProps } = useOverlay({
    isDismissable: true,
    isOpen: state.isOpen,
    onClose: () => state.close(),
    shouldCloseOnBlur: true,
  })

  return (
    <FocusScope restoreFocus>
      <div {...overlayProps} ref={overlayRef}>
        <DismissButton onDismiss={() => state.close()} />
        <ul {...mergeProps(listBoxProps, otherProps)} ref={ref}>
          {[...state.collection].map((item) => {
            return <Option item={item} key={item.key} state={state} />
          })}
        </ul>
        <DismissButton onDismiss={() => state.close()} />
      </div>
    </FocusScope>
  )
}

function Option({ item, state }) {
  const ref = useRef()
  const isDisabled = state.disabledKeys.has(item.key)
  const isSelected = state.selectionManager.isSelected(item.key)
  const { optionProps } = useOption(
    {
      isDisabled,
      isSelected,
      key: item.key,
      shouldFocusOnHover: true,
      shouldSelectOnPressUp: true,
    },
    state,
    ref
  )
  const [, setFocused] = useState(false)
  const { focusProps } = useFocus({ onFocusChange: setFocused })

  return (
    <li {...mergeProps(optionProps, focusProps)} ref={ref}>
      {item.rendered}
    </li>
  )
}
/* eslint-enable */

function renderOption(option) {
  const { disabled, label, options, title, value } = option

  if (label && typeof value === 'string') {
    return (
      <option disabled={disabled} key={value} value={value}>
        {label}
      </option>
    )
  }

  if (title && options) {
    return (
      <optgroup key={title} label={title}>
        {options.map(renderOption)}
      </optgroup>
    )
  }

  return (
    <option key={option} value={option}>
      {option}
    </option>
  )
}

/**
 * Select lets users choose one option from an options menu. Consider select when you have
 * 4 or more options, to avoid cluttering the interface.
 */
const Select = ({
  disabled,
  error,
  helpText,
  label,
  labelHidden,
  onBlur,
  onChange,
  onFocus,
  options,
  required,
  success,
  value,
}) => {
  const handleFocus = () => {
    onFocus && onFocus()
  }
  const handleBlur = () => {
    onBlur && onBlur()
  }
  const handleChange = (event) => {
    onChange && onChange(event.currentTarget.value)
  }

  const className = cx({
    Select: true,
    disabled,
    error,
    'form-select': true,
  })

  const inputProps = {
    className,
    disabled,
    onBlur: handleBlur,
    onChange: handleChange,
    onFocus: handleFocus,
    value,
  }

  const ref = useRef()
  const props = { children: buildOptionsChildren(options) }
  const state = useSelectState(props)
  const { menuProps, triggerProps, valueProps } = useSelect(props, state, ref)
  const { buttonProps } = useButton(triggerProps, ref)
  buttonProps.onKeyDownCapture = triggerProps.onKeyDownCapture

  const activator = (
    <button {...buttonProps} className={className} ref={ref}>
      <span {...valueProps}>
        {state.selectedItem ? state.selectedItem.rendered : 'Select an option'}
      </span>
    </button>
  )

  const optionsMarkup = state.isOpen && (
    <OptionList {...menuProps} state={state} />
  )

  return (
    <Labeled
      className={styles.Label}
      error={error}
      helpText={helpText}
      hidden={labelHidden}
      label={label}
      required={required}
      success={success}
    >
      <HiddenSelect
        isDisabled={disabled}
        label={label}
        state={state}
        triggerRef={ref}
      />
      {activator}
      {optionsMarkup}
      <select {...inputProps}>
        {options.map(renderOption)}
      </select>
    </Labeled>
  )
}

function buildOptionsChildren(options) {
  return options.map((option) => (
    <Item key={option.value}>{option.label}</Item>
  ))
}

/* eslint-disable react/prop-types */
function OptionList({ state, ...menuProps }) {
  const ref = useRef()
  const { listBoxProps } = useListBox(
    { autoFocus: state.focusStrategy },
    state,
    ref
  )

  return (
    <ul {...mergeProps(listBoxProps, menuProps)} ref={ref}>
      {[...state.collection].map((item) => (
        <Option item={item} key={item.key} state={state} />
      ))}
    </ul>
  )
}
/* eslint-enable */

Select.propTypes = {
  /** Disable the input */
  disabled: PropTypes.bool,
  /** Error to display beneath the label */
  error: PropTypes.string,
  /** Additional hint text to display */
  helpText: PropTypes.node,
  /** Label for the input */
  label: PropTypes.string.isRequired,
  /** Visually hide the label */
  labelHidden: PropTypes.bool,
  /** Callback when focus is removed */
  onBlur: PropTypes.func,
  /** Callback when value is changed */
  onChange: PropTypes.func,
  /** Callback when input is focused */
  onFocus: PropTypes.func,
  /** List of options or option groups to choose from */
  options: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(
      PropTypes.shape({
        disabled: PropTypes.bool,
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })
    ),
    PropTypes.arrayOf(
      PropTypes.shape({
        options: PropTypes.oneOfType([
          PropTypes.arrayOf(PropTypes.string),
          PropTypes.arrayOf(
            PropTypes.shape({
              disabled: PropTypes.bool,
              label: PropTypes.string.isRequired,
              value: PropTypes.string.isRequired,
            })
          ),
        ]).isRequired,
        title: PropTypes.string.isRequired,
      })
    ),
  ]),
  /** Mark the field as required */
  required: PropTypes.bool,
  /** Success message to display beneath the label */
  success: PropTypes.string,
  /** Initial value for the input */
  value: PropTypes.string,
}

export { Select, CustomSelect, Item }
