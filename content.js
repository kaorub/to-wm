// content.js

// Regex-pattern to check URLs consists of "walkme_"
function isWalkme(script_src) {
	// var regexp = /^https?:\/\/.*\/walkme_.+/;
  var regexp = /[^(scripts)]\/walkme_(.*)(?=_).*\.js/
  // var regexp = /(?(?=.*\/scripts\/.*)walkme_(.*)(?=_).*\.js)/;
  return script_src.match(regexp)
}
// Get ID in matched URL
function getId(script_src) {
  var regexp = /walkme_(.*)(?=_).*\.js/;
  return script_src.match(regexp)?script_src.match(regexp)[1]:''
}
// Get protocol in matched URL
function isHttps(script_src) {
  var regexp = /^(https):\/\//;
  return script_src.match(regexp)?'True':'False'
}
// Check if test or env
function getEnv(script_src) {
  var regexp = /test/;
  return script_src.match(regexp) ? 'Test' : 'Production'
}
// Get hostname
function getHost(script_src) {
  var regexp = /\/\/([^\/]*)\//;
  return script_src.match(regexp)?script_src.match(regexp)[1]:''
}
function isTxt(script_src) {
  var regexp = /(.*settings\.txt)/;
  return script_src.match(regexp)?script_src.match(regexp)[1]:''
}
// Listen for messages from popup
chrome.extension.onMessage.addListener(function(results) {  // Listen for results
  var scripts = document.getElementsByTagName('script');
  var i;
  var obj_info = {};
  var script;
  var isWalkmeScript = false;
  // Looking for scripts tag with walkme source
  for (i = 0; i < scripts.length; ++i) {
    script = scripts[i].src || '';
    if (isWalkme(script)) {
      isWalkmeScript = true;
      obj_info['User_id'] = getId(script);
      obj_info['Is Https'] = isHttps(script);
      obj_info['Env'] = getEnv(script);
      obj_info['Host'] = getHost(script);
      obj_info['async'] = scripts[i].async ? 'True' : 'False';
      break;
    }
  }
  // In case of script was found looking for settings.txt URL
  if (isWalkmeScript) {
    for (i = 0; i < scripts.length; ++i) {
      script = scripts[i].src || '';
      if (isTxt(script)) {
        obj_info['json'] = isTxt(script);
        break;
      }
    }
  }
  chrome.runtime.sendMessage(obj_info, function(response) {
    return false
  });
});