const path = require('path')
const fs = require('fs')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { findLinks, findRefLinks } = require('./find-links')

const FILE_WITH_LINKS = path.join(__dirname, '../fixtures/file-with-links-two.md')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

test('find links', async () => {
  const links = findLinks(read(FILE_WITH_LINKS))
  //*
  console.log('links', links)
  /** */

  /* Has reference links */
  assert.equal(links.refs, [
    { id: 'whatever', url: 'https://github.com/cool', title: 'nice' },
    {
      id: 'indented',
      url: 'https://github.com/indented',
      title: 'indented ref link'
    },
    {
      id: 'github',
      url: 'https://github.com/davidwells',
      title: 'Github Profile'
    }
  ])

  /* Has links */
  assert.equal(links.links, [
    'https://funky-frontmatter.com',
    'https://www.front.com/blog/open-beta-changes',
    'https://youtu.be/A1bL4pHuivU',
    'https://foooooooooooo.com',
    'https://www.youtube.com/embed/KX7tj3giizI',
    'https://app.netlify.com/start/deploy',
    'https://www.yoursite.com/pricing?utm_source=active%20users&utm_medium=email&utm_campaign=feature%20launch&utm_content=bottom%20cta%20button',
    'https://ABC.com/sign-up',
    'http://jobs.ABC.net',
    '/foobar',
    'https://github.com/cool',
    'https://github.com/indented',
    'https://github.com/davidwells'
  ])

  /* Has image links */
  assert.equal(links.images, [
    '/assets/images/lol-frontmatter.jpg',
    '/assets/images/lol.jpg',
    'assets/images/san-juan-mountains.jpg',
    'https://res.cloudinary.com/ABC/image/upload/f_auto,q_auto/c_fill,w_1200/v1668114635/what-you-can-build_p8uape.png',
    'https://avatars2.githubusercontent.com/u/532272?v=3&s=400',
    'https://frontmatter.com/img/deploy/button.svg',
    'https://www.netlify.com/img/deploy/button.svg',
    'https://fooo.com/img/deploy/button.svg',
    '/img/in-nested-frontmatter/button.svg',
    '/img/deploy/button.svg',
    'img/deploy/button.svg',
    '../img/deploy/button.svg',
    'https://dope-frontmatter.com/img/deploy/button.svg'
  ])
})

test('find ref links', async () => {
  const refLinks = findRefLinks(read(FILE_WITH_LINKS))
  /*
  console.log('refLinks', refLinks)
  /** */

  assert.equal(refLinks, [
    { id: 'whatever', url: 'https://github.com/cool', title: 'nice' },
    {
      id: 'indented',
      url: 'https://github.com/indented',
      title: 'indented ref link'
    },
    {
      id: 'github',
      url: 'https://github.com/davidwells',
      title: 'Github Profile'
    }
  ])
})

test.run()
