const CrudHelper = require('./index')
const crud = new CrudHelper({
    key: 'id',
    save:(v)=>{
        console.log(`save ${JSON.stringify(v)}`)
        return v
    },
    delete:(v)=>{
        console.log(`delete ${JSON.stringify(v)}`)
        return v
    }
})

crud.setDataSource([
    {
        id:1,
        attr:'1'
    },
    {
        id:2,
        attr:'2'
    }
])

crud.onViewData(v=>console.log(v))
// [ { id: 1, attr: '1' }, { id: 2, attr: '2' } ]

crud.valueChange(1, 'attr', '3')
// [ { id: 1, attr: '3' }, { id: 2, attr: '2' } ]
crud.save(1)
// save {"id":1,"attr":"3"}
crud.delete(1)
// delete {"id":1,"attr":"3"}

crud.valueChange(2, 'attr', '4')
// [ { id: 1, attr: '3' }, { id: 2, attr: '4' } ]
crud.cancel(2)
// [ { id: 1, attr: '3' }, { id: 2, attr: '2' } ]

crud.destory()
