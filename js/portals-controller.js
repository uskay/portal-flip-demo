/**
 * Portal Controller
 * Controlling all the portal related features
 */
class PortalController {

    /**
     * Constructor
     * @param {Object} option 
     */
    constructor(pageList) {
        this.option = {
            pageList: pageList,
            upperFrontSelector: "#upperFold .front",
            upperBackSelector: "#upperFold .back",
            lowerFrontSelector: "#lowerFold .front",
            lowerBackSelector: "#lowerFold .back",
            nextPortalSelector: "#nextPortal",
            prevPortalSelector: "#prevPortal"
        };
    }

    /**
     * Init the page
     */
    init() {
        const {
            pageList, 
            upperFrontSelector, 
            upperBackSelector, 
            lowerFrontSelector, 
            lowerBackSelector,
            nextPortalSelector,
            prevPortalSelector
        } = this.option;

        // Append flip elements
        this._createFlip();

        // Save page list
        this.pageList = pageList;

        // Init flags
        this.isTransitioning = false;
        this.initDone = false;

        // Add contents to the upper front div and lower front div as Shadow DOM
        this._appendShadowDom([upperFrontSelector, lowerFrontSelector], location.pathname);

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
            const nextPortal = this._createPortal(this.pageList[location.pathname].next);
            const lowerBackPortal = nextPortal.cloneNode();
            this._appendPortal(nextPortalSelector, nextPortal);
            this._appendPortal(lowerBackSelector, lowerBackPortal);
        }
        if(this._hasPrevPage()){
            const prevPortal = predecessor ? predecessor :
                this._createPortal(this.pageList[location.pathname].prev);
            const upperBackPortal = prevPortal.cloneNode(upperBackSelector);
            this._appendPortal(prevPortalSelector, prevPortal);
            this._appendPortal(upperBackSelector, upperBackPortal);
        }
        this._hookEvents();
        this.initDone = true;
    }

    _createFlip() {
        const div = document.createElement('div');
        const flipElements = `
            <div id="upperFold">
                <div class="front"></div>
                <div class="back"></div>
            </div>
            <div id="lowerFold">
                <div class="front"></div>
                <div class="back"></div>
            </div>
            <div id="nextPortal"></div>
            <div id="prevPortal"></div>
        `
        div.innerHTML = flipElements;
        document.body.appendChild(div);
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
        return this.pageList[location.pathname].next !== undefined;
    }

    /**
     * Checks if the page has a prev page
     * @returns {boolean}
     */
    _hasPrevPage() {
        return this.pageList[location.pathname].prev !== undefined;
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
            document.querySelector(selector).parentNode.style.transition = "all 0.5s ease-in-out";
            document.querySelector(selector).parentNode.style.transform = "rotate3d(1, 0, 0, 180deg)";
            if(selector === lowerFrontSelector) {
                document.querySelector(upperFrontSelector).parentNode.style.zIndex = 1;
                document.querySelector(lowerFrontSelector).parentNode.style.zIndex = 2;
                document.querySelector(nextPortalSelector).style.zIndex = 0;
                document.querySelector(nextPortalSelector).style.opacity = 1;
                document.querySelector(prevPortalSelector).style.opacity = 0;
                this.activatePortal = document.querySelector(`${nextPortalSelector} portal`);
                return;
            }
            document.querySelector(upperFrontSelector).parentNode.style.zIndex = 2;
            document.querySelector(lowerFrontSelector).parentNode.style.zIndex = 1;
            document.querySelector(prevPortalSelector).style.zIndex = 0;
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

// The list of pages to flip
const pageList = {
    '/fuji.html': {
        prev: '/tokyotower.html',
        next: '/okinawa.html'
    },
    '/okinawa.html': {
        prev: '/fuji.html',
        next: '/tokyotower.html'
    },
    '/tokyotower.html': {
        prev: '/okinawa.html',
        next: '/fuji.html'
    },
}

// If Portals is available Start flippping ;-)
if ('HTMLPortalElement' in window) {
    const controller = new PortalController(pageList);
    controller.init();
} else {
    // Else, just show the page
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';
}
