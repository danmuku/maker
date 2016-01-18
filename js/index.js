$(document).ready(function () {

    $(".copyBtn").hover(function () {
        $(this).removeAttr('data-tooltip');
    },
        function () {
            $(this).blur();
        });

    $(".copyBtn").click(function () {
        event.preventDefault();
        $(this).prev().select();
        var dataToCpy = $(this).prev().val();
        document.execCommand('copy');
        $(this).attr("data-tooltip", "复制成功"); //data-tooltip="复制成功"
        document.getSelection().removeAllRanges();
    });


    $(".clicker").click(function () {
        $('#input').trigger('click');
    });

    $(".dragger").on({
        dragleave: function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        drop: function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        dragenter: function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        dragover: function (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    $(".res").hover(function () {
        $(this).select();
    },
        function () {
            $(this).blur();
        });

    $('#input').change(function () {
        event.preventDefault();
        var filesToUpload = document.getElementById('input').files;
        var file = filesToUpload[0];
        if (file) {
            if (!/image\/\w+/.test(file.type) || file == "undefined") {
                swal("文件必须为图片！");
                return false;
            }
            previewAndUpload(file);
        }

    });

    //HTML5 paste http://www.zhihu.com/question/20893119
    $("#res_img").on("paste",
        function (e) {
            var oe = e.originalEvent;
            var clipboardData, items, item;
            if (oe && (clipboardData = oe.clipboardData) && (items = clipboardData.items)) {
                var b = false;
                for (var i = 0,
                    l = items.length; i < l; i++) {
                    if ((item = items[i]) && item.kind == 'file' && item.type.match(/^image\//i)) {
                        b = true;
                        previewAndUpload(item.getAsFile());
                    } else {
                        swal("您粘贴的不是图片~");
                        $('#res_img').val('');
                    }
                }
                if (b) return false;
            }
        });

    $(".dragger").on("drop",
        function (e) {
            e.preventDefault(); //取消默认浏览器拖拽效果
            var fileList = e.originalEvent.dataTransfer.files; //获取文件对象
            //检测是否是拖拽文件到页面的操作
            if (fileList.length == 0) {
                return false;
            }
            //检测文件是不是图片
            if (fileList[0].type.indexOf('image') === -1 || fileList[0] == "undefined") {
                swal("您拖的不是图片~");
                return false;
            }
            //拖拉图片到浏览器，可以实现预览功能
            var img = window.webkitURL.createObjectURL(fileList[0]);
            var file = fileList[0];
            previewAndUpload(file);
        });

});


function fillInputBlank(pid) {
    var picSizeType = $(".btn-group").children(".active").prop("value");
    var callBackImg = 'http://7xofqv.com1.z0.glb.clouddn.com/' + pid;
    $('#res_img').val(callBackImg);
    $('#res_html').val('<img src="' + callBackImg + '"/>');
    $('#res_ubb').val('[IMG]' + callBackImg + '[/IMG]');
    $('#res_md').val('![](' + callBackImg + ')');
}

function previewAndUpload(file) {
    $(".loader-wrap").show();
    var reader = new FileReader();
    var imgFile;
    reader.readAsDataURL(file);
    reader.onload = function (e) {
        $('.clicker').prop('src', '');
        $('.clicker').css('background-image', 'url(' + this.result + ')');
        $('.clicker').css('background-position', 'center');
    };
    reader.onloadend = function (e) {
        imgFile = e.target;

        init_danmako(imgFile.result);

        html2canvas($('#danmako_container')).then(function (canvas) {
            var base64 = canvas.toDataURL('image/png');
            console.log(base64);
            base64 = base64.split(',')[1];
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var resText = xhr.responseText;
                        try {
                            rs = JSON.parse(resText);
                            fillInputBlank(rs.hash);
                            return true;
                        } catch (e) {
                            console.log(e);
                            swal("上传失败");
                            return;
                        }
                    } else {
                        swal("图片上传失败...");
                    }
                }
            };
            xhr.open('POST', '//up.qiniu.com/putb64/-1', true);
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.setRequestHeader("Authorization", "UpToken 1OcsILqPu9A_YrO7bgAEBowPWwmjTfzt_zUoINRC:bnJk5GpXzhX78F4TgpzZdbhU6PY=:eyJzY29wZSI6ImRhbm1ha28iLCJkZWFkbGluZSI6MTQ1MTU1MzE1N30=");
            xhr.send(base64);
            $('#danmako_container').remove();
        });

        $(".loader-wrap").fadeOut("fast");
        $(".copyBtn").removeClass("disabled");
    };
}


//初始化弹幕
function init_danmako(base64Img) {
    var danmacoDiv = $('<div id="danmako_container"><img id="danmako_img" src="{imgsrc}" />\
			<div class="danmako_screen"><div class="s_dm"><div class="s_show"></div></div></div></div>'.replace(/{imgsrc}/, base64Img));

    danmacoDiv.appendTo('body');


    var words = $("textarea#input_text").val().split("\n")
    
    // var fakes = ["Sogou 第二届黑客马拉松", "Biztech 万岁！", "评委老师们好~", "我是萌萌的弹幕~~~~", "前方高能", "刚才那个是假高能", "我来承包！", "PHP是违反广告法的语言！", "小鲜肉团队荣誉出品", "双十一我要剁手剁手剁手！", "折腾了一下午TMD代码没提交….", "这个逼装的我给一百分", "川总在哪里！！？？", "活捉川总一只！", "么么哒"];
    
    for (var i = 0; i < words.length; i++) {
        if (words[i]) {
            var word = $.trim(words[i]);
            $(".s_show").append("<div>" + word + "</div>");
        }
    }

    $(".s_show").find("div").show().each(function () {
        var _width = $('#danmako_img').width();
        var _height = $('#danmako_img').height();
        
        var _left = Math.random() * (_width);
        var _top = Math.random() * (_height);

        if (_top + $(this).height() > _height) {
            _top = _height - $(this).height();
        }

        if (_left + $(this).width() > _width) {
            _left = _width - $(this).width();
        }

        _left = $('#danmako_container').offset().left + _left;
        _top = $('#danmako_container').offset().top + _top;

        //设定文字的位置
        $(this).css({
            left: _left,
            top: _top,
            color: getRandomColor()
        });

    });
}


//随机获取颜色值
function getRandomColor() {
    return '#' + (function (h) {
        return new Array(7 - h.length).join("0") + h
    })((Math.random() * 0x1000000 << 0).toString(16))
}