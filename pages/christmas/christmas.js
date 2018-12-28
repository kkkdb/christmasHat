// pages/christmas/christmas.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth: 0,
    width: 100,
    height: 100,
    left: 100,
    top: 100,
    bgImageUrl: "",
    hatImageUrl: "",
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    centerPoint: null,
    closePoint: null,
    handlePoint: null,
    scale: 1,
    rotate: 0,
    borderWidth: 2,
    handleRadius: 20,
    type: "",
    step: 1,
    showBorder: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          windowWidth: res.windowWidth
        })
      }
    })
    
    if (app.globalData.userInfo) {
      this.onloadTodo()
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.loginToDo = res => {
        this.onloadTodo()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.onloadTodo()
        }
      })
    }
  },

  onloadTodo() {
    this.setData({
      userInfo: app.globalData.userInfo,
      bgImageUrl: app.globalData.userInfo.avatarUrl
    })
  },

  clear() {
    this.setData({
      hatImageUrl: "",
      width: 100,
      height: 100,
      scale: 1,
      rotate: 0,
      centerPoint: {
        x: this.data.windowWidth / 2,
        y: 150
      },
      closePoint: {
        x: (this.data.windowWidth - this.data.width) / 2,
        y: (300 - this.data.height) / 2
      },
      handlePoint: {
        x: (this.data.windowWidth + this.data.width) / 2,
        y: (300 + this.data.height) / 2
      },
      left: (this.data.windowWidth - this.data.width) / 2 - this.data.borderWidth,
      top: 100 - this.data.borderWidth
    })
    this.width = this.data.width
    this.height = this.data.height
    this.scale = this.data.scale
    this.rotate = this.data.rotate
    this.left = this.data.left
    this.top = this.data.top
    this.centerPoint = this.data.centerPoint
    this.closePoint = this.data.closePoint
    this.handlePoint = this.data.handlePoint
  },

  before() {
    this.clear()
    this.setData({
      step: --this.data.step
    })
  },

  next() {
    if(!this.data.bgImageUrl){
      wx.showToast({
        title: '请选择图片',
        icon: "none"
      })
      return
    }
    this.clear()
    this.setData({
      step: ++this.data.step
    })
  },

  chooseHat(e) {
    this.setData({
      hatImageUrl: `../../images/hat/${e.currentTarget.dataset.hatId}.png`
    })
    this.showBorderHandle(false)
  },

  getUserInfo: function (e) {
    let userInfo = e.detail.userInfo
    if (userInfo) {
      app.globalData.userInfo = userInfo
      app.globalData.encryptedData = e.detail.encryptedData
      app.globalData.iv = e.detail.iv
      this.setData({
        userInfo,
        bgImageUrl: userInfo.avatarUrl
      })
    }
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        this.setData({
          bgImageUrl: tempFilePaths[0]
        })
      }
    })
  },

  showBorderHandle(bool) {
    if (this.data.showBorder == bool) {
      this.setData({
        left: bool ? this.data.left + this.data.borderWidth : this.data.left - this.data.borderWidth,
        top: bool ? this.data.top + this.data.borderWidth : this.data.top - this.data.borderWidth,
        showBorder: !bool
      })
    } else {
      this.setData({
        showBorder: !bool
      })
    }
  },

  touchstart(e) {
    console.log(e)
    let type = e.target.id
    this.setData({
      type
    })
    if (type == "") {
      this.showBorderHandle(true)
      return
    }
    this.showBorderHandle(false)
    let originPoint = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    }
    this.originPoint = originPoint
  },

  touchmove(e) {
    let type = this.data.type
    let movePoint = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    }

    if (type == "") {
      return
    } else if (type == "rotate") {
      let movex = movePoint.x - this.handlePoint.x,
        movey = movePoint.y - this.handlePoint.y,
        line1 = this.calculateLength(this.centerPoint, this.handlePoint),
        line2 = this.calculateLength(this.centerPoint, movePoint),
        angle1 = this.calculateAngle(this.centerPoint, this.handlePoint),
        angle2 = this.calculateAngle(this.centerPoint, movePoint),
        scale = line2 / line1 * this.scale,
        rotate = angle2 - angle1 + this.rotate

      this.setData({
        scale,
        rotate,
        handlePoint: {
          x: this.handlePoint.x + movex,
          y: this.handlePoint.y + movey
        },
        closePoint: {
          x: this.closePoint.x - movex,
          y: this.closePoint.y - movey
        }
      })
    } else if (type == "hat") {
      let movex = movePoint.x - this.originPoint.x,
        movey = movePoint.y - this.originPoint.y
      this.setData({
        left: this.left + movex,
        top: this.top + movey,
        handlePoint: {
          x: this.handlePoint.x + movex,
          y: this.handlePoint.y + movey
        },
        closePoint: {
          x: this.closePoint.x + movex,
          y: this.closePoint.y + movey
        },
        centerPoint: {
          x: this.centerPoint.x + movex,
          y: this.centerPoint.y + movey
        }
      })
    } else if (type == "close") {

    }
  },

  touchend(e) {
    let type = this.data.type
    if (type == "") {
      return
    }
    this.scale = this.data.scale
    this.rotate = this.data.rotate
    this.handlePoint = this.data.handlePoint
    this.centerPoint = this.data.centerPoint
    this.closePoint = this.data.closePoint
    this.left = this.data.left
    this.top = this.data.top
  },

  calculateLength(pointA, pointB) {
    let x = pointB.x - pointA.x,
      y = pointB.y - pointA.y

    return Math.sqrt(x * x + y * y)
  },

  calculateAngle(pointA, pointB) {
    let x = pointB.x - pointA.x,
      y = pointB.y - pointA.y

    return Math.atan2(y, x) * 180 / Math.PI
  },

  createImg() {
    let { scale, rotate, left, top, bgImageUrl, hatImageUrl } = this.data

    app.hatInfo = {
      scale,
      rotate,
      left: this.data.centerPoint.x - (this.data.windowWidth - 300) / 2,
      top: this.data.centerPoint.y,
      bgImageUrl,
      hatImageUrl
    }
    wx.navigateTo({
      url: '../combine/combine',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})