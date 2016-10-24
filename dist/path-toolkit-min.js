!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):e.PathToolkit=r()}(this,function(){"use strict";var e=function(e){return e}(),r="*",t="undefined",n="string",o="parent",s="root",i="placeholder",a="context",f="property",c="collection",u="singlequote",l="doublequote",p="call",h="evalProperty",x=function(e,t){var n=(e.indexOf(r),e.split(r,2)),o=!0;if(n[0]){if(n[0]===e)return n[0]===t;o=o&&t.substr(0,n[0].length)===n[0]}return n[1]&&(o=o&&t.substr(-1*n[1].length)===n[1]),o},y=function(e){return typeof e===t||null===e?!1:"function"==typeof e||"object"==typeof e},w=function(e){var r;return typeof e!==n?e&&!0:(r=e.toUpperCase(),"TRUE"===r||"YES"===r||"ON"===r)},v=function(e,r){var t=new RegExp(e,"g");return e+r.replace(t,"\\"+e)+e},d=function(d){var g,C,P,E,O,m,b,A,S,j,k,R,q=this,D={},F={},T=function(){g=Object.keys(F.prefixes),C=Object.keys(F.separators),P=Object.keys(F.containers),E=P.map(function(e){return F.containers[e].closer}),O="",Object.keys(F.separators).forEach(function(e){F.separators[e].exec===f&&(O=e)}),m="",Object.keys(F.containers).forEach(function(e){F.containers[e].exec===u&&(m=e)}),b="[\\\\"+[r].concat(g).concat(C).concat(P).join("\\").replace("\\"+O,"")+"]",A=new RegExp(b),S="[\\\\\\"+[r].concat(g).concat(C).concat(P).concat(E).join("\\")+"]",j=new RegExp(S,"g"),k=new RegExp("\\"+S.replace(/^\[/,"[^")),R=new RegExp("\\"+r)},U=function(){F=F||{},F.useCache=!0,F.simple=!1,F.force=!1,F.prefixes={"<":{exec:o},"~":{exec:s},"%":{exec:i},"@":{exec:a}},F.separators={".":{exec:f},",":{exec:c}},F.containers={"[":{closer:"]",exec:f},"'":{closer:"'",exec:u},'"':{closer:'"',exec:l},"(":{closer:")",exec:p},"{":{closer:"}",exec:h}}},$=function(t){var o="",s=[],i=[],a={},p=0,h="",x=!1,y="",w=0,v="",d="",g="",C=[],P=0,E=0;if(F.useCache&&D[t]!==e)return D[t];if(o=t.replace(k,"$&".substr(1)),p=o.length,typeof t===n&&!A.test(t))return s=o.split(O),F.useCache&&(D[t]=s),s;for(w=0;p>w;w++){if(E||"\\"!==o[w]||(E=w+1,w++),o[w]===r&&(x=!0),P>0)if(!E&&o[w]===v&&v!==d.closer&&P++,!E&&o[w]===d.closer&&P--,P>0)y+=o[w];else{if(p>w+1&&F.separators[o[w+1]]&&F.separators[o[w+1]].exec===c){if(i=$(y),i===e)return;C.push({t:i,exec:d.exec})}else if(C[0]){if(i=$(y),i===e)return;C.push({t:i,exec:d.exec}),s.push(C),C=[]}else if(d.exec===f){if(i=$(y),i===e)return;s=s.concat(i)}else if(d.exec===u||d.exec===l)s.push(y);else{if(i=$(y),i===e)return;s.push({t:i,exec:d.exec})}y=""}else if(!E&&o[w]in F.prefixes&&F.prefixes[o[w]].exec)a.has=!0,a[F.prefixes[o[w]].exec]?a[F.prefixes[o[w]].exec]++:a[F.prefixes[o[w]].exec]=1;else if(!E&&F.separators.hasOwnProperty(o[w])&&F.separators[o[w]].exec){if(g=F.separators[o[w]],!h&&(a.has||x))return;h&&(a.has||x)&&(h={w:h,mods:a},a={}),g.exec===f?C[0]!==e?(h&&C.push(h),s.push(C),C=[]):h&&s.push(h):g.exec===c&&h&&C.push(h),h="",x=!1}else!E&&F.containers.hasOwnProperty(o[w])&&F.containers[o[w]].exec?(d=F.containers[o[w]],h&&(a.has||x)&&(h={w:h,mods:a},a={}),C[0]!==e?h&&C.push(h):h&&s.push(h),h="",x=!1,v=o[w],P++):p>w&&(h+=o[w]);p>w&&w===E&&(E=0)}return E||(h&&(a.has||x)&&(h={w:h,mods:a},a={}),C[0]!==e?(h&&C.push(h),s.push(C)):h&&s.push(h),0!==P)?void 0:(F.useCache&&(D[t]=s),s)},N=function(r,t,o,s,i){var a,f,c,u=o!==e,l=[],y=0,w=0,v=1,d=0,g=r,C="",P=0,E="",O=0,m=r,b=!1,A=0,S="";if(typeof t===n){if(F.useCache&&D[t])l=D[t];else if(l=$(t),l===e)return}else l=t.t?t.t:[t];if(y=l.length,0!==y){for(w=y-1,i?v=i.length:i=[r];g!==e&&y>O;){if(C=l[O],b=u&&O===w,typeof C===n){if(u)if(b){if(m[C]=o,m[C]!==o)return}else F.force&&(Array.isArray(g)?m[C]!==e:!m.hasOwnProperty(C))&&(m[C]={});f=m[C]}else if(C===e)f=void 0;else if(Array.isArray(C))for(f=[],P=C.length,d=0;P>d;d++){if(a=N(m,C[d],o,s,i.slice()),a===e)return;b?C[d].t&&C[d].exec===h?m[a]=o:f=f.concat(a):f=C[d].t&&C[d].exec===h?f.concat(m[a]):f.concat(a)}else if(C.w){if(E=C.w+"",C.mods.parent&&(m=i[v-1-C.mods.parent],m===e))return;if(C.mods.root&&(m=i[0],i=[m],v=1),C.mods.placeholder){if(A=E-1,s[A]===e)return;E=s[A].toString()}if(C.mods.context){if(A=E-1,s[A]===e)return;f=s[A]}else if(m[E]!==e)b&&(m[E]=o),f=m[E];else if("function"==typeof m)f=E;else{if(!(R.test(E)>-1))return;f=[];for(S in m)m.hasOwnProperty(S)&&x(E,S)&&(b&&(m[S]=o),f.push(m[S]))}}else C.exec===h?(b&&(m[N(m,C,e,s,i.slice())]=o),f=m[N(m,C,e,s,i.slice())]):C.exec===p&&(C.t&&C.t.length?(c=N(m,C,e,s),f=c===e?m.apply(i[v-2]):Array.isArray(c)?m.apply(i[v-2],c):m.call(i[v-2],c)):f=m.call(i[v-2]));i.push(f),v++,m=f,g=f,O++}return m}},V=function(r,t,n){var o=n!==e,s=[],i=0,a=0;for(s=t.split(O),a=s.length;r!==e&&a>i;){if(""===s[i])return;o&&(i===a-1?r[s[i]]=n:F.force&&(Array.isArray(r)?r[s[i]]!==e:!r.hasOwnProperty(s[i]))&&(r[s[i]]={})),r=r[s[i++]]}return r},Y=function(r,t,n){for(var o=n!==e,s=0,i=t.length;null!=r&&i>s;){if(""===t[s])return;o&&(s===i-1?r[t[s]]=n:F.force&&(Array.isArray(r)?r[t[s]]!==e:!r.hasOwnProperty(t[s]))&&(r[t[s]]={})),r=r[t[s++]]}return r},z=function(e,r,t,n){var o,s,i,a,f;if(n=n?n:"",e===r)return t(n);if(Array.isArray(e)){for(s=e.length,o=0;s>o;o++)if(i=z(e[o],r,t,n+O+o),!i)return;return!0}if(y(e)){for(a=Object.keys(e),s=a.length,s>1&&(a=a.sort()),o=0;s>o;o++)if(e.hasOwnProperty(a[o])&&(f=a[o],j.test(f)&&(f=v(m,f)),i=z(e[a[o]],r,t,n+O+f),!i))return;return!0}return!0};q.getTokens=function(e){var r=$(e);if(typeof r!==t)return{t:r}},q.isValid=function(e){return typeof $(e)!==t},q.escape=function(e){return e.replace(j,"\\$&")},q.get=function(e,r){var t,o=0,s=arguments.length;if(typeof r===n&&!A.test(r))return V(e,r);if(Object.hasOwnProperty.call(r,"t")&&Array.isArray(r.t)){for(o=r.t.length-1;o>=0;o--)if(typeof r.t[o]!==n){if(t=[],s>2)for(o=2;s>o;o++)t[o-2]=arguments[o];return N(e,r,void 0,t)}return Y(e,r.t)}if(t=[],s>2)for(o=2;s>o;o++)t[o-2]=arguments[o];return N(e,r,void 0,t)},q.set=function(r,t,o){var s,i,a=0,f=arguments.length,c=!1;if(typeof t!==n||A.test(t))if(Object.hasOwnProperty.call(t,"t")&&Array.isArray(t.t)){for(a=t.t.length-1;a>=0;a--)if(!c&&typeof t.t[a]!==n){if(s=[],f>3)for(a=3;f>a;a++)s[a-3]=arguments[a];i=N(r,t,o,s),c=!0}c||(i=Y(r,t.t,o))}else{if(f>3)for(s=[],a=3;f>a;a++)s[a-3]=arguments[a];i=N(r,t,o,s)}else i=V(r,t,o),c=!0;return Array.isArray(i)?-1===i.indexOf(void 0):i!==e},q.find=function(e,r,t){var n=[],o=function(e){return n.push(e.substr(1)),t&&"one"!==t?!0:(n=n[0],!1)};return z(e,r,o),n[0]?n:void 0};var B=function(e,r,t,n){var o="";Object.keys(e).forEach(function(t){e[t].exec===r&&(o=t)}),delete e[o],e[t]={exec:r},n&&(e[t].closer=n)},G=function(e){var r={};typeof e===n&&1===e.length||(e="."),r[e]={exec:f},F.prefixes={},F.containers={},F.separators=r};q.setOptions=function(e){if(e.prefixes&&(F.prefixes=e.prefixes,D={}),e.separators&&(F.separators=e.separators,D={}),e.containers&&(F.containers=e.containers,D={}),typeof e.cache!==t&&(F.useCache=!!e.cache),typeof e.simple!==t){var r=F.useCache,n=F.force;F.simple=w(e.simple),F.simple?G():(U(),F.useCache=r,F.force=n),D={}}typeof e.force!==t&&(F.force=w(e.force)),T()},q.setCache=function(e){F.useCache=w(e)},q.setCacheOn=function(){F.useCache=!0},q.setCacheOff=function(){F.useCache=!1},q.setForce=function(e){F.force=w(e)},q.setForceOn=function(){F.force=!0},q.setForceOff=function(){F.force=!1},q.setSimple=function(e,r){var t=F.useCache,n=F.force;F.simple=w(e),F.simple?(G(r),T()):(U(),T(),F.useCache=t,F.force=n),D={}},q.setSimpleOn=function(e){F.simple=!0,G(e),T(),D={}},q.setSimpleOff=function(){var e=F.useCache,r=F.force;F.simple=!1,U(),T(),F.useCache=e,F.force=r,D={}},q.setSeparatorProperty=function(e){if(typeof e!==n||1!==e.length)throw new Error("setSeparatorProperty - invalid value");if(e===r||F.separators[e]&&F.separators[e].exec!==f||F.prefixes[e]||F.containers[e])throw new Error("setSeparatorProperty - value already in use");B(F.separators,f,e),T(),D={}},q.setSeparatorCollection=function(e){if(typeof e!==n||1!==e.length)throw new Error("setSeparatorCollection - invalid value");if(e===r||F.separators[e]&&F.separators[e].exec!==c||F.prefixes[e]||F.containers[e])throw new Error("setSeparatorCollection - value already in use");B(F.separators,c,e),T(),D={}},q.setPrefixParent=function(e){if(typeof e!==n||1!==e.length)throw new Error("setPrefixParent - invalid value");if(e===r||F.prefixes[e]&&F.prefixes[e].exec!==o||F.separators[e]||F.containers[e])throw new Error("setPrefixParent - value already in use");B(F.prefixes,o,e),T(),D={}},q.setPrefixRoot=function(e){if(typeof e!==n||1!==e.length)throw new Error("setPrefixRoot - invalid value");if(e===r||F.prefixes[e]&&F.prefixes[e].exec!==s||F.separators[e]||F.containers[e])throw new Error("setPrefixRoot - value already in use");B(F.prefixes,s,e),T(),D={}},q.setPrefixPlaceholder=function(e){if(typeof e!==n||1!==e.length)throw new Error("setPrefixPlaceholder - invalid value");if(e===r||F.prefixes[e]&&F.prefixes[e].exec!==i||F.separators[e]||F.containers[e])throw new Error("setPrefixPlaceholder - value already in use");B(F.prefixes,i,e),T(),D={}},q.setPrefixContext=function(e){if(typeof e!==n||1!==e.length)throw new Error("setPrefixContext - invalid value");if(e===r||F.prefixes[e]&&F.prefixes[e].exec!==a||F.separators[e]||F.containers[e])throw new Error("setPrefixContext - value already in use");B(F.prefixes,a,e),T(),D={}},q.setContainerProperty=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerProperty - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==f||F.separators[e]||F.prefixes[e])throw new Error("setContainerProperty - value already in use");B(F.containers,f,e,t),T(),D={}},q.setContainerSinglequote=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerSinglequote - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==u||F.separators[e]||F.prefixes[e])throw new Error("setContainerSinglequote - value already in use");B(F.containers,u,e,t),T(),D={}},q.setContainerDoublequote=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerDoublequote - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==l||F.separators[e]||F.prefixes[e])throw new Error("setContainerDoublequote - value already in use");B(F.containers,l,e,t),T(),D={}},q.setContainerCall=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerCall - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==p||F.separators[e]||F.prefixes[e])throw new Error("setContainerCall - value already in use");B(F.containers,p,e,t),T(),D={}},q.setContainerEvalProperty=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerProperty - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==h||F.separators[e]||F.prefixes[e])throw new Error("setContainerEvalProperty - value already in use");B(F.containers,h,e,t),T(),D={}},q.resetOptions=function(){U(),T(),D={}},U(),T(),d&&q.setOptions(d)};return d});
//# sourceMappingURL=path-toolkit-min.js.map