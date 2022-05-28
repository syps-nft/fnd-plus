// listener for onClick, then execute content script

// onboarding
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: "onboarding.html",
    });
  }
});


/**
 * Web request listener
 * 
 * Sources:
 * https://stackoverflow.com/a/48134114
 * https://www.moesif.com/blog/technical/apirequest/How-We-Captured-AJAX-Requests-with-a-Chrome-Extension/
 */


 const toExecute = () => (function(xhr) {

  var XHR = XMLHttpRequest.prototype;

  const fetch = window.fetch

  window.fetch = function(resource, init) {
    return Promise.resolve(fetch.apply(window, [resource, init])).then(res => {

      res.json().then(r => {
        console.info(r)


        if (r.pageProps?.artwork) {
          window.postMessage({ artworks: [r.pageProps.artwork]}, "https://foundation.app")
        }


        return r
      }).catch(err => console.error(err))
      console.info("in finally")
      console.info(resource, res)

      return res
    })
}

  var open = XHR.open;
  var send = XHR.send;
  var setRequestHeader = XHR.setRequestHeader;



  XHR.open = function(method, url) {
      this._method = method;
      this._url = url;
      this._requestHeaders = {};
      this._startTime = (new Date()).toISOString();


      console.info(method, url)

      return open.apply(this, arguments);
  };

  XHR.setRequestHeader = function(header, value) {
      this._requestHeaders[header] = value;
      return setRequestHeader.apply(this, arguments);
  };

  XHR.send = function(postData) {

      console.info(this._url, this._requestHeaders)

      this.addEventListener('load', function() {
          var endTime = (new Date()).toISOString();

          var myUrl = this._url ? this._url.toLowerCase() : this._url;
          if(myUrl) {
              if (postData) {
                  if (typeof postData === 'string') {
                      try {
                          // here you get the REQUEST HEADERS, in JSON format, so you can also use JSON.parse
                          this._requestHeaders = postData;    
                      } catch(err) {
                          console.log('Request Header JSON decode failed, transfer_encoding field could be base64');
                          console.log(err);
                      }
                  } else if (typeof postData === 'object' || typeof postData === 'array' || typeof postData === 'number' || typeof postData === 'boolean') {
                      console.info("Here's the postData:")
                      console.info(postData)
                  }
              }

              // here you get the RESPONSE HEADERS
              var responseHeaders = this.getAllResponseHeaders();

              const collectionPattern = /\/[a-zA-Z0-9]+\/(\d+).json/

              console.info(this._method, this._url)
              if (this.response.responseType == "json") {
                console.info("Found json")
                console.info(this._url)
              }

              if (collectionPattern.test(myUrl) || myUrl.endsWith(".json")) {
                console.info("Test pattern matched")
                console.info(this.response)
              } else if (this.responseType == 'blob') {
                this.response.text()
                  .then((txt) => {
                    const { query } = JSON.parse(postData)
                    const { data } = JSON.parse(txt);
                    if (query.includes("query UserArtworksCreated")) {
                      window.postMessage(data, "https://foundation.app")
                    }
                    
                    if (data.user?.isAdmin === false) {
                      data.user.isAdmin = true
                    }
                  })
              } 


          }
      });

      return send.apply(this, arguments);
  };

})(XMLHttpRequest);



/**
 * - get request-response
 * - if UserArtworksCreated,
 * - for each artwork, note reserve and buy now price
 * - if buy now price is set, add reserve price to respective card with jquery
 */

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text == "what is my tab_id?") {
    console.info("executing...");

    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ["/js/lib/jquery.js"],
      world: "MAIN"
    }, (res) => {
      console.info("jquery injected", res)
    })

    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        function: toExecute,
        world: "MAIN"
      },
      (res) => {
        console.info("Injection done.", res);
      }
    );
    sendResponse({ tab: sender.tab.id });
  }
});
