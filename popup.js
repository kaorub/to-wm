// Send message to content.js
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {msg: "popup clicked"}, function(response) {
    return false;
  });
});
// Listen messages from content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var url = sender.url;
  var info = '<strong><a href="' + url + '">' + url + '</a>'; 
  if (!isEmpty(request)) {
    info +=  ' -  WalkMe enabled</strong><br>'
    for (var key in request) {
      if (key !== 'json')
        info += '<strong>' + key + '</strong>: ' + request[key] + '<br>'
      else {
        getTxt(request[key]);
      }
    }
  } else {
    info += ' - Doesn\'t contain the walkme code</strong><br>'
  }
  document.getElementById("script_info").innerHTML = info;  
});
// Check if object is empty
function isEmpty(obj) {
  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          return false;
  }
  return true && JSON.stringify(obj) === JSON.stringify({});
}
// Looking for inner object contained the key
function getObject(obj, ekey) {
  var result = null;
  if (obj instanceof Array) {
    for (var i = 0; i < obj.length; i++) {
      result = getObject(obj[i], ekey);
      if (result) {
        break;
      }   
    }
  }
  else
  {
    for (var prop in obj) {
      if (prop == ekey) {
        return obj[ekey];
      }
      if (obj[prop] instanceof Object || obj[prop] instanceof Array) {
        result = getObject(obj[prop], ekey);
        if (result) {
          break;
        }
      } 
    }
  }
  return result;
}

function infoElement(key, value_in_key) {
  console.log(value_in_key);
  var result = '<strong>'+key+'</strong>:';
  if (typeof value_in_key === 'object') {
    if (value_in_key instanceof Array) {
      for (var i=0; i<value_in_key.length; i++) {
        console.log(i, value_in_key[i]);
        result += infoElement(i, value_in_key[i]);
      }
    }
    else if (value_in_key instanceof Object) {
      for (var prop in value_in_key) {
        result += infoElement(prop, value_in_key);
      }
    }
        // result += prop + ':' + value_in_key[prop]
    // {

    // }
    // result += obj[ekey][0].url
  }
  result += value_in_key
  return result;
}

function getTxt(script_src) {
  var xhr = new XMLHttpRequest();
  var txt_obj;
  xhr.onload = function() {
    var regexp_obj = /{.*}/;
    var res_obj = xhr.responseText;
    txt_obj = res_obj.match(regexp_obj)[0];
    txt_obj = txt_obj.replace(/'/g, "\"");
    txt_obj = JSON.parse(txt_obj);
    var e = document.createElement('p');
    e.innerHTML = infoElement('LibFile', getObject(txt_obj, 'LibFile'));
    e.innerHTML += infoElement('DataFiles', getObject(txt_obj, 'DataFiles'));
    e.innerHTML += infoElement('languages', getObject(txt_obj, 'languages'));
    document.getElementById("settings").appendChild(e);
  }
  xhr.onerror = function() {
    txt_obj.error = 'error';
  };
  xhr.open("GET", script_src, true);
  xhr.send();
  return txt_obj;
}