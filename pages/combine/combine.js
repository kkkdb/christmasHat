// pages/combine/combine.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hatInfo: null,
    canvas_img_path: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      hatInfo: app.hatInfo
    })
    this.createNewImg()
  },

  createNewImg(){
    wx.showLoading({
      title: '图片生成中……',
    })
    let context = wx.createCanvasContext("mycanvas"),
      per = app.globalData.systemInfo.screenWidth / 375,
      hatInfo = this.data.hatInfo,
      hatsize = hatInfo.scale * 100 * per

    context.drawImage(hatInfo.bgImageUrl, 0, 0, 300 * per, 300 * per)
    context.translate(hatInfo.left, hatInfo.top)
    context.rotate(hatInfo.rotate * Math.PI / 180)
    context.drawImage(hatInfo.hatImageUrl, -hatsize / 2, -hatsize/2, hatsize, hatsize)

    //绘制图片
    context.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: res => {
          var tempFilePath = res.tempFilePath
          this.setData({
            canvas_img_path: tempFilePath
          })
          wx.hideLoading()
        },
        fail: function (res) {
          console.log(res);
        }
      })
    })
  },

  confirmOauth() {
    let that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum'] == null) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.saveImg()
            },
            fail() {
              that.setData({
                autosave: false
              })
            }
          })
        } else {
          that.saveImg()
        }
      }
    })
  },
  saveImg() {
    wx.showLoading({
      title: '保存图片中'
    })

    wx.saveImageToPhotosAlbum({
      filePath: this.data.canvas_img_path,
      success: (data) => {
        wx.hideLoading()
        wx.showModal({
          title: '温馨提示',
          content: '图片已经保存到相册',
        })
      },
      fail: (err) => {
        wx.hideLoading()
        console.log(err);
        if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          console.log("用户一开始拒绝了，我们想再次发起授权")
          console.log('打开设置窗口')
          wx.openSetting({
            success(settingdata) {
              console.log(settingdata)
              if (settingdata.authSetting['scope.writePhotosAlbum']) {
                console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
              } else {
                console.log('获取权限失败，给出不给权限就无法正常使用的提示')
              }
            }
          })
        }
      }
    })
  },
  previewImage() {
    wx.previewImage({
      current: this.data.canvas_img_path, // 当前显示图片的http链接
      urls: [this.data.canvas_img_path] // 需要预览的图片http链接列表
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})