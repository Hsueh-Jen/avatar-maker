    var picsDir = "/pictures/";

    //使用AJAX將檔案上傳到Server後，取得圖片路徑，並貼入編輯區塊
    function ajaxUploadPic(file, cb) {

      var formData = new FormData();
      formData.append('uploads[]', file);
      // formData.append('uploads[]', file, file.name); //it also can set file.name

      $.ajax({
        type: 'POST',
        url: '/pictures',
        data: formData,
        processData: false,
        contentType: false,
        timeout: 15000,
        success: function (imgSrc) {
          if (imgSrc) {
            // console.log('upload successful!: ' + imgSrc);
            cb(imgSrc);
          }

        }
      });
    }

    //使用AJAX取得所有大頭貼的src
    function ajaxGetPics(cb) {
      $.ajax({
        type: 'GET',
        url: '/pictures',
        timeout: 10000,
        success: function (imgSrcs) {
          // console.log('get img srcs successful!: ' + imgSrcs);
          cb(imgSrcs);
        }
      });
    }

    //使用AJAX取得所有素材的資訊
    function ajaxGetConfig(cb) {
      $.ajax({
        type: 'GET',
        url: '/config',
        timeout: 10000,
        success: function (config) {
          // console.log('get config successful!: ' + config);
          cb(config);
        }
      });
    }

    // Converts canvas to an image
    function convertCanvasToImageFile(canvas) {
      var blobBin = atob(canvas.toDataURL().split(',')[1]);
      var array = [];
      for (var i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }
      var file = new Blob([new Uint8Array(array)], {
        type: 'image/png'
      });
      return file;
    }


    function resizeCanvas(canvas){
      var newCanvas = document.createElement("canvas");
      newCanvas.setAttribute('width', 512);
      newCanvas.setAttribute('height', 512);
      var ctx = newCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, 0, 512, 512);
      return newCanvas;
    }

    $(function(){


    var vue = new Vue({
      el: '#vueApp',
      data: {
        eyeIndex: 0,
        mouthIndex: 0,
        decoIndex: 0,
        bgIndex: 0,
        picCount: 0,
        showLoading: false,
        decos: ['../../'],
        eyes: ['../../'],
        mouths: ['../../'],
        bgs: ['../../'],
        imgs: [],
        dialog: ""
      },
      computed: {
        eyeCount: function () {
          return this.eyes.length;
        },
        mouthCount: function () {
          return this.mouths.length;
        },
        decoCount: function () {
          return this.decos.length;
        },
        bgCount: function () {
          return this.bgs.length;
        }
      },
      methods: {
        //讓大頭貼的隨機更換配件，包含眼睛、嘴巴、裝飾、背景
        randomFace: function (action) {
          this.eyeIndex=Math.floor(Math.random() * (this.eyes.length));
          this.decoIndex=Math.floor(Math.random() * (this.decos.length));
          this.mouthIndex=Math.floor(Math.random() * (this.mouths.length));
          this.bgIndex=Math.floor(Math.random() * (this.bgs.length));
        },
        //切換眼睛
        changeEye: function (action) {
          if (action == "next") {
            if (this.eyeIndex < this.eyeCount - 1) {
              this.eyeIndex++;
            }
          } else {
            if (this.eyeIndex > 0) {
              this.eyeIndex--;
            }
          }
          // console.log(this.eyes[this.eyeIndex]);
        },
        //切換嘴巴
        changeMouth: function (action) {

          if (action == "next") {
            if (this.mouthIndex < this.mouthCount - 1) {
              this.mouthIndex++;
            }
          } else {
            if (this.mouthIndex > 0) {
              this.mouthIndex--;
            }
          }
          // console.log(this.mouths[this.mouthIndex]);
        },
        //切換裝飾
        changeDeco: function (action) {

          if (action == "next") {
            if (this.decoIndex < this.decoCount - 1) {
              this.decoIndex++;
            }
          } else {
            if (this.decoIndex > 0) {
              this.decoIndex--;
            }
          }
          // console.log(this.decos[this.decoIndex]);
        },
        //切換背景
        changeBackground: function (action) {

          if (action == "next") {
            if (this.bgIndex < this.bgCount - 1) {
              this.bgIndex++;
            }
          } else {
            if (this.bgIndex > 0) {
              this.bgIndex--;
            }
          }
          // console.log(this.bgs[this.bgIndex]);
        },
        getPics: function () {
          ajaxGetPics(function (imgSrcs) {
            if (imgSrcs) {
              vue.imgs = imgSrcs;
              vue.picCount = imgSrcs.length;
            }
          });

        },
        postImg: function (e) {

          //圖片開始上傳，showLoading會讓投稿按鈕disabled
          vue.showLoading = true;

          window.html2canvas(document.getElementById("canvas"), {
            'onrendered': function (canvas) {

              //在不同解析度的裝置上，canvas大小也不同，用resizeCanvas統一大小
              var resizedCanvas=resizeCanvas(canvas);

              // Converts canvas to an image
              var file = convertCanvasToImageFile(resizedCanvas);

              if (file) {
                ajaxUploadPic(file, function (imgSrc) {
                  vue.imgs.unshift(
                    imgSrc
                  );
                  vue.showLoading = false;
                  vue.picCount++;
                });
              }

            }.bind(this)
          });
        },
        //下載圖片
        exportAsImg: function (e) {
          window.html2canvas(document.getElementById("canvas"), {
            'onrendered': function (canvas) {
              var anchor = document.createElement('a');
              anchor.href = canvas.toDataURL();
              anchor.download = "picture.jpg";
              anchor.click();
            }.bind(this)
          });
        },
        //resize視窗的時候，改變font-size
        handleResize:function(e){
          var fontSize = ($("#canvas").width())/15;
          $(".border-text").css({"font-size":fontSize+"px"});
        }
      }
      //vuejs初始化
      ,created:function(){
          //使用AJAX取得所有素材的資訊
          ajaxGetConfig(function (config) {
            vue.mouths = config.mouths;
            vue.eyes = config.eyes;
            vue.decos = config.decos;
            vue.bgs = config.bgs;
            vue.getPics();
          });
          //將大頭貼裡的文字font-size調整，並綁定resize事件，讓字體大小跟隨螢幕長寬變化
          this.handleResize();
          window.addEventListener('resize', this.handleResize);
      }
    });


    });
