import { 
  ElButton, 
  ElInput, 
  ElInputNumber, 
  ElTabPane, 
  ElTabs, 
  ElOption, 
  ElSelect, 
  ElTag,
  ElDatePicker,
  ElSpace,
  ElMenu,
  ElMenuItem,
  ElSubmenu,
  ElTableColumn,
  ElTable,
  ElLoading,
  ElPagination,
  ElDescriptions,
  ElDescriptionsItem,
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
  app.use(ElSpace)
  app.use(ElMenu)
  app.use(ElMenuItem)
  app.use(ElSubmenu)
  app.use(ElTable)
  app.use(ElTableColumn)
  app.use(ElLoading)
  app.use(ElPagination)
  app.use(ElDescriptionsItem)
  app.use(ElDescriptions)
}
