# Reusable PostCSS config

- **variables** - Return static single property value
- **functions** - Return dynamic single property values
- **mixins** - Return multiple props/values and can be selectors as well

## CSS nesting

```css
.foo {
  color: red;
  @nest & > .bar {
    color: blue;
  }
}
/* equivalent to
   .foo { color: red; }
   .foo > .bar { color: blue; }
 */

.foo {
  color: red;
  @nest .parent & {
    color: blue;
  }
}
/* equivalent to
   .foo { color: red; }
   .parent .foo { color: blue; }
 */

.foo {
  color: red;
  @nest :not(&) {
    color: blue;
  }
}
/* equivalent to
  .foo { color: red; }
  :not(.foo) { color: blue; }
*/
```
