//app.js
const updateManager = wx.getUpdateManager()

App({
  onLaunch(options) {
    console.log('onLaunch：')
    console.log(options)

    wx.getSystemInfo({
      success: (res) => {
        console.log(res)
        this.globalData.systemInfo = res
      }
    })

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log("检测到新版本？" + res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })

    })

    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    })

    this.getUserInfo()
  },
  globalData: {
    userInfo: null,
  },
  hatInfo:{
    scale: null,
    rotate: null,
    left: null,
    top: null,
    bgImageUrl: null,
    hatImageUrl: null
  },
  getUserInfo() {
    wx.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              this.globalData.encryptedData = res.encryptedData
              this.globalData.iv = res.iv

              if (this.loginToDo) {
                this.loginToDo(res.result)
              }
            }
          })
        } 
      }
    })
  }
})