(function(_0x30cb4a, _0x5ace3f) {
    const _0x396df9 = a0_0x5b38
      , _0x2c92b4 = _0x30cb4a();
    while (!![]) {
        try {
            const _0x13295e = parseInt(_0x396df9(0x13f)) / 0x1 + parseInt(_0x396df9(0x149)) / 0x2 * (parseInt(_0x396df9(0x156)) / 0x3) + -parseInt(_0x396df9(0x140)) / 0x4 + parseInt(_0x396df9(0x15e)) / 0x5 * (parseInt(_0x396df9(0x14c)) / 0x6) + parseInt(_0x396df9(0x147)) / 0x7 + -parseInt(_0x396df9(0x16f)) / 0x8 * (parseInt(_0x396df9(0x14f)) / 0x9) + -parseInt(_0x396df9(0x152)) / 0xa;
            if (_0x13295e === _0x5ace3f)
                break;
            else
                _0x2c92b4['push'](_0x2c92b4['shift']());
        } catch (_0x15be15) {
            _0x2c92b4['push'](_0x2c92b4['shift']());
        }
    }
}(a0_0x54a5, 0xa521f));
function onYouTubeIframeAPIReady() {
    const _0x1684d6 = a0_0x5b38;
    player = new YT[(_0x1684d6(0x17b))](_0x1684d6(0x163),{
        'playerVars': {
            'rel': 0x0,
            'controls': 0x0,
            'showinfo': 0x0,
            'autoplay': 0x1,
            'disablekb': 0x1
        },
        'events': {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    }),
    document[_0x1684d6(0x171)]('remaining-time')[_0x1684d6(0x141)][_0x1684d6(0x157)] = _0x1684d6(0x158);
}
function onPlayerReady(_0x16ebe4) {
    const _0x58bf90 = a0_0x5b38;
    console['log'](_0x58bf90(0x146)),
    videoFrame = document['getElementById'](_0x58bf90(0x163)),
    contentFrame = document[_0x58bf90(0x171)](_0x58bf90(0x175)),
    videoFrame[_0x58bf90(0x141)][_0x58bf90(0x157)] = _0x58bf90(0x158),
    contentFrame[_0x58bf90(0x141)][_0x58bf90(0x157)] = _0x58bf90(0x170),
    totalCount > 0x0 && moveNextItem(activeIndex),
    updateRemainingTime(),
    setInterval(heartBeat, 0x124f80),
    setPercentStatus();
}
function onPlayerStateChange(_0x22ec04) {
    const _0x9d4e89 = a0_0x5b38;
    _0x22ec04['data'] == YT[_0x9d4e89(0x161)][_0x9d4e89(0x178)] && (console[_0x9d4e89(0x14b)](_0x9d4e89(0x143)),
    onEnd()),
    _0x22ec04['data'] == YT[_0x9d4e89(0x161)][_0x9d4e89(0x173)] && (console[_0x9d4e89(0x14b)](_0x9d4e89(0x17f)),
    onPlay()),
    _0x22ec04[_0x9d4e89(0x142)] == YT['PlayerState']['PLAYING'] || _0x22ec04[_0x9d4e89(0x142)] == YT[_0x9d4e89(0x161)][_0x9d4e89(0x15b)] ? (document['getElementById'](_0x9d4e89(0x148))['style'][_0x9d4e89(0x157)] = _0x9d4e89(0x170),
    updateRemainingTime()) : document[_0x9d4e89(0x171)](_0x9d4e89(0x148))[_0x9d4e89(0x141)]['display'] = _0x9d4e89(0x158);
}
function onPlay() {
    const _0x299fdb = a0_0x5b38;
    if (playingItem != null) {
        if (playingItem[_0x299fdb(0x139)] != _0x299fdb(0x174)) {
            playingItem['className'] = _0x299fdb(0x151);
            let _0x486c41 = playingItem['id']
              , _0x2a839d = _0x486c41[_0x299fdb(0x15a)]('-')[0x3]
              , _0x51b973 = player[_0x299fdb(0x167)]();
            updateItemStatus(_0x2a839d, _0x299fdb(0x168), 'B', _0x51b973, _0x19ebc3 => {}
            );
        }
    }
}
function onEnd() {
    const _0x2e82ae = a0_0x5b38;
    if (playingItem != null) {
        if (playingItem[_0x2e82ae(0x139)] != _0x2e82ae(0x174)) {
            let _0x52ef7e = playingItem['id']
              , _0x980c43 = _0x52ef7e['split']('-')[0x3];
            updateItemStatus(_0x980c43, _0x2e82ae(0x168), 'E', 0x0, _0x5768ac => {
                const _0x5eda0a = _0x2e82ae;
                _0x5768ac['d'] == _0x5eda0a(0x17e) && (playingItem[_0x5eda0a(0x139)] = _0x5eda0a(0x174),
                finishCount++,
                setPercentStatus(),
                moveNextItem(index)),
                _0x5768ac['d'] == _0x5eda0a(0x160) && showWrongDurationModal();
            }
            );
        }
    }
}
function downloadItem(_0x344090, _0x34bbde) {
    const _0x41dffa = a0_0x5b38;
    playingItem = document[_0x41dffa(0x171)](_0x41dffa(0x166) + _0x344090);
    if (playingItem != null) {
        if (playingItem['className'] != _0x41dffa(0x174)) {
            playingItem[_0x41dffa(0x139)] = 'dotStart';
            let _0x3f54ce = playingItem['id']
              , _0x14f63d = _0x3f54ce[_0x41dffa(0x15a)]('-')[0x3];
            updateItemStatus(_0x14f63d, 'D93B3330-98E9-49CA-8792-819EA3EC1A5E', 'B', 0x0, _0x4fdb2f => {}
            );
        }
    }
    player[_0x41dffa(0x169)]();
    let _0x58a219 = _0x41dffa(0x13d) + _0x344090 + _0x41dffa(0x16e) + _0x34bbde;
    contentFrame[_0x41dffa(0x154)] = _0x58a219,
    videoFrame[_0x41dffa(0x141)]['display'] = _0x41dffa(0x158),
    contentFrame[_0x41dffa(0x141)][_0x41dffa(0x157)] = _0x41dffa(0x170);
}
function showQuestion(_0x34d471, _0x2b8c23) {
    const _0x304dd1 = a0_0x5b38;
    playingItem = document[_0x304dd1(0x171)](_0x304dd1(0x166) + _0x34d471);
    playingItem != null && (playingItem[_0x304dd1(0x139)] != 'dotFinish' && (playingItem[_0x304dd1(0x139)] = _0x304dd1(0x151)));
    player[_0x304dd1(0x169)]();
    let _0x133b99 = _0x304dd1(0x13e) + _0x34d471 + '&Index=' + _0x2b8c23;
    contentFrame['src'] = _0x133b99,
    videoFrame[_0x304dd1(0x141)][_0x304dd1(0x157)] = _0x304dd1(0x158),
    contentFrame[_0x304dd1(0x141)]['display'] = _0x304dd1(0x170);
}
function playVideo(_0x4c90f0, _0x2254c1, _0x155d62) {
    const _0x1ee1f5 = a0_0x5b38;
    index = _0x155d62,
    playingItem = document[_0x1ee1f5(0x171)](_0x1ee1f5(0x166) + _0x4c90f0),
    videoFrame[_0x1ee1f5(0x141)][_0x1ee1f5(0x157)] = _0x1ee1f5(0x170),
    contentFrame[_0x1ee1f5(0x141)][_0x1ee1f5(0x157)] = _0x1ee1f5(0x158),
    player[_0x1ee1f5(0x150)]({
        'mediaContentUrl': _0x2254c1
    });
}
function finishDownload(_0x10b660, _0xed54e1) {
    const _0xd91354 = a0_0x5b38;
    playingItem = document['getElementById'](_0xd91354(0x166) + _0x10b660);
    if (playingItem != null) {
        if (playingItem[_0xd91354(0x139)] != _0xd91354(0x174)) {
            let _0x5611a1 = playingItem['id']
              , _0x53eb73 = _0x5611a1['split']('-')[0x3];
            updateItemStatus(_0x53eb73, _0xd91354(0x168), 'E', 0x0, _0x278e57 => {
                const _0x1f5436 = _0xd91354;
                _0x278e57['d'] == _0x1f5436(0x17e) && (playingItem[_0x1f5436(0x139)] = _0x1f5436(0x174),
                finishCount++,
                setPercentStatus(),
                moveNextItem(_0xed54e1));
            }
            );
        }
    }
}
function finishQuestion(_0x269075, _0xfbedf9) {
    const _0x4223b3 = a0_0x5b38;
    playingItem = document[_0x4223b3(0x171)]('status-' + _0x269075),
    playingItem != null && (playingItem[_0x4223b3(0x139)] = _0x4223b3(0x174),
    finishCount++,
    setPercentStatus(),
    moveNextItem(_0xfbedf9));
}
function moveNextItem(_0x579e12) {
    const _0x5e367f = a0_0x5b38;
    let _0x200d7 = _0x5e367f(0x15d) + (parseInt(_0x579e12) + 0x1)
      , _0x1580ea = $(_0x200d7);
    _0x1580ea != null && _0x1580ea[_0x5e367f(0x155)](_0x5e367f(0x17d));
    if (finishCount === totalCount) {
        var _0x3bf801 = document[_0x5e367f(0x171)](_0x5e367f(0x179));
        _0x3bf801 != null && (_0x3bf801['className'] = _0x5e367f(0x144));
    }
}
function setPercentStatus() {
    const _0x2d9824 = a0_0x5b38;
    if (finishCount > 0x0 && totalCount > 0x0) {
        let _0x91a52e = document[_0x2d9824(0x171)](_0x2d9824(0x17c));
        if (_0x91a52e != null) {
            let _0x58d3f6 = parseInt(finishCount * 0x64 / totalCount) + '%';
            _0x91a52e[_0x2d9824(0x141)][_0x2d9824(0x17a)] = _0x58d3f6,
            _0x91a52e[_0x2d9824(0x14d)] = _0x58d3f6;
        }
    }
}
function askCertificate() {
    const _0x51dac1 = a0_0x5b38;
    document[_0x51dac1(0x171)](_0x51dac1(0x15f))[_0x51dac1(0x139)] = _0x51dac1(0x174),
    videoFrame['style'][_0x51dac1(0x157)] = _0x51dac1(0x158),
    contentFrame[_0x51dac1(0x141)]['display'] = _0x51dac1(0x170);
    let _0x1cb585 = window[_0x51dac1(0x153)][_0x51dac1(0x171)](_0x51dac1(0x162));
    _0x1cb585[_0x51dac1(0x177)]['add']('disabled'),
    document['getElementById']('modal-example')['style']['display'] = _0x51dac1(0x170);
}
function formatDuration2(_0x7da2c9) {
    const _0x411f1d = a0_0x5b38;
    var _0x4a9051 = Math[_0x411f1d(0x15c)](_0x7da2c9 / 0x3c)
      , _0x2317b7 = Math['floor'](_0x7da2c9 % 0x3c)
      , _0x28e5c2 = String(_0x4a9051)[_0x411f1d(0x13a)](0x2, '0')
      , _0x33aae6 = String(_0x2317b7)[_0x411f1d(0x13a)](0x2, '0');
    return _0x28e5c2 + ':' + _0x33aae6;
}
function a0_0x54a5() {
    const _0x3df2c8 = ['stringify', 'player\x20is\x20ready', '5837531NnYJkP', 'remaining-time', '437222yjKJbY', 'Retrying\x20status\x20update\x20(', 'log', '48ufFvYW', 'textContent', 'ไม่สามารถบันทึกสถานะได้\x20กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต', '306WVzfaP', 'loadVideoByUrl', 'dotStart', '7807680XHaLsV', 'document', 'src', 'removeClass', '6nFtrmk', 'display', 'none', 'getCurrentTime', 'split', 'PAUSED', 'floor', '#index-', '443890HtCFLL', 'status-certificate', 'WRONG_DURATION', 'PlayerState', 'sidebar', 'videoFrame', 'getPlayerState', '/e-learning/Enroll2/itemStatus.asmx/ExtendSession', 'status-', 'getDuration', 'D93B3330-98E9-49CA-8792-819EA3EC1A5E', 'stopVideo', 'ajax', 'innerText', 'json', 'POST', '&Index=', '29808uiiOtx', 'block', 'getElementById', 'extend\x20session\x20on\x20', 'PLAYING', 'dotFinish', 'contentFrame', 'error', 'classList', 'ENDED', 'item-finish', 'width', 'Player', 'percentStatus', 'disabled', 'SUCCESS', 'video\x20playing', 'Status\x20update\x20failed:', 'className', 'padStart', 'responseText', 'L2UtbGVhcm5pbmcvRW5yb2xsMi9pdGVtU3RhdHVzLmFzbXgvVXBkYXRlU3RhdHVzV2l0aFRva2Vu', '/e-learning/Enroll2/DownloadFile.aspx?ItemId=', '/e-learning/Enroll2/Test.aspx?ItemId=', '900470aVLNgY', '5192056VWwrib', 'style', 'data', 'video\x20ended', 'active'];
    a0_0x54a5 = function() {
        return _0x3df2c8;
    }
    ;
    return a0_0x54a5();
}
function updateRemainingTime() {
    const _0x3b98b2 = a0_0x5b38;
    let _0x568e6d = player[_0x3b98b2(0x159)]()
      , _0x3eb7b5 = player['getDuration']()
      , _0x5e5fe9 = _0x3eb7b5 - _0x568e6d
      , _0x3457da = Math['floor'](_0x5e5fe9 / 0x3c)
      , _0x199017 = Math['floor'](_0x5e5fe9 % 0x3c)
      , _0x2ff6e5 = formatDuration2(_0x5e5fe9);
    document[_0x3b98b2(0x171)](_0x3b98b2(0x148))[_0x3b98b2(0x16b)] = '[\x20' + _0x2ff6e5 + '\x20]',
    player[_0x3b98b2(0x164)]() == YT[_0x3b98b2(0x161)][_0x3b98b2(0x173)] && setTimeout(updateRemainingTime, 0x3e8);
}
function heartBeat() {
    const _0x23b02e = a0_0x5b38;
    let _0x5ec13f = _0x23b02e(0x165)
      , _0x1b87e3 = '';
    $[_0x23b02e(0x16a)]({
        'type': _0x23b02e(0x16d),
        'url': _0x5ec13f,
        'contentType': 'application/json;\x20charset=utf-8',
        'data': _0x1b87e3,
        'dataType': _0x23b02e(0x16c),
        'success': function() {
            const _0x42446b = _0x23b02e;
            console[_0x42446b(0x14b)](_0x42446b(0x172) + new Date());
        },
        'error': function(_0x4cc598, _0x200b30, _0x149ce5) {
            const _0x2d15b8 = _0x23b02e;
            console[_0x2d15b8(0x14b)](_0x4cc598[_0x2d15b8(0x13b)]),
            console[_0x2d15b8(0x14b)](_0x200b30),
            console['log'](_0x149ce5);
        }
    });
}
function a0_0x5b38(_0x201f79, _0x500d0b) {
    _0x201f79 = _0x201f79 - 0x139;
    const _0x54a540 = a0_0x54a5();
    let _0x5b382d = _0x54a540[_0x201f79];
    return _0x5b382d;
}
function updateItemStatus(_0x12f0c1, _0x473a76, _0x17dbf7, _0x58da39, _0x1e2d25, _0xa3ea15=0x0) {
    const _0x4251db = a0_0x5b38
      , _0x25d1be = 0x3
      , _0x2a3291 = 0x7d0;
    let _0x58efa6 = atob(_0x4251db(0x13c))
      , _0x3964f4 = {
        'itemId': _0x12f0c1,
        'token': _0x473a76,
        'status': _0x17dbf7,
        'duration': _0x58da39
    };
    $[_0x4251db(0x16a)]({
        'type': _0x4251db(0x16d),
        'url': _0x58efa6,
        'contentType': 'application/json;\x20charset=utf-8',
        'data': JSON[_0x4251db(0x145)](_0x3964f4),
        'dataType': _0x4251db(0x16c),
        'timeout': 0x2710,
        'success': function(_0x16eff7) {
            _0x1e2d25 && _0x1e2d25(_0x16eff7);
        },
        'error': function(_0x1cceeb, _0x460c94, _0x41c109) {
            const _0x66dccc = _0x4251db;
            console['error'](_0x66dccc(0x180), _0x460c94, _0x41c109),
            _0xa3ea15 < _0x25d1be ? (console[_0x66dccc(0x14b)](_0x66dccc(0x14a) + (_0xa3ea15 + 0x1) + '/' + _0x25d1be + ')...'),
            setTimeout(function() {
                updateItemStatus(_0x12f0c1, _0x473a76, _0x17dbf7, _0x58da39, _0x1e2d25, _0xa3ea15 + 0x1);
            }, _0x2a3291)) : (console[_0x66dccc(0x176)]('Max\x20retries\x20reached.\x20Status\x20update\x20failed\x20permanently.'),
            alert(_0x66dccc(0x14e)));
        }
    });
}
