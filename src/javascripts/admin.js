
$(document).ready(function(){
    require('../stylesheets/style.css');
    require('../stylesheets/chat.css');
    require('../stylesheets/scrollbar.css');
    require.context("../img", true, /.*\.(jpg|jpeg|gif|png)$/);

    $("#resizableFrame, #admin-panel").draggable({
        cursor: "move",
        cursorAt: {
            top: 5,
            left: 2
        }
    });

    $("#resizableFrame").resizable({
        maxHeight: 723,
        maxWidth: 750,
        minHeight: 200,
        minWidth: 200
    });
    var isRight = true;
    var socket = io.connect('http://localhost');
    socket.on('connect', function () {
        socket.on('msg', function (msg) {
            if (isRight) {
                $('#users').append(`<div class="container"><p style="word-wrap: break-word;">${msg.message}</p>
                    <span class="time-right">${msg.time}</span></div>`)
                isRight = false;
            } else {
                $('#users').append(`<div class="container darker"><p style="word-wrap: break-word;">
                    ${msg.message}</p><span class="time-left">${msg.time}</span></div>`)
                isRight = true;
            }
        });
        socket.on('updatepictureinfo', function (msg) {
            $(`#pictable tr:nth-child(${msg.id + 2}) :nth-child(5)`).text(msg.name);
            $(`#pictable tr:nth-child(${msg.id + 2}) :nth-child(6)`).text(msg.price);
        });
        socket.on('updatemoney', function (msg) {
            for (let i = 2; i <= picsnum + 1; i++) {
                if($(`#usertable tr:nth-child(${i}) :nth-child(2)`).text() == msg.name) {
                    $(`#usertable tr:nth-child(${i}) :nth-child(3)`).text(msg.money);
                    break;
                }
            }
        });
    });

    var pic_num = 0;
    var research_time = $('#researchPause').text().split(' ')[0];
    var timeout = $('#timeout').text().split(' ')[0];
    function startAuction() {
        socket.json.emit('startauction', {time: research_time, msg: 'Ознакомьтесь с картиной'});
        socket.json.emit('refreshtimer', {time: research_time});
        changePicture();
        refresh(research_time);
    }

    function auctionStep() {
        socket.json.emit('auctionstep', {msg: 'Аукцион'});
        socket.json.emit('refreshtimer', {time: timeout});
        refresh(timeout);
    }

    function researchStep() {
        socket.json.emit('researchstep', {msg: 'Ознакомьтесь с картиной'});
        socket.json.emit('refreshtimer', {time: research_time});
        refresh(research_time);
    }

    function changePicture() {
        socket.json.emit('changepicture', {ind: pic_num++});
    }

    function stopAuction() {
        socket.json.emit('stopauction', {ind: pic_num});
    }

    $('#start').on('click', function() {
        startAuction();
        $('#start').hide();
    });

    var sec=0;
    var isNewAuctStep = true;
    var picsnum = Number($('#picsnum').text());
    var iter = 0;
    function refresh(min)
    {
        if(--sec == -1) {
            sec = 59;
            min = min - 1;
        }
        let time=(min <= 9 ? "0"+min : min) + ":" + (sec <= 9 ? "0" + sec : sec);
        if (document.getElementById){timer.innerHTML=time;}
        inter = setTimeout(function() {refresh(min);}, 1000);
        // действие, если таймер 00:00
        if(min=='00' && sec=='00'){
            sec="0";
            clearInterval(inter);
            iter++;
            if (iter < picsnum*2) {
                if (isNewAuctStep) {
                    auctionStep();
                    isNewAuctStep = false;
                } else {
                    changePicture();
                    researchStep();
                    isNewAuctStep = true;
                }
            } else {
                stopAuction()
            }
        }
    }
});