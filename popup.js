// Check if object is empty
function isEmpty(obj) {
  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          return false;
  }
  return true && JSON.stringify(obj) === JSON.stringify({});
}
// Looking for inner object contained the key and return the value in this key
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
// Create information for element
function details(key, value_in_key) {
  var result = '<p><strong>'+key+'</strong>: ';
  if (typeof value_in_key === 'object') {
    if (value_in_key instanceof Array) {
      for (var i=0; i<value_in_key.length; i++) {
        result += details(i, value_in_key[i]);
      }
    }
    else {
      for (var prop in value_in_key) {
        result += details(prop, value_in_key[prop]);
      }
    }
  } else
    result += value_in_key + '</p>'
  return result;
}
// Get settings.txt file from remote resource
function getTxt(script_src) {
  var xhr = new XMLHttpRequest();
  var txt_obj;
  xhr.onload = function() {
    var regexp_obj = /{.*}/;
    var res_obj = xhr.responseText;
    txt_obj = res_obj.match(regexp_obj)[0] || '';
    txt_obj = txt_obj.replace(/'/g, "\""); // replace ' with "
    txt_obj = JSON.parse(txt_obj);
    var e = document.createElement('p');
    // place the detailes into element: call the details function with
    // detail name and the value of that detail (can be string and either object or array)
    e.innerHTML = details('LibFile', getObject(txt_obj, 'LibFile'));
    e.innerHTML += details('DataFiles', getObject(txt_obj, 'DataFiles'));
    e.innerHTML += details('languages', getObject(txt_obj, 'languages'));
    document.getElementById("settings").appendChild(e);
  }
  xhr.onerror = function() {
    txt_obj.error = 'error';
  };
  xhr.open("GET", script_src, true);
  xhr.send();
  return txt_obj;
}
// Send message to content.js
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {msg: "popup clicked"}, function(response) {
    return false;
  });
});
// Listen messages from content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var url = sender.url;
  var info = '<b><a href="' + url + '">' + url + '</a>'; 
  if (!isEmpty(request)) {
    info +=  '-  WalkMe enabled</b><div><strong>Details:</strong>'
    for (var key in request) {
      if (key !== 'json')
        info += '<p><strong>' + key + '</strong>: ' + request[key] + '</p>'
      else {
        getTxt(request[key]);
      }
    }
  } else {
    info += ' - Doesn\'t contain the walkme code</b>'
  }
  info += '</div>';
  document.getElementById("script_info").innerHTML = info;  
});