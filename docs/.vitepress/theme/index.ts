import DefaultTheme from 'vitepress/theme'
import ReleasesPage from './ReleasesPage.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ReleasesPage', ReleasesPage)
  },
}
