require('dotenv').config()

const bodyParser = require('body-parser')
const errorHandler = require('errorhandler')
const express = require('express')
const logger = require('morgan')
const methodOverride = require('method-override')

const app = express()
const path = require('path')
const port = 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(errorHandler())
app.use(logger('dev'))
app.use(methodOverride())

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

// Initialize the prismic.io api
const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    acessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  })
}

// Link Resolver
const handellinkResolver = (doc) => {
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'about') {
    return '/about'
  }
  /* // Define the url depending on the document type
  if (doc.type === 'page') {
    return '/page/' + doc.uid;
  } else if (doc.type === 'blog_post') {
    return '/blog/' + doc.uid;
  } */

  // Default to homepage
  return '/'
}

// Middleware to inject prismic context
app.use((req, res, next) => {
  /* res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handellinkResolver
  } */

  res.locals.Link = handellinkResolver

  res.locals.Numbers = (index) => {
    return index === 0 ? 'One' : index === 1 ? 'Two' : index === 2 ? 'Three' : index === 3 ? 'Four' : ''
  }

  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM

  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const home = await api.getSingle('home')
  const meta = await api.getSingle('meta')
  const preloader = await api.getSingle('preloader')

  const { results: collections } = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })

  res.render('pages/home', {
    collections,
    home,
    meta,
    preloader
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const about = await api.getSingle('about')
  const meta = await api.getSingle('meta')
  const preloader = await api.getSingle('preloader')

  res.render('pages/about', {
    about,
    meta,
    preloader
  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  const meta = await api.getSingle('meta')
  const home = await api.getSingle('home')
  const preloader = await api.getSingle('preloader')

  const { results: collections } = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })

  res.render('pages/collections', {
    collections,
    home,
    meta,
    preloader
  })
})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const meta = await api.getSingle('meta')
  const preloader = await api.getSingle('preloader')

  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  })

  res.render('pages/detail', {
    meta,
    preloader,
    product
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
