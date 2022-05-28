var twitterLogo = `
<svg viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;height:1.2em;margin-right:1.2em"><path d="M27.946 3.33a11.667 11.667 0 0 1-3.296.904 5.784 5.784 0 0 0 2.524-3.176 11.857 11.857 0 0 1-3.648 1.381 5.74 5.74 0 0 0-9.93 3.918c0 .455.053.892.149 1.311-4.772-.225-9.001-2.517-11.832-5.98a5.626 5.626 0 0 0-.777 2.887A5.74 5.74 0 0 0 3.69 9.354a5.722 5.722 0 0 1-2.6-.719v.071a5.743 5.743 0 0 0 4.604 5.632 5.829 5.829 0 0 1-2.58.099 5.76 5.76 0 0 0 5.371 3.987 11.513 11.513 0 0 1-7.119 2.455c-.455 0-.909-.027-1.365-.078a16.327 16.327 0 0 0 8.816 2.577c10.563 0 16.333-8.745 16.333-16.317 0-.244 0-.49-.018-.735 1.121-.804 2.1-1.82 2.87-2.972l-.055-.024Z" fill="currentColor"></path></svg>
`

// window.addEventListener('popstate', e => {
//     console.log('URL hash changed', e);
// });


const sortDropDownComponentHTML = `
<label for="cars">Choose a car:</label>

<select name="cars" id="cars">
  <option value="volvo">Volvo</option>
  <option value="saab">Saab</option>
  <option value="mercedes">Mercedes</option>
  <option value="audi">Audi</option>
</select>
`



/*
 * Monitoring web requests:
 * - Inject script into main web request contex
 * - Script loads XHTML monkey patch to monitor web requests
 * - Request listener manipulates DOM (will need jquery)

*/




const injectSortDropDownComponent = () => {

}

const safeName = (name) => slug(name).toLowerCase()

const maybeAddReservePrice = (_, el) => {
    const title = $(el).find("h2.st--c-PJLV.st--c-kxmHLk.st--c-PJLV-boLyXY-size-3.st--c-PJLV-ijUZctX-css").first()
    const titleSlug = safeName(title.text())
    

    if (artHasBuyNowAndReserve(cache[titleSlug]) && !cache[titleSlug].visited) {
        
        // append reserve price from cache
        const buyNow = $(el).find('div.st--c-PJLV.st--c-bQzyIt.st--c-llVfQI')
        const reserve = buyNow.clone()

        buyNow.parent().css("border-radius", "4px")
        buyNow.parent().css("border", "1px solid red")
        buyNow.parent().css("border-radius", "0")

        reserve.children('div').eq(0).text('Reserve')
        reserve.children('div').eq(1).text(`${cache[titleSlug].activeSalePriceInETH} ETH`)
        
        buyNow.parent().append(reserve)

        console.info("here we are")
        console.info(cache[titleSlug])
        cache[titleSlug].visited = true
    }
}

const addReservePricesToCreatedPage = () => {
    $(".artwork-card").map(maybeAddReservePrice)
}


const addReservePricesToCollectionPage = (titleSlug) => {
    $(".artwork-card").filter(() => {}).map(maybeAddReservePrice)
}


/**
 * Collection artwork url scheme:
 * https://foundation.app/_next/data/32DEcgJH_4hTV1Fi351Le/%40andresgallardo/murallaroja/54.json
 */


const getCreatedGridComponent = () => {
    const artworkCards = [];

    const parentContainer = $(".st--c-PJLV.st--c-PJLV-igqmpwD-css")
    parentContainer.arrive(".artwork-card", function() {
        // 'this' refers to the newly created element
        var x = $(this);
        artworkCards.push(x)

        const link = x.find('a[href*="/superrare/"]').first()
        const artTitle = safeName(link.text())

        const SuperRareLink = x.find('span:contains("SuperRare")').first()

        if (SuperRareLink) {

            if (!link.prop('href')) {
                return;
            }

            const hrefParts = link.prop('href').split("/")

            const superrareId = hrefParts[hrefParts.length - 1]
            console.info("ID:", superrareId)


            const superrareURL = `https://superrare.com/artwork-v2/${artTitle}-${superrareId}`
            console.info(superrareURL)


            console.info(SuperRareLink)
            console.info("Found SuperRare")

            const parent = SuperRareLink.parent().parent().parent()
            parent.append(`<a href="${superrareURL}" target="_blank">[Link]</a>`)

        }
    })

    
}


const updateProfilePage = () => {
    const module = $('a[href^="https://twitter.com"]').first()

    console.info(module)
    console.info("yo")
    module.parent().children().eq(1)?.remove()
    module.parent().height("10em")
    module.parent().css("border-radius", "4px")
    module.parent().css("border", "1px solid red")
    module.parent().css("border-radius", "0")
    module.parent().css("width", "100%")
    module.css("display", "block")

    var handle = module.children().eq(1).text()

    console.info(handle)
    const clone = module.clone().empty().width("100%").css("visibility", "visible").css("border-radius", "0px")


    module.css("visibility", "hidden")
    module.width("0px")

    clone.append(twitterLogo)
    clone.append(`<p>${handle}</p>`)

    clone.appendTo(module.parent())

    
    console.info("First Grid component:")
    getCreatedGridComponent()
}
// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       // listen for messages sent from background.js
//       console.log("request:")
//       console.log(request)
//       updateProfilePage()
//   });

// let lastUrl = location.href; 
// MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
// const URLRegExp = new RegExp("^https://foundation.app/@[a-zA-Z0-9.\\-_]+(?:\\?tab=.+)?$")

// var observer = new MutationObserver(function(mutations, observer) {

//     // fired when a mutation occurs
//     if (location.href !== lastUrl) {
//         lastUrl = location.href
//         console.info("new url:", lastUrl)
//         // it seems url gets updated before dom so target element is not changed when 
//         // this first fires - need to somehow wait until page load
//         const match = lastUrl.match(URLRegExp)

//         if (match) {
//             let handle = lastUrl.slice(lastUrl.indexOf('@'))
//             console.info("Handle is", handle)
//             setTimeout(()=>updateProfilePage(handle),1000)
//         }
//     }
//     // ...
// });

// define what element should be observed by the observer
// and what types of mutations trigger the callback
// observer.observe(document, {
//   subtree: true,
//   attributes: true,
//   childList: true
//   //...
// });

// first load
updateProfilePage()



chrome.runtime.sendMessage({ text: "what is my tab_id?" }, ({tab}) => {
    console.log('My tabId is', tab);
});

const cache = {}


const artHasBuyNowAndReserve = (art) => {
    if (!art) {
        return false;
    }

    return art.buyNows.map(({status}) => status).includes("OPEN") && art.activeSalePriceInETH
}

const updateCache = (artworks) => {
    artworks.map((art) => {
        // don't add if it's already in the cache
        if (!cache[safeName(art.name)]) {
            cache[safeName(art.name)] = art
        }
     })
}

window.addEventListener("message", (event) => {
    if (event.origin === "https://foundation.app" && event.data.artworks) {
        console.info("Updating cache...")
        console.info("data:", event.data)
        updateCache(event.data.artworks)
        console.info("Cache:", cache)
        addReservePricesToCreatedPage()
    }
})


