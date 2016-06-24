install:
	@if [ ! -f "$$(which nodemon)" ]; then npm --registry=http://registry.npm.taobao.org install nodemon -g; fi
	@npm --registry=http://registry.npm.taobao.org install

dev: install
	@eslint --fix app.js route.js schemas/*.js services/*.js controllers/*.js
	@nodemon test.js
