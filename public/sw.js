if(!self.define){let e,n={};const s=(s,i)=>(s=new URL(s+".js",i).href,n[s]||new Promise((n=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=n,document.head.appendChild(e)}else e=s,importScripts(s),n()})).then((()=>{let e=n[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(i,a)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(n[c])return;let t={};const r=e=>s(e,c),d={module:{uri:c},exports:t,require:r};n[c]=Promise.all(i.map((e=>d[e]||r(e)))).then((e=>(a(...e),t)))}}define(["./workbox-e9849328"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"3e1438f86cb396b2f3bfa376775635e5"},{url:"/_next/static/Cwg2iUBeKjhdne19kX4En/_buildManifest.js",revision:"ca292da7a89d913564dcedff40969d69"},{url:"/_next/static/Cwg2iUBeKjhdne19kX4En/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/0.2f92e86448ab5ffb.js",revision:"2f92e86448ab5ffb"},{url:"/_next/static/chunks/147-f854f580ace803e4.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/148-572567f96f8eaf8c.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/204-9ceaeae5075b3175.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/282-9a50455c7f8f3a9d.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/300-6485afc936c4b562.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/301-33a0f57dc808ccc6.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/352-4febea057054dc3e.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/373.2a923d8acfbf6bec.js",revision:"2a923d8acfbf6bec"},{url:"/_next/static/chunks/542-91df926e982c730f.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/699-ae256d49ad7873cf.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/811.a8669f55c626bd36.js",revision:"a8669f55c626bd36"},{url:"/_next/static/chunks/884-0df4a46bf9b2dfce.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/a77bd59e-772348982be24872.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/_not-found/page-b91c6df87f31b7d7.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/auth/login/page-15d5fe956a6d859b.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/auth/signup/page-b3e2575b4323f905.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/blog/%5BarticleId%5D/page-afb9bccc9032ac59.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/blog/author/%5BauthorId%5D/page-73bd7b41408a54be.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/blog/category/%5BcategoryId%5D/page-4b22a1f450386da9.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/blog/layout-4f7d016c93c9c100.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/blog/page-803d38492e32f909.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/layout-82c757b317c90e67.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/page-5808d3f553834b99.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/profile/%5Bid%5D/page-5be563c80a06b33d.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/profile/edit/page-2d1895046884fbb7.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/profile/friends/page-9f945d044d424b09.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/profile/page-a775d068809b7d8c.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/profile/reviews/%5Bid%5D/edit/page-d6afe6a56637dda1.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/profile/reviews/%5Bid%5D/page-f1a6701c0fbfa90f.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/profile/reviews/new/page-2e8bb9d24013a72a.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/dashboard/profile/reviews/page-7eedd1a5ca78732d.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/error-515cc288eb771922.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/invite/page-ed664f1662361cae.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/layout-e4c144655aac1185.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/not-found-4206e2ce5db040e7.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/onboarding/page-be9e5f0e4e852d41.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/page-86e55ac7ef6cf325.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/privacy-policy/page-040ce016ded83ac2.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/app/tos/page-00b6fc39ba62d090.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/ed48eaa7.af733910b5dfcdee.js",revision:"af733910b5dfcdee"},{url:"/_next/static/chunks/framework-472eef658406059b.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/main-8f42add30aabfcac.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/main-app-e0d815a2012c333e.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/pages/_app-e96698151ddb3dcd.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/pages/_error-d8d2e55c1c08a91d.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-d18d24d6f46e4012.js",revision:"Cwg2iUBeKjhdne19kX4En"},{url:"/_next/static/css/48340cfe5c3cfec7.css",revision:"48340cfe5c3cfec7"},{url:"/_next/static/css/4d6a040505950e5e.css",revision:"4d6a040505950e5e"},{url:"/_next/static/css/fc1c9daac70c093b.css",revision:"fc1c9daac70c093b"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/_next/static/media/header.ecc0b0bd.png",revision:"235c9c94640bd410841ebff6931d2a44"},{url:"/_next/static/media/icon.686d80de.png",revision:"ec2b3c3d2a0418986c1f7ab1a377351e"},{url:"/_next/static/media/layers-2x.9859cd12.png",revision:"9859cd12"},{url:"/_next/static/media/layers.ef6db872.png",revision:"ef6db872"},{url:"/_next/static/media/marc.ba452a56.png",revision:"f3b6de2dbdf0acde0fa55ece00181574"},{url:"/_next/static/media/marker-icon.d577052a.png",revision:"d577052a"},{url:"/blog/introducing-supabase/header.png",revision:"235c9c94640bd410841ebff6931d2a44"},{url:"/envolope.png",revision:"ba566828f7000f2686f3c9fb4f7ef02f"},{url:"/mainfest.json",revision:"382efa39711ab681954a8dac077f6e0b"},{url:"/pb/cornelie.jpg",revision:"80aa00d7d8c52861fc20954732311d0f"},{url:"/pb/frederik.jpg",revision:"799adbcddcdae88007bec45aba5ad862"},{url:"/pb/magnus.jpg",revision:"83d92a18660b73939587af38f885bb09"},{url:"/pb/niels.jpg",revision:"fee019a4be1d77d5ce6ba9b662b90a6c"},{url:"/pb/tejs.jpg",revision:"9da3aaf226d74ecc8d067c40d805514b"},{url:"/person-no-head.png",revision:"a93719f1e3595f2b1c2889113d95e29b"},{url:"/robots.txt",revision:"6384154aa5e8fc12a0de99fc2902084a"},{url:"/sitemap-0.xml",revision:"b597d62d03a1f6a38fa959593acad245"},{url:"/sitemap.xml",revision:"9a2988718f8a55ec0c36e6cbb3d0a7bb"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:n,event:s,state:i})=>n&&"opaqueredirect"===n.type?new Response(n.body,{status:200,statusText:"OK",headers:n.headers}):n}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const n=e.pathname;return!n.startsWith("/api/auth/")&&!!n.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
