import { 
  ElButton, 
  ElInput, 
  ElInputNumber, 
  ElTabPane, 
  ElTabs, 
  ElOption, 
  ElSelect, 
  ElTag,
  ElDatePicker
} from 'element-plus'

export default (app) => {
  app.use(ElButton)
  app.use(ElInput)
  app.use(ElInputNumber)
  app.use(ElTabs)
  app.use(ElTabPane)
  app.use(ElSelect)
  app.use(ElOption)
  app.use(ElTag)
  app.use(ElDatePicker)
}
