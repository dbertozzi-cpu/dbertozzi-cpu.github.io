// Assume JQuery not available for embedded player
function hideTranscriptionDownload(url) {
  if (url.trim() === ''){
    document.getElementById("downloadTranscription").style.display = "none";
    document.getElementById("downloadSubtitles").style.display = "none";
    vjsDownloadsButtons = document.querySelectorAll('.vjs-downloads-button');
    vjsDownloadsButtons.forEach(item => item.style.display = "none");
  } else {
    var populateDownloadLinks = function(e) {
      e.stopPropagation();
      getSubs(url, e);
    }
    document.getElementById("downloadTranscription").addEventListener("click", populateDownloadLinks, false);
    document.getElementById("downloadSubtitles").addEventListener("click", populateDownloadLinks, false);
  }
}

function getSubs(file, e) {
  a = document.getElementById('downloadTranscription');
  if(!a.href.startsWith('blob')) {
    var reqTrans = new XMLHttpRequest();
    reqTrans.open('GET', file);
    reqTrans.onreadystatechange = function () {
      if (reqTrans.readyState == 4 && (reqTrans.status == 200 || reqTrans.status == 0)) {
        var content = reqTrans.responseText;
        generateTranscription(content, e);
      }
    };
    reqTrans.send(null);
  }
}

function generateTranscription(vtt, e) {
  var subs = subtitlesToTranscription(vtt);
  var dup = subs.flatMap(sub => {if (sub && sub.content) {return sub.content.split('\n')}});
  dup.unshift('');
  var text = dup.reduce((acc, cur, idx, arr) => arr[idx-1] === cur ? acc : [...acc, cur]).join('\n');
  var title = document.querySelector('.video-information > span.title').textContent;
  var added = document.querySelector('.video-information > span.added').textContent.substr(9);
  text = title + ', automated transcript\n' + added + '\n---\n\n' + text;
  var transcriptionFile = new Blob([text], {type: "text/plain"});
  var subtitleFile = new Blob([vtt], {type: "text/vtt"});
  var name = title + '-' + added;
  var aTranscription = document.getElementById('downloadTranscription');
  aTranscription.href = URL.createObjectURL(transcriptionFile);
  aTranscription.download = name + '.txt';
  var aSubtitle = document.getElementById('downloadSubtitles');
  aSubtitle.href = URL.createObjectURL(subtitleFile);
  aSubtitle.download = name + '.vtt';
  e.target.click();
}

// based on paella subs parsing code
function subtitlesToTranscription(content) {
  var captions = [];
  var self = this;
  var lls = content.split("\n");
  var c;
  var id = 0;
  var skip = false;
  for (var idx = 0; idx < lls.length; ++idx) {
      var ll = lls[idx].trim();
      if ((/^WEBVTT/.test(ll) && c === undefined) || ll.length === 0) {
          continue;
      }
      if ((/^[0-9]+$/.test(ll) || /^[0-9]+ -/.test(ll)) && lls[idx - 1].trim().length === 0) {
          continue;
      }
      if (/^NOTE/.test(ll) || /^STYLE/.test(ll)) {
          skip = true;
          continue;
      }
      if (/^(([0-9]+:)?[0-9]{2}:[0-9]{2}.[0-9]{3} --> ([0-9]+:)?[0-9]{2}:[0-9]{2}.[0-9]{3})/.test(ll)) {
          skip = false;
          if (c != undefined) {
              captions.push(c);
              id++;
          }
          c = {
              id: id,
              begin: self.parseTimeTextToSeg(ll.split("-->")[0]),
              end: self.parseTimeTextToSeg(ll.split("-->")[1]),
          }
          continue;
      }
      if (c !== undefined && !skip) {
          ll = ll.replace(/^- /, "");
          ll = ll.replace(/<[^>]*>/g, "");
          if (c.content === undefined) {
              c.content = ll;
          } else {
              c.content += "\n" + ll;
          }
      }
  }
  captions.push(c);
  return captions;
}

function  parseTimeTextToSeg(ttime) {
  var nseg = 0;
  var factor = 1;
  ttime = /(([0-9]+:)?[0-9]{2}:[0-9]{2}.[0-9]{3})/.exec(ttime);
  var split = ttime[0].split(":");
  for (var i = split.length - 1; i >= 0; i--) {
      factor = Math.pow(60, (split.length - 1 - i));
      nseg += split[i] * factor;
  }
  return nseg;
}
