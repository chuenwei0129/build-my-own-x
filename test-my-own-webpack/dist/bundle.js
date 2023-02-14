(function(modules) {
	const installedModules = {}
	function __webpack_require__(moduleId) {
		if (installedModules[moduleId]) {
			return installedModules[moduleId].exports
		}
		const module = installedModules[moduleId] = {
			i: moduleId,
			l: false,
			exports: {}
		}
		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)
		module.l = true
		return module.exports
	}
	return __webpack_require__(__webpack_require__.s = './src/index.js')
})({
  
  "./src/index.js":
  (function (module, exports, __webpack_require__) {
    eval(`// css
__webpack_require__("./src/style.css");
const sum = __webpack_require__("./src/sum.js");
const helloWorld = __webpack_require__("./src/world.js");
console.log(sum(4, 5));
console.log(helloWorld);`)
  }),
  
  "./src/style.css":
  (function (module, exports, __webpack_require__) {
    eval(`let style = document.createElement('style');
style.innerHTML = "body {\\n  background-color: #723b3b;\\n}\\n";
document.head.appendChild(style);`)
  }),
  
  "./src/sum.js":
  (function (module, exports, __webpack_require__) {
    eval(`module.exports = function sum(a, b) {
  return a + b;
};`)
  }),
  
  "./src/world.js":
  (function (module, exports, __webpack_require__) {
    eval(`const hello = __webpack_require__("./src/hello/index.js");
module.exports = hello + ' world';`)
  }),
  
  "./src/hello/index.js":
  (function (module, exports, __webpack_require__) {
    eval(`module.exports = 'hello';`)
  }),
  
})