/**
 * Adjusts top-level items with a level of 2 to 1, and recursively shifts other levels accordingly.
 * Mutates the items array in place.
 * @param {Array} items - The array of items to adjust.
 */
function normalizeLevels(items, forcedMinLevel = 0) {
  // Get lowest level of all items
  let minLevel = (forcedMinLevel) ? forcedMinLevel : items.reduce((min, item) => Math.min(min, item.level), Infinity)

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // Shift top-level items with a level of 2 to level 1
    if (item.level > minLevel) {
      const shift = minLevel
      // add original level to the item
      item.originalLevel = item.level
      item.level = shift


      // Adjust levels of children recursively
      if (item.children) {
        adjustLevels(item.children, shift + 1)
      }
    }
  }
  return items
}

/**
 * Recursively adjusts the level of each item and its children.
 *
 * @param {Array} items - The array of items to adjust.
 * @param {number} shift - The amount to shift each level by.
 */
function adjustLevels(items, shift) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    // add original level to the item
    item.originalLevel = item.level
    item.level = shift

    // If the item has children, adjust their levels recursively
    if (item.children) {
      adjustLevels(item.children, shift + 1)
    }
  }
}

module.exports = {
  normalizeLevels,
}
