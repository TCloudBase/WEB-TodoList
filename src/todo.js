//TODO.todo;//待办事项内容json，可按照规则直接改变
//TODO.todoinit();//刷新显示待办事项
//TODO.itemChange(id,type,des);//监听待办列表变化，id，类型，描述
let TODO = {
    editid: null,
    todo: localStorage.getItem('todo'),
    pre_init: function () {
        document.head.innerHTML += `
        <meta charset="UTF-8">
        <title>云开发Todo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        `;
        this.loadheadfile('src/todo.css', 'css');
        console.log(window.onload);
        if(window.onload==null){
            window.onload = function(){
                TODO.init();
            }
        }
    },
    init: function () {
        this.todo = this.todo ? JSON.parse(this.todo) : {};
        document.body.setAttribute('onkeydown', "TODO.onkey()");
        document.body.addEventListener('click', function () {
            TODO.resetItem();
        }, false);

        let index_dom = {};
        index_dom.model = document.createElement('div');
        index_dom.model.id = "model";

        index_dom.input = document.createElement('input');
        index_dom.input.id = "text-in";
        index_dom.input.setAttribute('type', 'text');
        index_dom.input.setAttribute('placeholder', "写下你的待办事项…");
        index_dom.model.appendChild(index_dom.input);

        index_dom.ul = document.createElement('ul');
        index_dom.ul.id = "todo-list";
        index_dom.model.appendChild(index_dom.ul);

        if(document.getElementById('model')==null){
            document.body.appendChild(index_dom.model);
        }

        this.list = document.getElementById('todo-list');
        this.text = document.getElementById('text-in');

        this.todoinit();
    },
    todoinit: function () {
        this.list.innerHTML = "";
        for (let item in this.todo) {
            this.addItemshow(item, this.todo[item].text, this.todo[item].type);
        }
        this.editid=null;
        this.Storage();
    },
    onkey: function () {
        if (window.event.keyCode == 13) {
            if (this.editid == null) {
                let t = this.text.value.replace(/\s/g, "");
                if (t != "") {
                    let tid = 'item-' + new Date().getTime();
                    this.addItemshow(tid, t);
                    this.text.value = "";
                    this.todo[tid] = {
                        text: t,
                        type: false
                    };
                    this.Storage();
                    try {
                        this.itemChange(tid, 'add', t);
                    } catch (e) {console.error(e)};
                }
            }
            else {
                this.resetItem();
            }
        }
    },
    itemDone: function (id, type) {
        event.stopPropagation();
        let ids = document.getElementById(id);
        if (type) {
            let pt = ids.getElementsByTagName('p')[0];
            pt.style = "text-decoration:line-through;color:#c3c3c3";
            pt.removeAttribute('onClick');
            ids.getElementsByTagName('input')[0].setAttribute('checked', "true");
            ids.getElementsByTagName('input')[0].setAttribute('onchange', `TODO.itemDone('${id}',false)`);
            // list.appendChild(ids);
        }
        else {
            let pt = ids.getElementsByTagName('p')[0];
            pt.style = "";
            pt.setAttribute('onClick', `TODO.itemEdit('${id}')`);
            ids.getElementsByTagName('input')[0].setAttribute('checked', "false");
            ids.getElementsByTagName('input')[0].setAttribute('onchange', `TODO.itemDone('${id}',true)`);
            // list.insertBefore(ids,this.list.firstChild);
        }
        this.todo[id].type = type;
        this.Storage();
        try {
            this.itemChange(id, 'done', type);
        } catch (e) {console.error(e)};

    },
    itemDel: function (id) {
        event.stopPropagation();
        let ids = document.getElementById(id);
        ids.remove();
        delete this.todo[id];
        this.Storage();
        try {
            this.itemChange(id, 'delete');
        } catch (e) {console.error(e)};
    },
    itemEdit: function (id) {
        event.stopPropagation();
        let ids = document.getElementById(id);
        let pt = ids.getElementsByTagName('p')[0];
        let input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.value = pt.innerText;
        input.addEventListener('click', function () {
            event.stopPropagation();
        }, false);
        ids.insertBefore(input, pt);
        pt.remove();
        this.resetItem();
        this.editid = id;
    },
    resetItem: function () {
        if (this.editid != null) {
            let oldids = document.getElementById(this.editid);
            let oldinput = oldids.getElementsByTagName('input')[1];
            let oldpt = document.createElement('p');
            oldpt.innerText = oldinput.value;
            let txt = oldinput.value;
            oldpt.setAttribute('onClick', `TODO.itemEdit('${this.editid}')`);
            oldids.insertBefore(oldpt, oldinput);
            oldinput.remove();
            this.todo[this.editid].text = txt;
            this.Storage();
            try {
                this.itemChange(this.editid, 'update', txt);
            } catch (e) {console.error(e);};
            this.editid = null;
        }
    },
    addItemshow: function (id, t, type = false) {
        let temp = {};
        temp.root = document.createElement('lo');
        temp.root.setAttribute('id', id);
        temp.input = document.createElement('input');
        temp.input.setAttribute('type', 'checkbox');
        temp.input.setAttribute('onchange', `TODO.itemDone('${id}',true)`);
        temp.p = document.createElement('p');
        temp.p.innerText = t;
        temp.p.setAttribute('onClick', `TODO.itemEdit('${id}')`);
        temp.delete = document.createElement('delete');
        temp.delete.innerText = '✕';
        temp.delete.setAttribute('onClick', `TODO.itemDel('${id}')`);
        if (type) {
            temp.p.style = "text-decoration:line-through;color:#c3c3c3";
            temp.p.removeAttribute('onClick');
            temp.input.setAttribute('checked', "true");
            temp.input.setAttribute('onchange', `TODO.itemDone('${id}',false)`);
        }
        temp.root.appendChild(temp.input);
        temp.root.appendChild(temp.p);
        temp.root.appendChild(temp.delete);
        this.list.insertBefore(temp.root, this.list.firstChild);
    },
    Storage() {
        localStorage.setItem('todo', JSON.stringify(this.todo));
    },
    loadheadfile(filename, filetype) {
        if (filetype == "js") {
            var fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", filename);
        }
        else if (filetype == "css") {
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
        }
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    }
};
TODO.pre_init();