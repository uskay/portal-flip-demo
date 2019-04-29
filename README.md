# portal-flip-demo
This demo demonstrates how Portals can enable a seamless user experience among first party pages with flip animation.

![hero_gif](https://cdn.glitch.com/98449704-33d8-49b2-88f2-aa6d2aeba5d3%2Fflip.gif?1556541399740)

## Runnig the demo
### 1. Run the app
```bash
$ git clone --depth 1 https://github.com/uskay/portal-flip-demo.git
$ cd portal-flip-demo
$ npm install
$ npm run demo
```
### 2. Play around with it ;-)
- Access [http://localhost:8080/fuji.html](http://localhost:8080/fuji.html)
- Click on the top half of the page to move to the previous page
- Click on the bottom half of the page to move to the next page

## Explainer
![explainer](https://cdn.glitch.com/98449704-33d8-49b2-88f2-aa6d2aeba5d3%2Fportal-flip-explainer-fix.png?1556549030930)
- `js/portals-controller.js` dynamically adds 6 flip panels
- The upper fold (
  - front: fetching current page && adding the top half of the cloned page as a Shadow DOM
  - back: prev page Portal's top half
- The lower fold
  - front: fetching current page && adding the bottom half of the cloned page as a Shadow DOM
  - back: prev page Portal's bottom half)
- Portals (Next Portal and Prev Portal. Dynamically hide/show with user interaction)

## Nice to have
- Add Service Worker to prefetch and cache the pages
- Use adoptPredecessor for the prev Portal (The demo is not using the predecessor HTMLPortalElement as is)

## Disclaimer
The code base is built for demo purpose only (non production ready code). The demo is using [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) (Shadow DOM v1) and written in ES6 syntax. To make the demo simple, it is not transpiling to ES5 and also not adding any polyfills. If you access the demo with a browser that does not support Portals, it will simply show the page without any transition effect (and the UI could break).
<br/>
## License
[https://github.com/WICG/portals/blob/master/LICENSE.md](https://github.com/WICG/portals/blob/master/LICENSE.md)