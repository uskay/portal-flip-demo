/**
 * Portal Controller
 * Controlling all the portal related features
 */
class PortalController {

    /**
     * Constructor
     * @param {Object} option 
     */
    constructor(option) {
        this.option = option;
    }

    /**
     * Init the page
     */
    init() {
        const {
            currentPageIndex, 
            pageList, 
            upperFrontSelector, 
            upperBackSelector, 
            lowerFrontSelector, 
            lowerBackSelector,
            nextPortalSelector,
            prevPortalSelector
        } = this.option;

        // Save page related values
        this.currentPageIndex = currentPageIndex;
        this.pageList = pageList;

        // Init flags
        this.isTransitioning = false;
        this.initDone = false;

        // Add contents to the upper front div and lower front div as Shadow DOM
        this._appendShadowDom([upperFrontSelector, lowerFrontSelector], pageList[currentPageIndex]);

        // If it's the inital page load
        if(!window.portalHost) {
            this.initTransition();
        } else {
            // If it was a transition from a flip
            window.addEventListener("portalactivate", evt => {
                // TODO: fix to use the predecessor in the future;
                this.initTransition();
            });
        }
    }

    /**
     * Adding transitions
     * @param {HTMPPortalElement} predecessor 
     */
    initTransition(predecessor) {        
        const {
            currentPageIndex, 
            pageList, 
            upperFrontSelector, 
            upperBackSelector, 
            lowerFrontSelector, 
            lowerBackSelector,
            nextPortalSelector,
            prevPortalSelector
        } = this.option;
        if(this._hasNextPage()) {
            const nextPortal = this._createPortal(`${location.origin + location.pathname}?page=${currentPageIndex+1}`);
            const lowerBackPortal = nextPortal.cloneNode();
            this._appendPortal(nextPortalSelector, nextPortal);
            this._appendPortal(lowerBackSelector, lowerBackPortal);
        }
        if(this._hasPrevPage()){
            const prevPortal = predecessor ? predecessor :
                this._createPortal(`${location.origin + location.pathname}?page=${currentPageIndex-1}`);
            const upperBackPortal = prevPortal.cloneNode(upperBackSelector);
            this._appendPortal(prevPortalSelector, prevPortal);
            this._appendPortal(upperBackSelector, upperBackPortal);
        }
        this._hookEvents();
        this.initDone = true;
    }

    /**
     * Creating a HTMLPortalElement from a give src
     * @param {String} src 
     * @returns {HTMLPortalElement}
     */
    _createPortal(src) {
        const portal = document.createElement('portal');
        portal.src = src;
        return portal;
    }

    /**
     * Appending Portal to given root
     * @param {String} querySelectorExpression 
     * @param {HTMLPortalElement} portal 
     */
    _appendPortal(querySelectorExpression, portal) {
        document.querySelector(querySelectorExpression).appendChild(portal);
    }

    /**
     * Appending Shadow DOM to the given root
     * Used to show the front side of the flip
     * @param {Array} selectorList 
     * @param {String} src 
     */
    _appendShadowDom(selectorList, src) {
        const createShadowDiv = body => {
            const div = document.createElement('div');
            const shadowRoot = div.attachShadow({mode: "open"});
            shadowRoot.innerHTML = body;
            return div;
        }
        fetch(src).then(res => {
            res.text().then(body => {
                const shadowDiv = createShadowDiv(body);
                selectorList.map(selector => {
                    const shadowDiv = createShadowDiv(body);
                    document.querySelector(selector).appendChild(shadowDiv);
                })
            })
        })
    }

    /**
     * Checks if the page has a next page
     * @returns {boolean}
     */
    _hasNextPage() {
        return this.pageList.length > this.currentPageIndex + 1;
    }

    /**
     * Checks if the page has a prev page
     * @returns {boolean}
     */
    _hasPrevPage() {
        return this.currentPageIndex > 0;
    }

    /**
     * Adding event listeners
     */
    _hookEvents() {
        const {
            upperFrontSelector, 
            lowerFrontSelector, 
            nextPortalSelector,
            prevPortalSelector
        } = this.option;

        const addTransition = (selector) => {            
            if(this.isTransitioning){
                // preventing multiple clicks
                return;
            }
            this.transitionSelector = selector;
            this.isTransitioning = true;
            document.querySelector(selector).parentNode.style.zIndex = 1;
            document.querySelector(selector).parentNode.style.transition = "all 0.5s ease-in-out";
            document.querySelector(selector).parentNode.style.transform = "rotate3d(1, 0, 0, 180deg)";
            if(selector === lowerFrontSelector) {
                document.querySelector(nextPortalSelector).style.opacity = 1;
                document.querySelector(prevPortalSelector).style.opacity = 0;
                this.activatePortal = document.querySelector(`${nextPortalSelector} portal`);
                return;
            }
            document.querySelector(nextPortalSelector).style.opacity = 0;
            document.querySelector(prevPortalSelector).style.opacity = 1;
            this.activatePortal = document.querySelector(`${prevPortalSelector} portal`);
            
        }

        if(this._hasNextPage()) {
            document.querySelector(lowerFrontSelector).addEventListener('click', evt => {
                addTransition(lowerFrontSelector);
            });
        }
        if(this._hasPrevPage()) {
            document.querySelector(upperFrontSelector).addEventListener('click', evt => {
                addTransition(upperFrontSelector);
            });
        }
        
        window.addEventListener("transitionend", evt => {
            const {
                upperFrontSelector, 
                lowerFrontSelector, 
                nextPortalSelector,
                prevPortalSelector
            } = this.option;
            if (evt.propertyName == "transform") {
                this.activatePortal.activate().then(_ => {
                    // TODO: a good timing to reset the style
                })
            }
        });
        

    }
}

// Retrieving the current page index from the query parameter 
const getCurrentPageIndex = _ => {
    const matchResult = location.search.match(/\?page=(\d)/);
    if(matchResult && matchResult[1]) {
       return parseInt(matchResult[1]); 
    } else {
       return 0;
    }
}
const currentPageIndex = getCurrentPageIndex();

// The list of pages to flip
const pageList = [
    '/view/red.html',
    '/view/blue.html',
    '/view/yellow.html'
]

// Init options
const options = {
    currentPageIndex: currentPageIndex,
    pageList: pageList,
    upperFrontSelector: "#upperFold .front",
    upperBackSelector: "#upperFold .back",
    lowerFrontSelector: "#lowerFold .front",
    lowerBackSelector: "#lowerFold .back",
    nextPortalSelector: "#nextPortal",
    prevPortalSelector: "#prevPortal"
}

// Start flippping ;-)
const controller = new PortalController(options);
controller.init();