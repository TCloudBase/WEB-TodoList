/*
  云开发简易登录窗口插件，默认邮件登录
  LO.custom                //是否自定义登录方法，默认为false为邮件登录
  LO.init()                //初始化方法调用打开登录框，默认邮件登录时则会自动判断，如果登录则触发LO.done(),不会初始化登录框
  LO.done()                //当登录完毕时触发，默认登录时可用，自定义无效
  LO.close()               //关闭登录框
  LO.onClose()             //监听关闭
  LO.onLogin(obj)          //监听登录按钮，需LO.custom=true才可生效
  LO.setBtn(text,disable)  //设置登录按钮
  LO.setDes(text,style)    //设置描述
*/
const LO = {
  status: false,
  custom: false,
  style: '#login-model{position:absolute;width:100%;height:100%;z-index:9;background:rgba(0,0,0,0.7);display:flex;}#login-item{display:flex;flex-direction:column;max-width:400px;width:calc(100% - 40px);margin:auto;background:white;padding:30px 20px 10px;}#id-input,#ik-input{height:35px;margin-bottom:10px;border:none;border-bottom:1px solid #cdcdcd;outline:none;letter-spacing:1px;}#id-input:focus,#ik-input:focus{border-color:#007acc;}#login-item > button{height:35px;border:none;background:#006eff;color:white;outline:none;}#login-item > button:disabled{background:#5aa2ff;}#login-item > button:active{background:#3e92ff;}#login-des{margin:0;font-size:12px;line-height:20px;font-weight:100;color:#898989;height:20px;}',
  init: function () {
    if (!this.custom) {
      try {
        const loginstate = auth.hasLoginState()
        if (loginstate.loginType === 'EMAIL') {
          console.log('已经登录！')
          try {
            LO.Done()
          } catch (e) { }
          return
        }
      } catch (e) { };
    }
    if (!this.status) {
      document.body.innerHTML += `<div id="login-model"><div id="login-item"><input id="id-input"placeholder="请输入登录名称"/><input id="ik-input"placeholder="请输入登录密码"type="password"/><button id="login-btn"onclick="LO.login()">登录</button><p id="login-des"></p></div></div><style>${this.style}</style>`
      document.getElementById('login-model').addEventListener('click', function () {
        if (confirm('确认关闭登录窗口？')) {
          LO.close()
        }
      }, false)
      document.getElementById('login-item').addEventListener('click', function () {
        event.stopPropagation()
      }, false)
      this.id = document.getElementById('id-input')
      this.ik = document.getElementById('ik-input')
      this.btn = document.getElementById('login-btn')
      this.des = document.getElementById('login-des')
      this.status = true
    } else {
      document.getElementById('login-model').style = ''
    }
  },
  close: function () {
    document.getElementById('login-model').style = 'display:none;'
    try {
      LO.onClose()
    } catch (e) { }
  },
  login: function () {
    const obj = {}
    obj.id = this.id.value
    obj.ik = this.ik.value
    const reg = new RegExp('^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$')
    obj.isEmail = reg.test(obj.id)
    if (this.custom) {
      try {
        LO.onLogin(obj)
      } catch (e) { }
    } else {
      LO.emailLogin.In(obj)
    }
  },
  setBtn (text = '登录', disable = true) {
    this.btn.innerText = text
    if (disable) {
      this.btn.setAttribute('disabled', disable)
    } else {
      this.btn.removeAttribute('disabled')
    }
  },
  setDes (text, style) {
    this.des.innerText = text || ''
    this.des.style = style
  },
  emailLogin: {
    Up: function (obj) {
      try {
        auth.signUpWithEmailAndPassword(obj.id, obj.ik).then(res => {
          LO.setBtn('注册中，等待邮件', true)
          LO.setDes('请前往邮箱验证，通过后返回此继续登录')

          setTimeout(function () {
            LO.setBtn('登录', false)
            LO.setDes('请在点击验证链接并通过后再点击登录按钮')
          }, 10000)
        }).catch(e => {
          console.log(e)
          if (e.toString().indexOf('100003') !== -1) {
            LO.setDes('密码强度不符，需8-32位，包含数字字母')
          }
        })
      } catch (e) {
        LO.setDes('邮箱登录模块无效，请引用云开发auth')
      }
    },
    In: function (obj) {
      if (obj.isEmail && obj.ik !== '') {
        auth.signInWithEmailAndPassword(obj.id, obj.ik).then(res => {
          LO.close()
          console.log('登录成功!')
          try {
            LO.Done()
          } catch (e) { }
        }).catch(e => {
          console.log(e)
          if (e.toString().indexOf('102003') !== -1) {
            LO.emailLogin.Up(obj)
          } else if (e.toString().indexOf('102001') !== -1) {
            LO.setDes('用户密码错误，请确认后重新登录')
          }
        })
      } else {
        LO.setDes('用户名需为邮箱，密码不能为空！')
      }
    }
  }
}
