# Style Guard for CSS modules

Use proxies in dev to guard against potentially missing styles for CSS modules

Inspired from this [gist](https://gist.github.com/DavidWells/04e632a55b11c0ca53e9a8f41524d158)

Example:

```css
/* styles.css */
.thing {
  color: blue;
}
```

React component with `styles.doesNotExist` reference to undefined value.

```js
import React from 'react'
import styleGuard from 'style-guard'
import css from './styles.css'
// css is CSS module object

const styles = styleGuard(css)
// styles is now proxied object in dev to throw if unknown properties are called

export default function NavBar(props) {
  const { auth, handleLogout } = props
  return (
    <div className={styles.thing}>
      <span className={styles.doesNotExist}>
        xyz
      </span>
    </div>
  )
}

/*
  styles.doesNotExist will cause a dev error because its missing or has been removed!
*/
```

Resulting in an error like so:

![image](https://user-images.githubusercontent.com/532272/72671761-fb152000-3a03-11ea-8546-98b33e297523.png)

This will help prevent style regressions in dev mode