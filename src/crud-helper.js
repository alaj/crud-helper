const rxjs = require('rxjs')
const op = require('rxjs/operators')
module.exports = class CrudHelper {
  constructor(config) {
    this.config = config
    this.key = config.key
    this.saveCb = config.save
    this.sortCb = config.sort
    this.filterCb = config.filter
    this.deleteCb = config.delete
    this.dataSource$ = new rxjs.BehaviorSubject([])
    this.editData$ = new rxjs.BehaviorSubject([])
    this.viewData$ = new rxjs.BehaviorSubject([])
    this.subscriptions = []
    this.dataSourceSubscription = this.dataSource$.subscribe(this.editData$)

    this.editDataSubscription = this.editData$.pipe(
      op.map(data => {
        // 筛选
        if (this.filterCb) {
          data.filter(this.filterCb)
        }

        // 排序
        if (this.sortCb) {
          data.sort(this.sortCb)
        }
        return data
      })
    ).subscribe(this.viewData$)

    this.subscriptions.push(this.dataSourceSubscription)
    this.subscriptions.push(this.editDataSubscription)
  }

  cancel(key) {
    const editData = [...this.editData$.getValue()]
    const dataSource = [...this.dataSource$.getValue()]
    const recoverItem = dataSource.filter(item => item[this.key] === key)[0]
    if (recoverItem) {
      // recover
      const newData = editData.map(v => {
        if (v[this.key] === key) {
          return { ...recoverItem }
        } else {
          return v
        }
      })
      this.editData$.next(newData)
    } else {
      // delete
      const newData = editData.filter(v => {
        return v[this.key] !== key
      })
      this.editData$.next(newData)
    }
  }

  async save(key) {
    const editData = [...this.editData$.getValue()]
    const saveItem = editData.filter(item => item[this.key] === key)[0]
    const updatedItem = await this.saveCb({ ...saveItem })
    Object.assign(saveItem, { ...updatedItem })
    this.editData$.next(editData)
  }

  valueChange(key, field, value) {
    let editData = [...this.editData$.getValue()]
    editData = editData.map((item) => {
      if (item[this.key] === key) {
        const newItem = { ...item }
        newItem[field] = value
        return newItem
      } else {
        return item
      }
    })
    this.editData$.next(editData)
  }

  insert(insertItem) {
    const editData = [...this.editData$.getValue()]
    if (editData.filter(item => item[this.key] === insertItem[this.key])[0]) {
      return
    }
    editData.unshift({ ...insertItem })
    this.editData$.next(editData)
  }

  async delete(key) {
    const editData = [...this.editData$.getValue()]
    const deleteItem = { ...editData.filter(item => item[this.key] === key)[0] }
    await this.deleteCb({ ...deleteItem })
    this.editData$.next(editData.filter(item => item[this.key] !== key))
  }

  setDataSource(dataSource) {
    this.dataSource$.next(dataSource)
  }

  getViewData() {
    this.viewData$.getValue()
  }

  getDataSource() {
    this.dataSource$.getValue()
  }

  onViewData(cb) {
    this.subscriptions.push(this.viewData$.subscribe({ next: cb }))
  }

  destory() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe()
    }
  }
}

