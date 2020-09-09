/*
  TODO.todo                      //待办事项内容json，可按照规则直接改变
  TODO.todoinit()                //刷新显示待办事项
  TODO.itemChange(id,type,des)   //监听待办列表变化，id，类型，描述
  TODO.downLoadfile(file)        //下载文件触发，可以在上传时修改todo列表file的值
*/
var TODO = {
  editid: null,
  todo: localStorage.getItem('todo'),
  pre_init: function () {
    document.head.innerHTML += `
      <meta charset='UTF-8'>
      <title>云开发Todo</title>
      <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'>`
    TODO.loadheadfile('https://acc.cloudbase.vip/todo/src/todo.css', 'css')
    console.log(window.onload)
    if (window.onload == null) {
      window.onload = function () {
        TODO.init()
      }
    }
  },
  init: function () {
    TODO.todo = TODO.todo ? JSON.parse(TODO.todo) : {}
    document.body.setAttribute('onkeydown', 'TODO.onkey()')
    document.body.addEventListener('click', function () {
      TODO.resetItem()
    }, false)

    TODO.indexDom = {}
    TODO.indexDom.model = document.createElement('div')
    TODO.indexDom.model.id = 'model'

    TODO.indexDom.input = document.createElement('input')
    TODO.indexDom.input.id = 'text-in'
    TODO.indexDom.input.setAttribute('type', 'text')
    TODO.indexDom.input.setAttribute('placeholder', '写下你的待办事项…')
    TODO.indexDom.model.appendChild(TODO.indexDom.input)

    TODO.indexDom.filein = document.createElement('label')
    TODO.indexDom.filein.id = 'file-in'
    TODO.indexDom.filein.setAttribute('for', 'file-input')
    TODO.indexDom.filein.innerText = '上传附件'
    TODO.indexDom.model.appendChild(TODO.indexDom.filein)

    TODO.indexDom.fileinput = document.createElement('input')
    TODO.indexDom.fileinput.id = 'file-input'
    TODO.indexDom.fileinput.setAttribute('type', 'file')
    TODO.indexDom.fileinput.setAttribute('onchange', 'TODO.filechange(this)')
    TODO.indexDom.model.appendChild(TODO.indexDom.fileinput)

    TODO.indexDom.ul = document.createElement('ul')
    TODO.indexDom.ul.id = 'todo-list'
    TODO.indexDom.model.appendChild(TODO.indexDom.ul)

    if (document.getElementById('model') == null) {
      document.body.appendChild(TODO.indexDom.model)
    }

    TODO.todoinit()
  },
  todoinit: function () {
    document.getElementById('todo-list').innerHTML = ''
    for (const item in TODO.todo) {
      TODO.addItemshow(item, TODO.todo[item].text, TODO.todo[item].type, false)
    }
    TODO.editid = null
    TODO.Storage()
  },
  onkey: function () {
    if (window.event.keyCode === 13) {
      if (TODO.editid == null) {
        const t = document.getElementById('text-in').value.replace(/\s/g, '')
        if (t !== '') {
          const tid = 'item-' + new Date().getTime()
          TODO.todo[tid] = {
            text: t,
            type: false
          }
          const fufile = TODO.fufile
          if (fufile != null) {
            TODO.todo[tid].file = new Date().getTime() + fufile.name
          }
          document.getElementById('text-in').value = ''
          TODO.fufile = null
          const filein = document.getElementById('file-in')
          document.getElementById('file-input').outerHTML = document.getElementById('file-input').outerHTML
          filein.style = ''
          filein.innerText = '上传附件'
          TODO.Storage()
          try {
            TODO.itemChange(tid, 'add', fufile)
            TODO.addItemshow(tid, t, false, true)
          } catch (e) {
            TODO.addItemshow(tid, t, false, false)
          }
        }
      } else {
        TODO.resetItem()
      }
    }
  },
  filechange: function (e) {
    const filein = document.getElementById('file-in')
    if (e.files.length !== 0) {
      filein.innerText = '已选附件'
      filein.style = 'color:green;'
      TODO.fufile = e.files[0]
    } else {
      filein.style = ''
      filein.innerText = '上传附件'
      TODO.fufile = null
    }
  },
  itemDone: function (id, type) {
    event.stopPropagation()
    const ids = document.getElementById(id)
    if (type) {
      const pt = ids.getElementsByTagName('p')[0]
      pt.style = 'text-decoration:line-throughcolor:#c3c3c3'
      pt.removeAttribute('onClick')
      ids.getElementsByTagName('input')[0].setAttribute('checked', 'true')
      ids.getElementsByTagName('input')[0].setAttribute('onchange', `TODO.itemDone('${id}',false)`)
      // list.appendChild(ids)
    } else {
      const pt = ids.getElementsByTagName('p')[0]
      pt.style = ''
      pt.setAttribute('onClick', `TODO.itemEdit('${id}')`)
      ids.getElementsByTagName('input')[0].setAttribute('checked', 'false')
      ids.getElementsByTagName('input')[0].setAttribute('onchange', `TODO.itemDone('${id}',true)`)
      // list.insertBefore(ids,TODO.list.firstChild)
    }
    TODO.todo[id].type = type
    TODO.Storage()
    try {
      TODO.itemChange(id, 'done', type)
    } catch (e) { console.error(e) }
  },
  itemDel: function (id) {
    event.stopPropagation()
    const ids = document.getElementById(id)
    ids.remove()
    try {
      TODO.itemChange(id, 'delete')
    } catch (e) {
      delete TODO.todo[id]
    }
    TODO.Storage()
  },
  itemEdit: function (id) {
    event.stopPropagation()
    const ids = document.getElementById(id)
    const pt = ids.getElementsByTagName('p')[0]
    const input = document.createElement('input')
    input.setAttribute('type', 'text')
    input.value = pt.innerText
    input.addEventListener('click', function () {
      event.stopPropagation()
    }, false)
    ids.insertBefore(input, pt)
    pt.remove()
    TODO.resetItem()
    TODO.editid = id
  },
  resetItem: function () {
    if (TODO.editid != null) {
      const oldids = document.getElementById(TODO.editid)
      const oldinput = oldids.getElementsByTagName('input')[1]
      const oldpt = document.createElement('p')
      oldpt.innerText = oldinput.value
      const txt = oldinput.value
      oldpt.setAttribute('onClick', `TODO.itemEdit('${TODO.editid}')`)
      oldids.insertBefore(oldpt, oldinput)
      oldinput.remove()
      TODO.todo[TODO.editid].text = txt
      TODO.Storage()
      try {
        TODO.itemChange(TODO.editid, 'update', txt)
      } catch (e) { console.error(e) }
      TODO.editid = null
    }
  },
  addItemshow: function (id, t, type = false, local = true) {
    const temp = {}
    temp.root = document.createElement('lo')
    temp.root.setAttribute('id', id)
    temp.input = document.createElement('input')
    temp.input.setAttribute('type', 'checkbox')
    temp.p = document.createElement('p')
    temp.p.innerText = t
    temp.delete = document.createElement('delete')
    temp.delete.innerText = '✕'
    if (type) {
      temp.p.style = 'text-decoration:line-throughcolor:#c3c3c3'
      temp.input.setAttribute('checked', 'true')
    }
    temp.root.appendChild(temp.input)
    temp.root.appendChild(temp.p)
    if (local === true) {
      temp.root.style = 'background: #f9e7e7;'
    } else {
      if (!type) {
        temp.p.setAttribute('onClick', `TODO.itemEdit('${id}')`)
      }
      if (TODO.todo[id].file != null) {
        temp.span = document.createElement('span')
        temp.span.innerText = '文件'
        temp.span.setAttribute('onClick', `TODO.downLoadfile('${TODO.todo[id].file}')`)
        temp.root.appendChild(temp.span)
      }
      temp.input.setAttribute('onchange', `TODO.itemDone('${id}',${!type})`)
      temp.delete.setAttribute('onClick', `TODO.itemDel('${id}')`)
    }
    temp.root.appendChild(temp.delete)
    const todolist = document.getElementById('todo-list')
    todolist.insertBefore(temp.root, todolist.firstChild)
  },
  Storage () {
    localStorage.setItem('todo', JSON.stringify(TODO.todo))
  },
  loadheadfile (filename, filetype) {
    let fileref = null
    if (filetype === 'js') {
      fileref = document.createElement('script')
      fileref.setAttribute('type', 'text/javascript')
      fileref.setAttribute('src', filename)
    } else if (filetype === 'css') {
      fileref = document.createElement('link')
      fileref.setAttribute('rel', 'stylesheet')
      fileref.setAttribute('type', 'text/css')
      fileref.setAttribute('href', filename)
    }
    if (typeof fileref !== 'undefined') {
      document.getElementsByTagName('head')[0].appendChild(fileref)
    }
  }
}
TODO.pre_init()
