import Page from 'classes/page'

export default class Home extends Page {
  constructor () {
    super({
      element: '.home',
      elements: {
        navigation: document.querySelector('.navigation'),
        link: '.home__link'
      },
      id: 'home'
    })
  }

  create () {
    super.create()

    this.elements.link.addEventListener('click', _ => console.log('Oh, you clicked me!'))
  }
}
